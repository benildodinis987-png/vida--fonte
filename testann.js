// Carrega dados salvos no navegador (localStorage)
let medicoes = JSON.parse(localStorage.getItem("medicoes")) || [];
let dadosBebe = JSON.parse(localStorage.getItem("dadosBebe")) || { dataNascimento: "2024-01-01" };

window.onload = function() {
    renderizarCaminhadaEvolutiva();
    atualizarHistorico();
    if (medicoes.length > 0) {
        const ult = medicoes[medicoes.length - 1];
        realizarAvaliacaoSaude(ult);
    }
};

// Calcula a idade exata em meses comparando com a data de nascimento
function calcularIdadeEmMeses(dataMedicao, dataNasc) {
    const inicio = new Date(dataNasc);
    const fim = new Date(dataMedicao);
    let meses = (fim.getFullYear() - inicio.getFullYear()) * 12 + (fim.getMonth() - inicio.getMonth());
    if (fim.getDate() < inicio.getDate()) meses--;
    return Math.max(0, meses);
}

function formatarIdade(meses) {
    if (meses < 1) return "Recém-nascido";
    if (meses < 12) return `${meses} m`;
    const anos = Math.floor(meses / 12);
    const sob = meses % 12;
    return `${anos}a ${sob}m`;
}

function registrarMedicao() {
    const data = document.getElementById("data").value;
    const peso = parseFloat(document.getElementById("peso").value);
    const altura = parseFloat(document.getElementById("altura").value);
    const braco = parseFloat(document.getElementById("braco").value);
    const cranio = parseFloat(document.getElementById("cranio")?.value || 0);

    if (!data || isNaN(peso) || isNaN(altura) || isNaN(braco)) {
        alert("Eish, mamã! Preenche a data, peso, altura e braço do mwanene direitinho, tá bom?");
        return;
    }

    const mesesIdade = calcularIdadeEmMeses(data, dadosBebe.dataNascimento);
    const idadeTexto = formatarIdade(mesesIdade);
    
    let statusEvolucao = "progresso";

    // Verifica se os valores são inferiores aos anteriores (Descida / Alerta)
    if (medicoes.length > 0) {
        const ultima = medicoes[medicoes.length - 1];
        if (peso < ultima.peso || altura < ultima.altura) {
            statusEvolucao = "descida";
        }
    }

    const novaMedicao = { 
        data, 
        peso, 
        altura, 
        braco, 
        cranio, 
        mesesIdade, 
        idade: idadeTexto, 
        statusEvolucao 
    };

    medicoes.push(novaMedicao);
    localStorage.setItem("medicoes", JSON.stringify(medicoes));

    renderizarCaminhadaEvolutiva();
    atualizarHistorico();
    realizarAvaliacaoSaude(novaMedicao);
    limparCampos();
}

