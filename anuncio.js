document.addEventListener("DOMContentLoaded", () => {
    carregarAlertasAutomaticos();
});

function carregarAlertasAutomaticos() {
    const alertaBox = document.getElementById("real");
    if (!alertaBox) return;

    // Recupera dados salvos do bebê
    const cadastro = JSON.parse(localStorage.getItem("dadosBebe")) || {
        nome: "Bebê",
        dataNascimento: "2024-01-01" // Data padrão caso não exista cadastro
    };
    
    const medicoes = JSON.parse(localStorage.getItem("medicoes")) || [];

    // Calcula idade em meses
    const hoje = new Date();
    const nascimento = new Date(cadastro.dataNascimento);
    const idadeMeses = Math.floor((hoje - nascimento) / (1000 * 60 * 60 * 24 * 30.44));

    let listaNotificacoes = [];

    // 1. Monitoramento de Peso e Saúde
    if (medicoes.length > 0) {
        const ultimaMedicao = medicoes[medicoes.length - 1];
        const imc = ultimaMedicao.peso / ((ultimaMedicao.altura / 100) ** 2);

        if (imc < 14) {
            listaNotificacoes.push(`🚨 <strong>Atenção!</strong> O peso de ${cadastro.nome} está abaixo do ideal. Reforce a suplementação.`);
        } else if (imc > 18) {
            listaNotificacoes.push(`⚠️ <strong>Alerta Nutricional:</strong> ${cadastro.nome} está acima do peso recomendado para a idade.`);
        } else {
            listaNotificacoes.push(`✅ <strong>Saúde em dia:</strong> ${cadastro.nome} está com o peso e altura ideais.`);
        }
    } else {
        listaNotificacoes.push(`📌 <strong>Registo Pendente:</strong> Nenhuma medição recente encontrada. Registe o peso e altura.`);
    }

    // 2. Calendário de Vacinas Automático (0 aos 6 anos)
    const vacinaPendente = verificarVacinas(idadeMeses);
    if (vacinaPendente) {
        listaNotificacoes.push(`💉 <strong>Vacina Pendente:</strong> ${vacinaPendente}`);
    }

    // 3. Agendamento de Consultas de Rotina
    if (idadeMeses <= 12) {
        listaNotificacoes.push(`🩺 <strong>Consulta Mensal:</strong> Acompanhamento de rotina recomendado para este mês.`);
    } else if (idadeMeses <= 24 && idadeMeses % 3 === 0) {
        listaNotificacoes.push(`🩺 <strong>Consulta Trimestral:</strong> Hora do check-up de desenvolvimento.`);
    } else if (idadeMeses > 24 && idadeMeses % 6 === 0) {
        listaNotificacoes.push(`🩺 <strong>Consulta Semestral:</strong> Exame de rotina aos ${Math.floor(idadeMeses / 12)} anos.`);
    }

    // Renderização dos Alertas na Página Inicial
    alertaBox.innerHTML = `
        <div class="alert-title">🚨 Painel de Acompanhamento do Bebê (${cadastro.nome})</div>
        ${listaNotificacoes.map(item => `<div class="alert-box" style="margin-top:8px;">${item}</div>`).join('')}
    `;
}

// Tabela de Vacinação Nacional (0 a 6 anos)
function verificarVacinas(meses) {
    if (meses === 0) return "BCG e Hepatite B (Ao nascer)";
    if (meses === 2) return "Penta (1ª dose), Polio VIP (1ª dose), Rotavírus (1ª dose)";
    if (meses === 3) return "Meningocócica C (1ª dose)";
    if (meses === 4) return "Penta (2ª dose), Polio VIP (2ª dose), Rotavírus (2ª dose)";
    if (meses === 5) return "Meningocócica C (2ª dose)";
    if (meses === 6) return "Penta (3ª dose), Polio VIP (3ª dose)";
    if (meses === 9) return "Febre Amarela";
    if (meses === 12) return "Tríplice Viral (1ª dose), Pneumocócica (Reforço)";
    if (meses === 15) return "DTP (1º Reforço), Polio VOP, Hepatite A";
    if (meses === 48) return "DTP (2º Reforço), Polio VOP, Varicela (4 anos)";
    return null;
}


const ad = document.getElementById("adOverlay");
const video = document.getElementById("adVideo");
const closeBtn = document.getElementById("closeAd");

// verificar se já mostrou o anúncio nesta sessão
if (!sessionStorage.getItem("adShown")) {

    ad.style.display = "flex"; // ou block, depende do seu CSS
    sessionStorage.setItem("adShown", "true");

    // fechar manual
    closeBtn.onclick = () => {
        ad.style.display = "none";
        video.pause();
    };

    // fechar automático após 7.3s
    setTimeout(() => {
        ad.style.display = "none";
        video.pause();
    }, 7270);

    // fechar quando video terminar
    video.onended = () => {
        ad.style.display = "none";
    };

} else {
    // se já mostrou, garante que fique escondido
    ad.style.display = "none";
}

// MENU

function toggleMenu(){
  let menu = document.getElementById("menu");

  if(menu.style.display === "block"){
      menu.style.display = "none";
  }else{
      menu.style.display = "block";
  }
}



function irParaPlayer(video, titulo) {
            // Redireciona corretamente para o ficheiro VIDIOSS.HTML passando as variáveis organizadas
            window.location.href = "viiii.html?video=" + encodeURIComponent(video) + "&titulo=" + encodeURIComponent(titulo);
        }

        // Efeito premium: Reproduz automaticamente uma pré-visualização rápida ao passar o rato
        document.querySelectorAll(".thumbnail-container video").forEach(v => {
            v.addEventListener("mouseenter", () => {
                v.play().catch(e => console.log("Autoplay suspenso"));
            });
            v.addEventListener("mouseleave", () => {
                v.pause();
                v.currentTime = 0; // Volta ao início para manter o aspeto limpo
            });
        });
