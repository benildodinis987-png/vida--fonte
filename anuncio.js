/* ==========================================================================
   SISTEMA DE NOTIFICAÇÕES DINÂMICAS COM DATAS EXACTAS (escript.gb.js)
   ========================================================================== */

let indiceAlertaAtual = 0;
let listaNotificacoesGlobais = [];
let intervaloCarrossel = null;

document.addEventListener("DOMContentLoaded", () => {
    carregarAlertasAutomaticos();
});

// 1. LEITURA INTELIGENTE DO CADASTRO ('dadosBebe' ou 'usuario')
function obterDadosCadastrados() {
    let dados = JSON.parse(localStorage.getItem("dadosBebe"));
    if (!dados) {
        dados = JSON.parse(localStorage.getItem("usuario"));
    }

    return {
        nome: (dados && dados.nome) ? dados.nome : "Bebê",
        dataNascimento: (dados && dados.dataNascimento) ? dados.dataNascimento : (dados && dados.dataNasc ? dados.dataNasc : "2024-01-01")
    };
}

// 2. CÁLCULO DE DATAS
function adicionarMeses(dataBase, meses) {
    let d = new Date(dataBase);
    d.setMonth(d.getMonth() + meses);
    return d.toLocaleDateString('pt-PT');
}

// 3. MONITORAMENTO E GERAÇÃO DE NOTIFICAÇÕES
function carregarAlertasAutomaticos() {
    const alertaContainer = document.getElementById("real");
    if (!alertaContainer) return;

    const cadastro = obterDadosCadastrados();
    const medicoes = JSON.parse(localStorage.getItem("medicoes")) || [];

    const hoje = new Date();
    const nascimento = new Date(cadastro.dataNascimento);
    
    let idadeMeses = (hoje.getFullYear() - nascimento.getFullYear()) * 12 + (hoje.getMonth() - nascimento.getMonth());
    if (hoje.getDate() < nascimento.getDate()) idadeMeses--;
    idadeMeses = Math.max(0, idadeMeses);

    listaNotificacoesGlobais = [];

    // A. MONITORAMENTO DE PESO E SAÚDE
    if (medicoes.length > 0) {
        const ultimaMedicao = medicoes[medicoes.length - 1];
        const dataUltima = new Date(ultimaMedicao.data);
        const proximoControlo = new Date(dataUltima);
        proximoControlo.setDate(proximoControlo.getDate() + 30);
        const dataFormatadaControlo = proximoControlo.toLocaleDateString('pt-PT');

        if (ultimaMedicao.statusEvolucao === "descida") {
            listaNotificacoesGlobais.push(`🚨 <strong>Alerta Clínico:</strong> ${cadastro.nome} teve uma queda no crescimento na medição de ${ultimaMedicao.data}. Reforce a alimentação! Proxima pesagem recomendada até <strong>${dataFormatadaControlo}</strong>.`);
        } else if (ultimaMedicao.braco && ultimaMedicao.braco < 11.5) {
            listaNotificacoesGlobais.push(`🚨 <strong>Atenção Vermelha:</strong> O braço de ${cadastro.nome} (${ultimaMedicao.braco}cm) indica risco nutricional grave. Visite o posto até <strong>${dataFormatadaControlo}</strong>.`);
        } else if (ultimaMedicao.peso && ultimaMedicao.altura) {
            listaNotificacoesGlobais.push(`✅ <strong>Saúde em dia:</strong> ${cadastro.nome} está com ${ultimaMedicao.peso}kg em ${ultimaMedicao.data}. Próxima pesagem agendada para <strong>${dataFormatadaControlo}</strong>.`);
        }
    } else {
        const dataAmanha = new Date();
        dataAmanha.setDate(dataAmanha.getDate() + 1);
        listaNotificacoesGlobais.push(`📌 <strong>Registo Pendente:</strong> Nenhuma medição registada para ${cadastro.nome}. Agende a 1ª pesagem para <strong>${dataAmanha.toLocaleDateString('pt-PT')}</strong>.`);
    }

    // B. CALENDÁRIO DE VACINAS COM DATAS EXACTAS
    const proximaVacina = obterProximaVacinaEData(nascimento, idadeMeses);
    if (proximaVacina) {
        listaNotificacoesGlobais.push(`💉 <strong>Agenda de Vacinação:</strong> ${cadastro.nome} tem agendada a vacina <strong>${proximaVacina.nome}</strong> para o dia <strong>${proximaVacina.data}</strong>.`);
    }

    // C. AGENDAMENTO DE CONSULTA DE ROTINA
    let dataConsulta = new Date();
    if (idadeMeses <= 12) {
        dataConsulta.setMonth(dataConsulta.getMonth() + 1);
        listaNotificacoesGlobais.push(`🩺 <strong>Consulta Mensal:</strong> Próxima consulta de acompanhamento do(a) ${cadastro.nome} marcada para <strong>${dataConsulta.toLocaleDateString('pt-PT')}</strong>.`);
    } else if (idadeMeses <= 24) {
        dataConsulta.setMonth(dataConsulta.getMonth() + 3);
        listaNotificacoesGlobais.push(`🩺 <strong>Consulta Trimestral:</strong> Próximo check-up de desenvolvimento agendado para <strong>${dataConsulta.toLocaleDateString('pt-PT')}</strong>.`);
    } else {
        dataConsulta.setMonth(dataConsulta.getMonth() + 6);
        listaNotificacoesGlobais.push(`🩺 <strong>Consulta Semestral:</strong> Próximo exame de rotina agendado para <strong>${dataConsulta.toLocaleDateString('pt-PT')}</strong>.`);
    }

    // INICIAR EXIBIÇÃO DINÂMICA
    iniciarCarrosselAlertas(alertaContainer, cadastro.nome);
}

