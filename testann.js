// Carrega dados salvos no navegador (localStorage)
let medicoes = JSON.parse(localStorage.getItem("medicoes")) || [];
let dadosBebe = JSON.parse(localStorage.getItem("dadosBebe")) || { dataNascimento: "2024-01-01" };

window.onload = function() {
    renderizarCaminhadaEvolutiva();
    atualizarHistorico();
    if (medicoes.length > 0) {
        const ult = medicoes[medicoes.length - 1];
        calcularStatus(ult.peso, ult.altura);
        gerarDicas(ult.peso, ult.altura);
    }
};

function calcularIdade(dataMedicao, dataNasc) {
    const inicio = new Date(dataNasc);
    const fim = new Date(dataMedicao);
    let meses = (fim.getFullYear() - inicio.getFullYear()) * 12 + (fim.getMonth() - inicio.getMonth());
    
    if (meses < 1) return "Recém-nascido";
    if (meses < 12) return `${meses} m`;
    const anos = Math.floor(meses / 12);
    const mesesSobrando = meses % 12;
    return `${anos} a ${mesesSobrando} m`;
}

function registrarMedicao() {
    const data = document.getElementById("data").value;
    const peso = parseFloat(document.getElementById("peso").value);
    const altura = parseFloat(document.getElementById("altura").value);
    const braco = parseFloat(document.getElementById("braco").value);
    const cranio = parseFloat(document.getElementById("cranio")?.value || 0);

    if (!data || isNaN(peso) || isNaN(altura) || isNaN(braco)) {
        alert("Eish, mamã! Preenche todos os campos direitinho para o mwanene, tá bom?");
        return;
    }

    const idadeCalculada = calcularIdade(data, dadosBebe.dataNascimento);
    let statusEvolucao = "progresso";

    // Avalia se houve perda de peso ou altura (Perigo / Regressão)
    if (medicoes.length > 0) {
        const ultima = medicoes[medicoes.length - 1];
        if (peso < ultima.peso || altura < ultima.altura) {
            alert("⚠️ Yowe, mamã! O mwanene baixou de peso ou altura! Clica nele para ouvir o que ele está a sentir.");
            statusEvolucao = "perigo";
        }
    }

    const novaMedicao = { data, peso, altura, braco, cranio, idade: idadeCalculada, statusEvolucao };

    medicoes.push(novaMedicao);
    localStorage.setItem("medicoes", JSON.stringify(medicoes));

    renderizarCaminhadaEvolutiva();
    atualizarHistorico();
    calcularStatus(peso, altura);
    gerarDicas(peso, altura);
    limparCampos();
}

// Renderiza a caminhada em subida com interatividade por toque/clique
function renderizarCaminhadaEvolutiva() {
    const containerGrafico = document.getElementById("grafico");
    
    if (medicoes.length === 0) {
        containerGrafico.innerHTML = "<p style='text-align:center; padding: 25px; color: #666;'>Mamã, regista a primeira medição para ver o mwanene a subir!</p>";
        return;
    }

    const ultimaMedicao = medicoes[medicoes.length - 1];
    const totalMedicoes = medicoes.length;
    
    const ehPerigo = ultimaMedicao.statusEvolucao === "perigo";
    const corCaminho = ehPerigo ? "#e53e3e" : "#2ea44f";

    // Progresso ao longo da subida (X = horizontal, Y = elevação)
    const progressoX = Math.min((totalMedicoes - 1) * 12, 75);
    const progressoY = Math.min((totalMedicoes - 1) * 10, 70); 
    const escala = Math.min(1 + (totalMedicoes * 0.04), 1.35);

    let html = `
        <style>
            @keyframes passarPernaEsq {
                0%, 100% { transform: rotate(-20deg); }
                50% { transform: rotate(25deg); }
            }
            @keyframes passarPernaDir {
                0%, 100% { transform: rotate(25deg); }
                50% { transform: rotate(-20deg); }
            }
            @keyframes subidaCorpo {
                0%, 100% { transform: translateY(0px) rotate(-8deg); }
                50% { transform: translateY(-5px) rotate(-5deg); }
            }
            .perna-esq { animation: passarPernaEsq 0.5s infinite ease-in-out; transform-origin: 42px 105px; }
            .perna-dir { animation: passarPernaDir 0.5s infinite ease-in-out; transform-origin: 58px 105px; }
            .corpo-bebe-subindo { animation: subidaCorpo 0.3s infinite ease-in-out; cursor: pointer; }
            
            .balao-fala {
                display: none;
                position: absolute;
                bottom: 120px;
                background: #ffffff;
                border: 2px solid #2563eb;
                border-radius: 12px;
                padding: 8px 12px;
                font-size: 11px;
                font-weight: bold;
                color: #1e293b;
                box-shadow: 0 6px 12px rgba(0,0,0,0.15);
                white-space: normal;
                width: 190px;
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
            
            <p style="text-align:center; font-size:11px; color:#64748b; margin-top:0;">💡 <i>Toca no mwanene para ele falar contigo, mamã!</i></p>

            <!-- Rampa Inclinada de Subida -->
            <div style="
                position: absolute; 
                bottom: 40px; 
                left: 5%; 
                width: 85%; 
                height: 12px; 
                background: #cbd5e1; 
                border-radius: 6px; 
                transform: rotate(-12deg); 
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
                    transition: width 0.6s ease;
                "></div>
            </div>

            <!-- Contentor do Bebé (Subindo a rampa) -->
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
                <!-- Balão de Fala Dinâmico -->
                <div id="balaoFala" class="balao-fala"></div>

                <!-- Boneco SVG com Cabeça Inclinada para Cima -->
                <div class="corpo-bebe-subindo" onclick="falarBebeMocambicano()" style="width: 65px; height: 95px;">
                    <svg viewBox="0 0 100 150" width="100%" height="100%">
                        <!-- Cabeça Virada para Cima -->
                        <g transform="rotate(-15, 50, 30)">
                            <circle cx="50" cy="28" r="22" fill="#fca5a5" />
                            <circle cx="30" cy="30" r="4" fill="#fca5a5" />
                            <path d="M 33 18 Q 50 6 67 18 Q 50 13 33 18 Z" fill="#78350f" />
                            <circle cx="60" cy="24" r="2.5" fill="#1e293b" />
                            <path d="M 54 34 Q 60 38 65 32" stroke="#1e293b" stroke-width="2" fill="none" />
                        </g>
                        
                        <!-- Camiseta Azul -->
                        <path d="M 32 52 L 68 48 L 64 90 L 36 90 Z" fill="#38bdf8" />

                        <!-- Calções Azul Escuro -->
                        <path d="M 35 90 L 65 90 L 65 105 L 35 105 Z" fill="#1e3a8a" />

                        <!-- Perna Esquerda -->
                        <g class="perna-esq">
                            <rect x="38" y="105" width="8" height="30" rx="4" fill="#fca5a5" />
                            <ellipse cx="46" cy="135" rx="8" ry="4" fill="#2563eb" />
                        </g>

                        <!-- Perna Direita -->
                        <g class="perna-dir">
                            <rect x="54" y="105" width="8" height="30" rx="4" fill="#fca5a5" />
                            <ellipse cx="62" cy="135" rx="8" ry="4" fill="#2563eb" />
                        </g>
                    </svg>
                </div>
            </div>

            <!-- Legenda das Medições -->
            <div style="position: absolute; bottom: 5px; width: 90%; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; padding: 0 10px;">
                <span>Início: ${medicoes[0].data}</span>
                <span>Última: ${ultimaMedicao.data} (${ultimaMedicao.peso}kg)</span>
            </div>
        </div>
    `;

    containerGrafico.innerHTML = html;
}