// Renderiza a caminhada com descida e alteração de cor para vermelho
function renderizarCaminhadaEvolutiva() {
    const containerGrafico = document.getElementById("grafico");
    
    if (medicoes.length === 0) {
        containerGrafico.innerHTML = "<p style='text-align:center; padding: 25px; color: #666;'>Mamã, regista a primeira medição para ver o mwanene a subir!</p>";
        return;
    }

    const ultimaMedicao = medicoes[medicoes.length - 1];
    const totalMedicoes = medicoes.length;
    
    // Se houve descida nos valores, a cor muda para VERMELHO
    const ehDescida = ultimaMedicao.statusEvolucao === "descida";
    const corCaminho = ehDescida ? "#e53e3e" : "#27ae60";

    // Cálculo do progresso no gráfico
    let progressoX = Math.min((totalMedicoes - 1) * 12, 75);
    let progressoY = Math.min((totalMedicoes - 1) * 10, 70); 

    // Ajuste em caso de descida de peso/altura
    if (ehDescida && totalMedicoes > 1) {
        progressoY = Math.max(0, progressoY - 15); // Faz o boneco descer visualmente
    }

    const escala = Math.min(1 + (ultimaMedicao.mesesIdade * 0.015), 1.35);

    let html = `
        <style>
            @keyframes animPerna { 0%, 100% { transform: rotate(-15deg); } 50% { transform: rotate(15deg); } }
            @keyframes subidaCorpo { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-4px); } }
            
            .perna-esq { animation: animPerna 0.6s infinite ease-in-out; transform-origin: 42px 105px; }
            .perna-dir { animation: animPerna 0.6s infinite ease-in-out reverse; transform-origin: 58px 105px; }
            .corpo-bebe-subindo { animation: subidaCorpo 0.4s infinite ease-in-out; cursor: pointer; }
            
            .balao-fala {
                display: none;
                position: absolute;
                bottom: 115px;
                background: #ffffff;
                border: 2px solid ${corCaminho};
                border-radius: 12px;
                padding: 8px 12px;
                font-size: 11px;
                font-weight: bold;
                color: #1e293b;
                box-shadow: 0 6px 12px rgba(0,0,0,0.15);
                width: 200px;
                text-align: center;
                z-index: 10;
            }
            .balao-fala::after {
                content: '';
                position: absolute;
                bottom: -8px;
                left: 50%;
                transform: translateX(-50%);
                border-width: 8px 8px 0;
                border-style: solid;
                border-color: #ffffff transparent;
                display: block;
                width: 0;
            }
        </style>

        <div style="position: relative; padding: 20px 10px; background: #f8fafc; border-radius: 12px; overflow: hidden; min-height: 260px;">
            
            <p style="text-align:center; font-size:11px; color:#64748b; margin-top:0;">
                💡 <i>Toca no mwanene para ouvir a voz dele, mamã!</i>
            </p>

            <!-- Rampa do Gráfico -->
            <div style="
                position: absolute; 
                bottom: 40px; 
                left: 5%; 
                width: 85%; 
                height: 10px; 
                background: #cbd5e1; 
                border-radius: 6px; 
                transform: rotate(-10deg); 
                transform-origin: left bottom;
            ">
                <div style="
                    position: absolute; 
                    left: 0; 
                    top: 0; 
                    height: 100%; 
                    width: ${progressoX + 15}%; 
                    background: ${corCaminho}; 
                    border-radius: 6px; 
                    transition: all 0.6s ease;
                "></div>
            </div>

            <!-- Contentor do Bebé -->
            <div style="
                position: absolute; 
                bottom: calc(45px + ${progressoY}px); 
                left: calc(5% + ${progressoX}%); 
                transition: all 0.6s ease;
                display: flex;
                flex-direction: column;
                align-items: center;
                transform: scale(${escala});
                transform-origin: bottom center;
            ">
                <div id="balaoFala" class="balao-fala"></div>

                <div class="corpo-bebe-subindo" onclick="falarBebeBrincalhao()" style="width: 65px; height: 95px;">
                    <svg viewBox="0 0 100 150" width="100%" height="100%">
                        <g transform="rotate(-10, 50, 30)">
                            <circle cx="50" cy="28" r="22" fill="#fca5a5" />
                            <circle cx="30" cy="30" r="4" fill="#fca5a5" />
                            <path d="M 33 18 Q 50 6 67 18 Q 50 13 33 18 Z" fill="#78350f" />
                            <circle cx="60" cy="24" r="2.5" fill="#1e293b" />
                            <path d="M 54 34 Q 60 38 65 32" stroke="#1e293b" stroke-width="2" fill="none" />
                        </g>
                        
                        <path d="M 32 52 L 68 48 L 64 90 L 36 90 Z" fill="#38bdf8" />
                        <path d="M 35 90 L 65 90 L 65 105 L 35 105 Z" fill="#1e3a8a" />

                        <g class="perna-esq">
                            <rect x="38" y="105" width="8" height="30" rx="4" fill="#fca5a5" />
                            <ellipse cx="46" cy="135" rx="8" ry="4" fill="#2563eb" />
                        </g>

                        <g class="perna-dir">
                            <rect x="54" y="105" width="8" height="30" rx="4" fill="#fca5a5" />
                            <ellipse cx="62" cy="135" rx="8" ry="4" fill="#2563eb" />
                        </g>
                    </svg>
                </div>
            </div>

            <div style="position: absolute; bottom: 5px; width: 90%; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; padding: 0 10px;">
                <span>Início: ${medicoes[0].data}</span>
                <span>Última: ${ultimaMedicao.data} (${ultimaMedicao.peso}kg)</span>
            </div>
        </div>
    `;

    containerGrafico.innerHTML = html;
}