// 4. TABELA DE VACINAS COM CÁLCULO DE DATA EXACTA
function obterProximaVacinaEData(dataNasc, mesesAtuais) {
    const cronograma = [
        { mes: 0, nome: "BCG e Hepatite B" },
        { mes: 2, nome: "Penta (1ª dose), Polio VIP, Rotavírus" },
        { mes: 3, nome: "Meningocócica C (1ª dose)" },
        { mes: 4, nome: "Penta (2ª dose), Polio VIP, Rotavírus" },
        { mes: 5, nome: "Meningocócica C (2ª dose)" },
        { mes: 6, nome: "Penta (3ª dose), Polio VIP" },
        { mes: 9, nome: "Febre Amarela" },
        { mes: 12, nome: "Tríplice Viral (1ª dose), Pneumocócica" },
        { mes: 15, nome: "DTP (1º Reforço), Polio VOP, Hepatite A" },
        { mes: 48, nome: "DTP (2º Reforço), Varicela" }
    ];

    let proxima = cronograma.find(item => item.mes >= mesesAtuais);
    if (!proxima) proxima = cronograma[cronograma.length - 1];

    const dataPrevista = adicionarMeses(dataNasc, proxima.mes);
    return { nome: proxima.nome, data: dataPrevista };
}

// 5. ANIMAÇÃO DINÂMICA (UM POR UM)
function iniciarCarrosselAlertas(container, nomeBebe) {
    if (listaNotificacoesGlobais.length === 0) return;

    if (intervaloCarrossel) clearInterval(intervaloCarrossel);

    function exibirProximo() {
        const mensagemAtual = listaNotificacoesGlobais[indiceAlertaAtual];
        
        container.innerHTML = `
            <div class="alert-title">🚨 Notificações de Saúde (${nomeBebe})</div>
            <div class="alert-box" style="
                margin-top: 8px; 
                transition: opacity 0.5s ease-in-out; 
                animation: fadeIn 0.6s ease-in-out;
            ">
                ${mensagemAtual}
            </div>
            <div style="text-align: right; font-size: 10px; color: #64748b; margin-top: 4px;">
                Alerta ${indiceAlertaAtual + 1} de ${listaNotificacoesGlobais.length}
            </div>
        `;

        indiceAlertaAtual = (indiceAlertaAtual + 1) % listaNotificacoesGlobais.length;
    }

    // Estilo CSS de Animação
    if (!document.getElementById("animacao-alerta-style")) {
        const style = document.createElement("style");
        style.id = "animacao-alerta-style";
        style.innerHTML = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-5px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }

    exibirProximo();
    // Alterna o alerta a cada 4 segundos
    intervaloCarrossel = setInterval(exibirProximo, 4000);
}

// 6. ANÚNCIO E NAVEGAÇÃO
const ad = document.getElementById("adOverlay");
const video = document.getElementById("adVideo");
const closeBtn = document.getElementById("closeAd");

if (ad && !sessionStorage.getItem("adShown")) {
    ad.style.display = "flex";
    sessionStorage.setItem("adShown", "true");

    if (closeBtn) {
        closeBtn.onclick = () => {
            ad.style.display = "none";
            if (video) video.pause();
        };
    }

    setTimeout(() => {
        ad.style.display = "none";
        if (video) video.pause();
    }, 7270);

    if (video) {
        video.onended = () => {
            ad.style.display = "none";
        };
    }
} else if (ad) {
    ad.style.display = "none";
}

function toggleMenu() {
    let menu = document.getElementById("menu");
    if (!menu) return;
    menu.style.display = (menu.style.display === "block") ? "none" : "block";
}

function irParaPlayer(video, titulo) {
    window.location.href = "viiii.html?video=" + encodeURIComponent(video) + "&titulo=" + encodeURIComponent(titulo);
}

document.querySelectorAll(".thumbnail-container video").forEach(v => {
    v.addEventListener("mouseenter", () => { v.play().catch(() => {}); });
    v.addEventListener("mouseleave", () => { v.pause(); v.currentTime = 0; });
});