// Fala do Bebê em Português de Moçambique com tom de bebé
function falarBebeMocambicano() {
    if (medicoes.length === 0) return;

    const ult = medicoes[medicoes.length - 1];
    const imc = ult.peso / ((ult.altura / 100) ** 2);
    const balao = document.getElementById("balaoFala");

    let textoFala = "";

    // Expressões do bebé em português moçambicano
    if (ult.statusEvolucao === "perigo" || imc < 14) {
        textoFala = "Mamã, estou a me sentir sem força e o corpo está fraco! Prepara uma papinha boa e leva o mwanene no hospital, tá?";
    } else if (imc >= 14 && imc <= 18) {
        textoFala = "Mamã, estou com muita força para subir a rampa! Continua a cuidar bem de mim assim bem bonito!";
    } else {
        textoFala = "Mamã, estou muito pesadinho para subir! Eish, vamos brincar lá fora no quintal para gastar energia?";
    }

    // Exibe no balão de fala
    if (balao) {
        balao.innerHTML = `<strong>${textoFala}</strong>`;
        balao.style.display = "block";
        setTimeout(() => { balao.style.display = "none"; }, 6000);
    }

    // Reprodução da voz agudinha de bebé
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        const fala = new SpeechSynthesisUtterance(textoFala);
        fala.lang = 'pt-PT'; // Boa pronúncia das sílabas em português
        fala.pitch = 1.95;   // Tom agudinho de bebé
        fala.rate = 0.85;   // Velocidade mais calma de criancinha
        
        window.speechSynthesis.speak(fala);
    }
}

function atualizarHistorico() {
    const lista = document.getElementById("historico");
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

function calcularStatus(peso, altura) {
    const imc = peso / ((altura / 100) ** 2);
    const status = document.getElementById("status");

    if (imc < 14) {
        status.innerHTML = "⚠️ <span style='color:#e53e3e;'><b>O mwanene está abaixo do peso ideal</b> - Precisa de mais atenção e alimentação reforçada, mamã.</span>";
    } else if (imc >= 14 && imc <= 18) {
        status.innerHTML = "✅ <span style='color:#2ea44f;'><b>Evolução Saudável</b> - O mwanene está a crescer bem bonito!</span>";
    } else {
        status.innerHTML = "⚠️ <span style='color:orange;'><b>Acima do peso recomendado</b> - Vamos controlar os doces e pôr o mwanene a brincar mais.</span>";
    }
}

function gerarDicas(peso, altura) {
    const dicas = document.getElementById("dicas");
    const imc = peso / ((altura / 100) ** 2);

    if (imc < 14) {
        dicas.innerHTML = "Mamã, dá papinha bem nutrida com vegetais, peixinho e leva ao centro de saúde para acompanhamento.";
    } else if (imc <= 18) {
        dicas.innerHTML = "Está ótimo, mamã! Continua com o leitinho, comida saudável e vacinas em dia.";
    } else {
        dicas.innerHTML = "Põe o mwanene a engatinhar e andar lá fora para gastar energia saudável.";
    }
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
    doc.text("Relatório da Subida do Mwanene - VIDAFONTE", 20, 20);
    doc.setFontSize(11);

    let y = 40;
    medicoes.forEach((m, index) => {
        doc.text(`${index + 1}. Data: ${m.data} (${m.idade}) - Peso: ${m.peso}kg | Altura: ${m.altura}cm`, 20, y);
        y += 10;
    });

    doc.save("relatorio_crescimento_vidafonte.pdf");
}
