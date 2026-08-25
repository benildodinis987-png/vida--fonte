/* ==========================================================================
   SISTEMA DE MONITORAMENTO INFANTIL - VIDAFONTE (testann.js)
   ========================================================================== */

// 1. OBTENÇÃO INTELIGENTE DOS DADOS DO CADASTRO (dadosBebe ou usuario)
function obterDadosCadastrados() {
    let dados = JSON.parse(localStorage.getItem("dadosBebe"));
    
    if (!dados) {
        dados = JSON.parse(localStorage.getItem("usuario"));
    }

    return {
        nome: (dados && dados.nome) ? dados.nome : "Mwanene",
        dataNascimento: (dados && dados.dataNascimento) ? dados.dataNascimento : "2024-01-01"
    };
}

let medicoes = JSON.parse(localStorage.getItem("medicoes")) || [];
let dadosBebe = obterDadosCadastrados();

// 2. INICIALIZAÇÃO DA PÁGINA
window.onload = function() {
    renderizarCaminhadaEvolutiva();
    atualizarHistorico();
    preencherCamposAutomaticos();

    if (medicoes.length > 0) {
        const ult = medicoes[medicoes.length - 1];
        realizarAvaliacaoSaude(ult);
    }

    // Escuta mudanças no campo de data para recalcular idade em tempo real
    const campoData = document.getElementById("data");
    if (campoData) {
        campoData.addEventListener("change", preencherCamposAutomaticos);
    }
};

// 3. PREENCHIMENTO AUTOMÁTICO DE NOME E IDADE
function preencherCamposAutomaticos() {
    const campoNome = document.getElementById("nome") || document.getElementById("nome-bebe");
    if (campoNome) {
        campoNome.value = dadosBebe.nome;
    }

    const campoData = document.getElementById("data");
    const campoIdade = document.getElementById("idade");

    let dataRef = (campoData && campoData.value) ? campoData.value : new Date().toISOString().split('T')[0];
    const meses = calcularIdadeEmMeses(dataRef, dadosBebe.dataNascimento);
    const textoIdade = formatarIdade(meses);

    if (campoIdade) {
        campoIdade.value = textoIdade;
    }
}