// Fala do bebé natural, humana e brincalhona
function falarBebeBrincalhao() {
    if (medicoes.length === 0) return;

    const ult = medicoes[medicoes.length - 1];
    const balao = document.getElementById("balaoFala");
    let textoFala = "";

    if (ult.statusEvolucao === "descida") {
        textoFala = "Mamã! O mwanene escorregou na rampa, hiya! Dá-me papinha gostosa de peixinho para eu subir de novo, tá?";
    } else if (ult.peso < 10) {
        textoFala = "Atchim! Mamã, olha eu a subir bem rápido! Daqui a nada vou te apanhar no quintal, eish!";
    } else {
        textoFala = "Ehei! O mwanene está a ficar forte tipo leão! Hoje vou comer toda a papinha, tá mamã?";
    }

    if (balao) {
        balao.innerHTML = `<strong>${textoFala}</strong>`;
        balao.style.display = "block";
        setTimeout(() => { balao.style.display = "none"; }, 6000);
    }

    // Configuração de voz humana e suave (Evita som robótico)
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        const fala = new SpeechSynthesisUtterance(textoFala);
        
        // Procura por vozes em português com timbre mais natural
        const voces = window.speechSynthesis.getVoices();
        const vozPt = voces.find(v => v.lang.includes('pt') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Luciana') || v.name.includes('Joana'))) || voces.find(v => v.lang.includes('pt'));
        
        if (vozPt) fala.voice = vozPt;
        
        fala.lang = 'pt-PT';
        fala.pitch = 1.35; // Ligeiramente agudo mas sem soar a robô artificial
        fala.rate = 0.95;  // Ritmo natural e descontraído
        
        window.speechSynthesis.speak(fala);
    }
}

// Auto-Avaliação de Profissional de Saúde
function realizarAvaliacaoSaude(medicao) {
    const status = document.getElementById("status");
    const dicas = document.getElementById("dicas");

    const m = medicao.mesesIdade;
    const p = medicao.peso;
    const a = medicao.altura;
    const muac = medicao.braco;

    let mensagemStatus = "";
    let mensagemDicas = "";

    // Validação da Nutrição pelo Perímetro Braquial (MUAC - Padrão OMS)
    let estadoMuac = "Normal";
    if (muac < 11.5) {
        estadoMuac = "Desnutrição Aguda Grave (Vermelho)";
    } else if (muac >= 11.5 && muac < 12.5) {
        estadoMuac = "Desnutrição Aguda Moderada (Amarelo)";
    }

    // Avaliação de Crescimento por Idade e Peso
    if (medicao.statusEvolucao === "descida") {
        mensagemStatus = `⚠️ <span style='color:#e53e3e;'><b>Alerta Clínico:</b> O mwanene teve uma redução nos valores! (${p}kg / ${a}cm aos ${medicao.idade}).</span>`;
        mensagemDicas = "Mamã, quando o bebé perde peso é importante reforçar a alimentação com moringa, peixe, ovelha ou feijão e levar ao Centro de Saúde para rastreio de febre ou diarreia.";
    } else if (estadoMuac.includes("Desnutrição")) {
        mensagemStatus = `⚠️ <span style='color:#e53e3e;'><b>Atenção do Nutricionista:</b> Perímetro do braço de ${muac}cm indica risco de desnutrição.</span>`;
        mensagemDicas = "Visite a consulta de Pediatria/CCR no Centro de Saúde para receber suplementação de Plumpy'Nut ou papa enriquecida.";
    } else {
        mensagemStatus = `✅ <span style='color:#27ae60;'><b>Desenvolvimento Adequado:</b> O mwanene está com ${p}kg e ${a}cm aos ${medicao.idade}. Evolução saudável!</span>`;
        mensagemDicas = "Excelente trabalho, mamã! Continua com o aleitamento/comida diversificada, vacinas do PAF em dia e água fervida/tratada com Certeza.";
    }

    status.innerHTML = mensagemStatus;
    dicas.innerHTML = mensagemDicas;
}

function atualizarHistorico() {
    const lista = document.getElementById("historico");
    if (!lista) return;
    lista.innerHTML = "";

    medicoes.slice().reverse().forEach(m => {
        const item = document.createElement("li");
        item.style.padding = "8px 0";
        item.style.borderBottom = "1px solid #eee";
        item.innerHTML = `<strong>Data:</strong> ${m.data} (${m.idade}) | <strong>Peso:</strong> ${m.peso}kg | ` +
                         `<strong>Altura:</strong> ${m.altura}cm | <strong>Braço:</strong> ${m.braco}cm`;
        lista.appendChild(item);
    });
}

function limparCampos() {
    document.getElementById("data").value = "";
    document.getElementById("peso").value = "";
    document.getElementById("altura").value = "";
    document.getElementById("braco").value = "";
    if (document.getElementById("cranio")) document.getElementById("cranio").value = "";
}

async function baixarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Relatório de Avaliação Nutricional do Mwanene - VIDAFONTE", 20, 20);
    doc.setFontSize(11);

    let y = 40;
    medicoes.forEach((m, index) => {
        doc.text(`${index + 1}. Data: ${m.data} (${m.idade}) - Peso: ${m.peso}kg | Altura: ${m.altura}cm | Braço: ${m.braco}cm`, 20, y);
        y += 10;
    });

    doc.save("relatorio_saude_mwanene_vidafonte.pdf");
}