// 4. CÁLCULO E FORMATAGÃO DE IDADE
function calcularIdadeEmMeses(dataMedicao, dataNasc) {
    if (!dataNasc) return 0;
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

// 5. REGISTO DE MEDIÇÕES
function registrarMedicao() {
    const data = document.getElementById("data") ? document.getElementById("data").value : "";
    const peso = parseFloat(document.getElementById("peso") ? document.getElementById("peso").value : 0);
    const altura = parseFloat(document.getElementById("altura") ? document.getElementById("altura").value : 0);
    const braco = parseFloat(document.getElementById("braco") ? document.getElementById("braco").value : 0);
    const cranio = parseFloat(document.getElementById("cranio")?.value || 0);

    const nomeCrianca = dadosBebe.nome;

    if (!data || isNaN(peso) || isNaN(altura) || isNaN(braco)) {
        alert(`Eish, mamã! Preenche a data, peso, altura e braço do(a) ${nomeCrianca} direitinho, tá bom?`);
        return;
    }

    const mesesIdade = calcularIdadeEmMeses(data, dadosBebe.dataNascimento);
    const idadeTexto = formatarIdade(mesesIdade);
    
    let statusEvolucao = "progresso";

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

// 6. RENDERIZAÇÃO DO GRÁFICO (MONTANHA, PARQUE, BEBÉ E RÉGUA EM CM)
function renderizarCaminhadaEvolutiva() {
    const containerGrafico = document.getElementById("grafico");
    const nomeCrianca = dadosBebe.nome;

    if (!containerGrafico) return;

    if (medicoes.length === 0) {
        containerGrafico.innerHTML = `<p style='text-align:center; padding: 25px; color: #666;'>Mamã, regista a primeira medição para ver o(a) ${nomeCrianca} a subir a montanha!</p>`;
        return;
    }

    const ultimaMedicao = medicoes[medicoes.length - 1];
    const totalMedicoes = medicoes.length;
    
    const ehDescida = ultimaMedicao.statusEvolucao === "descida";
    const corMontanha = ehDescida ? "#e53e3e" : "#22c55e";

    // Posição proporcional na régua (30cm a 120cm)
    let valorCm = Math.min(Math.max(ultimaMedicao.altura || (totalMedicoes * 10), 30), 120);
    let percentualX = Math.min(Math.max(((valorCm - 30) / 90) * 80 + 5, 5), 82);
    let percentualY = Math.min((percentualX * 0.75), 65);

    if (ehDescida) {
        percentualY = Math.max(5, percentualY - 12);
    }

    // Gerar a régua numerada em CM
    let tracosRegua = "";
    for (let cm = 30; cm <= 120; cm += 10) {
        let posX = ((cm - 30) / 90) * 80 + 5;
        tracosRegua += `
            <div style="position: absolute; left: ${posX}%; bottom: 0; display: flex; flex-direction: column; align-items: center;">
                <span style="font-size: 9px; font-weight: bold; color: #1e293b; background: rgba(255,255,255,0.8); padding: 1px 3px; border-radius: 3px;">${cm}cm</span>
                <div style="width: 2px; height: 10px; background: #1e293b; margin-top: 2px;"></div>
            </div>
        `;
    }

    let html = `
        <style>
            @keyframes animPernaEsq { 0%, 100% { transform: rotate(-25deg); } 50% { transform: rotate(25deg); } }
            @keyframes animPernaDir { 0%, 100% { transform: rotate(25deg); } 50% { transform: rotate(-25deg); } }
            @keyframes animBracoEsq { 0%, 100% { transform: rotate(30deg); } 50% { transform: rotate(-30deg); } }
            @keyframes animBracoDir { 0%, 100% { transform: rotate(-30deg); } 50% { transform: rotate(30deg); } }
            @keyframes balancoCorpo { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-5px); } }
            
            .perna-esq { animation: animPernaEsq 0.5s infinite ease-in-out; transform-origin: 45px 85px; }
            .perna-dir { animation: animPernaDir 0.5s infinite ease-in-out; transform-origin: 55px 85px; }
            .braco-esq { animation: animBracoEsq 0.5s infinite ease-in-out; transform-origin: 35px 50px; }
            .braco-dir { animation: animBracoDir 0.5s infinite ease-in-out; transform-origin: 65px 50px; }
            .corpo-bebe-caminhando { animation: balancoCorpo 0.5s infinite ease-in-out; cursor: pointer; }

            .balao-fala {
                display: none;
                position: absolute;
                bottom: 110px;
                background: #ffffff;
                border: 2px solid ${corMontanha};
                border-radius: 12px;
                padding: 8px 12px;
                font-size: 11px;
                font-weight: bold;
                color: #1e293b;
                box-shadow: 0 6px 12px rgba(0,0,0,0.2);
                width: 190px;
                text-align: center;
                z-index: 20;
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

        <div style="position: relative; width: 100%; height: 280px; background: linear-gradient(180deg, #bae6fd 0%, #e0f2fe 60%, #fef08a 100%); border-radius: 16px; overflow: hidden; border: 2px solid #93c5fd;">
            
            <!-- CENÁRIO: PARQUE DE DIVERSÕES -->
            <svg viewBox="0 0 500 200" style="position: absolute; top: 10px; left: 0; width: 100%; height: 160px; opacity: 0.5;">
                <circle cx="80" cy="80" r="45" stroke="#f43f5e" stroke-width="3" fill="none" stroke-dasharray="4,4" />
                <line x1="80" y1="80" x2="80" y2="135" stroke="#64748b" stroke-width="4" />
                <line x1="80" y1="80" x2="50" y2="135" stroke="#64748b" stroke-width="3" />
                <line x1="80" y1="80" x2="110" y2="135" stroke="#64748b" stroke-width="3" />
                <circle cx="80" cy="35" r="5" fill="#eab308" />
                <circle cx="125" cy="80" r="5" fill="#3b82f6" />
                <circle cx="35" cy="80" r="5" fill="#10b981" />
                
                <path d="M 320 135 L 320 70 L 340 50 L 360 70 L 360 135 Z" fill="#a855f7" />
                <path d="M 360 135 L 360 90 L 375 75 L 390 90 L 390 135 Z" fill="#ec4899" />
                <rect x="333" y="90" width="14" height="25" fill="#fef08a" rx="7" />
                
                <polygon points="200,135 230,80 260,135" fill="#ef4444" />
                <polygon points="215,135 230,80 245,135" fill="#ffffff" />

                <circle cx="430" cy="40" r="10" fill="#f43f5e" />
                <line x1="430" y1="50" x2="425" y2="75" stroke="#94a3b8" />
                <circle cx="450" cy="55" r="8" fill="#06b6d4" />
                <line x1="450" y1="63" x2="447" y2="85" stroke="#94a3b8" />
            </svg>

            <!-- TITULO DO GRÁFICO -->
            <p style="position: absolute; top: 6px; width: 100%; text-align:center; font-size:12px; font-weight:bold; color:#0369a1; z-index: 5;">
                me toca mae quero falar
            </p>

            <!-- MONTANHA -->
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position: absolute; bottom: 25px; left: 0; width: 100%; height: 180px; z-index: 2;">
                <path d="M 0 100 L 0 90 Q 50 65 100 25 L 100 100 Z" fill="${corMontanha}" opacity="0.85" />
                <path d="M 0 90 Q 50 65 100 25" stroke="#ffffff" stroke-width="2" stroke-dasharray="3,3" fill="none" />
            </svg>

            <!-- BONECO DO BEBÉ -->
            <div style="
                position: absolute; 
                bottom: calc(30px + ${percentualY}%); 
                left: ${percentualX}%; 
                transition: all 1s ease-in-out;
                display: flex;
                flex-direction: column;
                align-items: center;
                z-index: 10;
            ">
                <div id="balaoFala" class="balao-fala"></div>

                <div class="corpo-bebe-caminhando" onclick="falarBebeBrincalhao()" style="width: 70px; height: 95px;">
                    <svg viewBox="0 0 100 130" width="100%" height="100%">
                        <g class="braco-esq">
                            <rect x="25" y="48" width="10" height="28" rx="5" fill="#fca5a5" />
                            <circle cx="30" cy="78" r="5" fill="#fca5a5" />
                        </g>

                        <g class="perna-esq">
                            <rect x="40" y="80" width="10" height="32" rx="5" fill="#fca5a5" />
                            <ellipse cx="45" cy="114" rx="8" ry="4" fill="#2563eb" />
                        </g>

                        <path d="M 36 45 L 64 45 L 60 82 L 40 82 Z" fill="#0284c7" />
                        <path d="M 38 80 L 62 80 L 62 92 L 38 92 Z" fill="#1e3a8a" />

                        <g class="perna-dir">
                            <rect x="50" y="80" width="10" height="32" rx="5" fill="#fca5a5" />
                            <ellipse cx="55" cy="114" rx="8" ry="4" fill="#2563eb" />
                        </g>

                        <g class="braco-dir">
                            <rect x="65" y="48" width="10" height="28" rx="5" fill="#fca5a5" />
                            <circle cx="70" cy="78" r="5" fill="#fca5a5" />
                        </g>

                        <g transform="rotate(-5, 50, 25)">
                            <circle cx="50" cy="26" r="21" fill="#fca5a5" />
                            <path d="M 34 16 Q 50 4 66 16 Q 50 11 34 16 Z" fill="#78350f" />
                            <circle cx="58" cy="22" r="3" fill="#1e293b" />
                            <circle cx="59" cy="21" r="1" fill="#ffffff" />
                            <circle cx="58" cy="30" r="3.5" fill="#f43f5e" opacity="0.5" />
                            <path d="M 52 31 Q 58 37 63 30" stroke="#1e293b" stroke-width="2" fill="none" stroke-linecap="round" />
                        </g>
                    </svg>
                </div>
            </div>

            <!-- RÉGUA EM CM -->
            <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 26px; background: #f1f5f9; border-top: 2px solid #64748b; z-index: 4;">
                ${tracosRegua}
            </div>

        </div>
    `;

    containerGrafico.innerHTML = html;
}

// 7. SINTETIZAÇÃO DE VOZ E INTERAÇÃO
function falarBebeBrincalhao() {
    if (medicoes.length === 0) return;

    const ult = medicoes[medicoes.length - 1];
    const balao = document.getElementById("balaoFala");
    const nomeCrianca = dadosBebe.nome;
    let textoFala = "";

    if (ult.statusEvolucao === "descida") {
        textoFala = `Mamã! O ${nomeCrianca} escorregou na montanha, eeee! Dá-me papinha gostosa para eu subir até ao topo!`;
    } else if (ult.altura && ult.altura > 80) {
        textoFala = `Ehei! O ${nomeCrianca} já tem ${ult.altura} cm na régua! Daqui a nada chego no topo da Roda-Gigante, mamã!`;
    } else {
        textoFala = `Olha eu a caminhar! O ${nomeCrianca} está a ficar forte tipo leão! Vamos brincar no parque, mamã?`;
    }

    if (balao) {
        balao.innerHTML = `<strong>${textoFala}</strong>`;
        balao.style.display = "block";
        setTimeout(() => { balao.style.display = "none"; }, 6000);
    }

    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        const fala = new SpeechSynthesisUtterance(textoFala);
        const voces = window.speechSynthesis.getVoices();
        const vozPt = voces.find(v => v.lang.includes('pt') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Luciana') || v.name.includes('Joana'))) || voces.find(v => v.lang.includes('pt'));
        
        if (vozPt) fala.voice = vozPt;
        
        fala.lang = 'pt-PT';
        fala.pitch = 1.3; 
        fala.rate = 0.95; 
        
        window.speechSynthesis.speak(fala);
    }
}

// 8. AUTO-AVALIAÇÃO DE SAÚDE
function realizarAvaliacaoSaude(medicao) {
    const status = document.getElementById("status");
    const dicas = document.getElementById("dicas");

    const p = medicao.peso;
    const a = medicao.altura;
    const muac = medicao.braco;
    const nomeCrianca = dadosBebe.nome;

    let mensagemStatus = "";
    let mensagemDicas = "";

    let estadoMuac = "Normal";
    if (muac < 11.5) {
        estadoMuac = "Desnutrição Aguda Grave (Vermelho)";
    } else if (muac >= 11.5 && muac < 12.5) {
        estadoMuac = "Desnutrição Aguda Moderada (Amarelo)";
    }

    if (medicao.statusEvolucao === "descida") {
        mensagemStatus = `⚠️ <span style='color:#e53e3e;'><b>Alerta Clínico:</b> O ${nomeCrianca} desceu na montanha! (${p}kg / ${a}cm aos ${medicao.idade}).</span>`;
        mensagemDicas = `Mamã, reforça a papinha do ${nomeCrianca} enriquecida com amendoim, peixe ou ovo e leva ao Centro de Saúde para rastreio.`;
    } else if (estadoMuac.includes("Desnutrição")) {
        mensagemStatus = `⚠️ <span style='color:#e53e3e;'><b>Atenção do Nutricionista:</b> Braço de ${muac}cm indica risco nutricional para o ${nomeCrianca}.</span>`;
        mensagemDicas = "Visita a consulta de Nutrição no Centro de Saúde para receber o acompanhamento adequado.";
    } else {
        mensagemStatus = `✅ <span style='color:#27ae60;'><b>Desenvolvimento Adequado:</b> O ${nomeCrianca} está com ${p}kg e ${a}cm na régua aos ${medicao.idade}.</span>`;
        mensagemDicas = `Muito bem, mamã! Mantém a alimentação variada e vacinas em dia para o(a) ${nomeCrianca} continuar a subir a montanha!`;
    }

    if (status) status.innerHTML = mensagemStatus;
    if (dicas) dicas.innerHTML = mensagemDicas;
}

// 9. ATUALIZAÇÃO DE HISTÓRICO
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

// 10. LIMPEZA DE CAMPOS DO FORMULÁRIO
function limparCampos() {
    if (document.getElementById("data")) document.getElementById("data").value = "";
    if (document.getElementById("peso")) document.getElementById("peso").value = "";
    if (document.getElementById("altura")) document.getElementById("altura").value = "";
    if (document.getElementById("braco")) document.getElementById("braco").value = "";
    if (document.getElementById("cranio")) document.getElementById("cranio").value = "";
    preencherCamposAutomaticos();
}

// 11. GERAÇÃO DE RELATÓRIO PDF
async function baixarPDF() {
    if (!window.jspdf) {
        alert("Biblioteca PDF a carregar. Tente novamente em instantes!");
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const nomeCrianca = dadosBebe.nome;

    doc.setFontSize(16);
    doc.text(`Relatório de Avaliação Nutricional - ${nomeCrianca}`, 20, 20);
    doc.setFontSize(11);

    let y = 40;
    medicoes.forEach((m, index) => {
        doc.text(`${index + 1}. Data: ${m.data} (${m.idade}) - Peso: ${m.peso}kg | Altura: ${m.altura}cm | Braço: ${m.braco}cm`, 20, y);
        y += 10;
    });

    doc.save(`relatorio_saude_${nomeCrianca.toLowerCase().replace(/\s+/g, '_')}.pdf`);
}
