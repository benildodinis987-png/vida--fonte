document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // 1. VERIFICAR SE O UTILIZADOR ESTÁ LOGADO
    // ==========================document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // 1. VERIFICAR AUTENTICAÇÃO E LER DADOS
    // ==========================================
    if (localStorage.getItem("logado") !== "true") {
        window.location.href = "index.html";
        return;
    }

    function obterDadosBebe() {
        let dados = JSON.parse(localStorage.getItem("dadosBebe"));
        if (!dados) {
            dados = JSON.parse(localStorage.getItem("usuario"));
        }
        return dados;
    }

    let usuario = obterDadosBebe();

    if (!usuario) {
        alert("Não foram encontrados dados do bebê.");
        window.location.href = "login-vidafonte.html";
        return;
    }

    // ==========================================
    // 2. FUNÇÕES AUXILIARES DE DATA E IDADE
    // ==========================================
    function calcularIdadeMeses(dataNascimentoStr) {
        if (!dataNascimentoStr) return 0;
        const hoje = new Date();
        const nasc = new Date(dataNascimentoStr);
        let meses = (hoje.getFullYear() - nasc.getFullYear()) * 12 + (hoje.getMonth() - nasc.getMonth());
        if (hoje.getDate() < nasc.getDate()) meses--;
        return Math.max(0, meses);
    }

    function calcularDataVacina(dataNascimentoStr, meses) {
        if (!dataNascimentoStr) return "A definir";
        const d = new Date(dataNascimentoStr);
        d.setMonth(d.getMonth() + meses);
        return d.toLocaleDateString('pt-PT');
    }

    // ==========================================
    // 3. MOSTRAR PERFIL E MEDIÇÕES DINÂMICAS
    // ==========================================
    function mostrarPerfil() {
        usuario = obterDadosBebe();
        const medicoes = JSON.parse(localStorage.getItem("medicoes")) || [];
        const ultimaMedicao = medicoes.length > 0 ? medicoes[medicoes.length - 1] : null;

        const nomes = (usuario.nome || "Bebê").trim().split(" ");
        document.getElementById("nomeCompleto").textContent = usuario.nome || "-";
        document.getElementById("sobrenome").textContent = nomes.length > 1 ? nomes.slice(1).join(" ") : "-";
        document.getElementById("dataNascimento").textContent = usuario.dataNascimento || usuario.dataNasc || "-";
        document.getElementById("telefone").textContent = usuario.telefone || "-";
        document.getElementById("email").textContent = usuario.email || "-";

        const pesoFinal = ultimaMedicao && ultimaMedicao.peso ? ultimaMedicao.peso : usuario.peso;
        const alturaFinal = ultimaMedicao && ultimaMedicao.altura ? ultimaMedicao.altura : usuario.altura;

        document.getElementById("peso").textContent = pesoFinal ? `${pesoFinal} kg` : "Adicione";
        document.getElementById("altura").textContent = alturaFinal ? `${alturaFinal} cm` : "Adicione";

        const avatar = document.getElementById("avatar");
        if (usuario.foto) {
            avatar.innerHTML = `<img src="${usuario.foto}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
        } else {
            avatar.textContent = (usuario.nome || "B").charAt(0).toUpperCase();
        }

        atualizarCadernetaVacinas(usuario.dataNascimento || usuario.dataNasc);
        atualizarConquistas(ultimaMedicao);
    }

    // ==========================================
    // 4. CADERNETA DE VACINAS INTERATIVA (CLIQUE PARA MARCAR OK)
    // ==========================================
    function atualizarCadernetaVacinas(dataNasc) {
        const idadeMeses = calcularIdadeMeses(dataNasc);

        // Garante que o registo das vacinas concluídas existe no utilizador
        if (!usuario.vacinasConcluidas) {
            usuario.vacinasConcluidas = {};
        }

        const cronograma = [
            { id: "vacina1", statusId: "status1", mes: 0, nome: "BCG e Hepatite B" },
            { id: "vacina2", statusId: "status2", mes: 2, nome: "Penta 1ª, Polio, Rotavírus" },
            { id: "vacina3", statusId: "status3", mes: 4, nome: "Penta 2ª, Rotavírus" },
            { id: "vacina4", statusId: "status4", mes: 6, nome: "Penta 3ª, Polio VIP" },
            { id: "vacina5", statusId: "status5", mes: 12, nome: "Tríplice Viral 1ª" }
        ];

        cronograma.forEach(item => {
            const elVacina = document.getElementById(item.id);
            const elStatusOld = document.getElementById(item.statusId);
            const dataPrevista = calcularDataVacina(dataNasc, item.mes);

            if (elVacina && elStatusOld) {
                const textoDiv = elVacina.querySelector("div:first-child");
                if (textoDiv) {
                    textoDiv.textContent = `${item.nome} - Prevista: ${dataPrevista}`;
                }

                // Clona o elemento para evitar duplicar eventos ao recarregar
                const elStatus = elStatusOld.cloneNode(true);
                elStatusOld.parentNode.replaceChild(elStatus, elStatusOld);

                // Muda o cursor para mostrar que é clicável
                elStatus.style.cursor = "pointer";
                elStatus.title = "Clique para marcar como concluída (✔) ou remover";

                // Função que atualiza o visual da bolinha
                const atualizarVisual = () => {
                    if (usuario.vacinasConcluidas[item.id]) {
                        // Se foi marcada como feita
                        elStatus.className = "ok";
                        elStatus.textContent = "✔";
                        elStatus.style.backgroundColor = ""; 
                        elStatus.style.color = "";
                    } else {
                        if (idadeMeses >= item.mes) {
                            // Se está na altura de tomar ou atrasada
                            elStatus.className = "alert";
                            elStatus.textContent = "!";
                            elStatus.style.backgroundColor = "";
                            elStatus.style.color = "";
                        } else {
                            // Se a data ainda não chegou (Futuro)
                            elStatus.className = "alert";
                            elStatus.textContent = "⏳";
                            elStatus.style.backgroundColor = "#e2e8f0"; // Cinza claro
                            elStatus.style.color = "#64748b";
                        }
                    }
                };

                // Renderiza o estado inicial
                atualizarVisual();

                // Regista o clique para alternar o estado
                elStatus.addEventListener("click", () => {
                    usuario.vacinasConcluidas[item.id] = !usuario.vacinasConcluidas[item.id];
                    
                    // Guarda na memória do dispositivo
                    localStorage.setItem("usuario", JSON.stringify(usuario));
                    localStorage.setItem("dadosBebe", JSON.stringify(usuario));
                    
                    // Atualiza a vista instantaneamente
                    atualizarVisual();
                });
            }
        });
    }

    // ==========================================
    // 5. CONQUISTAS COM BASE NO ESTADO
    // ==========================================
    function atualizarConquistas(ultimaMedicao) {
        const badgeSaudavel = document.getElementById("badgeSaudavel");
        if (!badgeSaudavel) return;

        const spanTexto = badgeSaudavel.querySelector("span:first-child");

        if (ultimaMedicao) {
            if (ultimaMedicao.statusEvolucao === "descida" || (ultimaMedicao.braco && ultimaMedicao.braco < 11.5)) {
                spanTexto.textContent = "⚠️ Atenção Nutricional Recomendada";
                badgeSaudavel.style.backgroundColor = "#fee2e2";
                badgeSaudavel.style.color = "#991b1b";
            } else {
                spanTexto.textContent = "🎖️ Bebé Saudável & Em Crescimento";
                badgeSaudavel.style.backgroundColor = "#dcfce7";
                badgeSaudavel.style.color = "#166534";
            }
        } else {
            spanTexto.textContent = "🌱 Primeiro Registo Pendente";
        }
    }

    mostrarPerfil();

    // ==========================================
    // 6. EDITAR PERFIL
    // ==========================================
    const btnEditar = document.getElementById("btnEditar");
    if (btnEditar) {
        btnEditar.addEventListener("click", function () {
            const novoNome = prompt("Nome completo:", usuario.nome || "");
            if (novoNome === null) return;

            const novaData = prompt("Data de nascimento (AAAA-MM-DD):", usuario.dataNascimento || usuario.dataNasc || "");
            if (novaData === null) return;

            const novoTelefone = prompt("Número de telefone:", usuario.telefone || "");
            if (novoTelefone === null) return;

            const novoPeso = prompt("Peso em kg:", usuario.peso || "");
            if (novoPeso === null) return;

            const novaAltura = prompt("Altura em cm:", usuario.altura || "");
            if (novaAltura === null) return;

            const novoEmail = prompt("E-mail:", usuario.email || "");
            if (novoEmail === null) return;

            usuario.nome = novoNome.trim();
            usuario.dataNascimento = novaData;
            usuario.telefone = novoTelefone.trim();
            usuario.peso = novoPeso.trim();
            usuario.altura = novaAltura.trim();
            usuario.email = novoEmail.trim();

            localStorage.setItem("usuario", JSON.stringify(usuario));
            localStorage.setItem("dadosBebe", JSON.stringify(usuario));

            mostrarPerfil();
            alert("Perfil actualizado com sucesso!");
        });
    }

    // ==========================================
    // 7. FOTO DE PERFIL
    // ==========================================
    const avatar = document.getElementById("avatar");
    const inputFoto = document.getElementById("inputFoto");

    if (avatar && inputFoto) {
        avatar.addEventListener("click", () => inputFoto.click());

        inputFoto.addEventListener("change", function () {
            const ficheiro = this.files[0];
            if (!ficheiro) return;

            const leitor = new FileReader();
            leitor.onload = function (evento) {
                usuario.foto = evento.target.result;
                localStorage.setItem("usuario", JSON.stringify(usuario));
                localStorage.setItem("dadosBebe", JSON.stringify(usuario));
                mostrarPerfil();
            };
            leitor.readAsDataURL(ficheiro);
        });
    }

    // ==========================================
    // 8. NOTIFICAÇÕES SMS
    // ==========================================
    const smsSwitch = document.getElementById("smsSwitch");
    const smsLabel = document.getElementById("smsLabel");

    let smsAtivo = localStorage.getItem("smsAtivo") === "true";

    function atualizarSMS() {
        if (smsSwitch && smsLabel) {
            if (smsAtivo) {
                smsSwitch.classList.add("active");
                smsLabel.textContent = "Notificações SMS ativadas";
            } else {
                smsSwitch.classList.remove("active");
                smsLabel.textContent = "Receber Notificações SMS";
            }
        }
        localStorage.setItem("smsAtivo", smsAtivo);
    }

    atualizarSMS();

    if (smsSwitch) {
        smsSwitch.addEventListener("click", function () {
            smsAtivo = !smsAtivo;
            atualizarSMS();
        });
    }

    // ==========================================
    // 9. SAIR DA CONTA
    // ==========================================
    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
        btnLogout.addEventListener("click", function () {
            localStorage.removeItem("logado");
            window.location.href = "index.html";
        });
    }
});================

    if (localStorage.getItem("logado") !== "true") {
        window.location.href = "index.html";
        return;
    }


    // ==========================================
    // 2. BUSCAR OS DADOS DO CADASTRO
    // ==========================================

    const dadosGuardados = localStorage.getItem("usuario");

    if (!dadosGuardados) {
        alert("Não foram encontrados dados do utilizador.");
        window.location.href = "login-vidafonte.html";
        return;
    }

    let usuario = JSON.parse(dadosGuardados);


    // ==========================================
    // 3. MOSTRAR OS DADOS NO PERFIL
    // ==========================================

    function mostrarPerfil() {

        // Separar nome e sobrenome
        const nomes = usuario.nome.trim().split(" ");

        document.getElementById("nomeCompleto").textContent = usuario.nome;

        // Mostrar o último nome como sobrenome
        document.getElementById("sobrenome").textContent =
            nomes.length > 1 ? nomes[nomes.length - 1] : "-";

        document.getElementById("dataNascimento").textContent =
            usuario.dataNascimento || "-";

        document.getElementById("telefone").textContent =
            usuario.telefone || "-";

        document.getElementById("peso").textContent =
            usuario.peso ? usuario.peso + " kg" : "Não informado";

        document.getElementById("altura").textContent =
            usuario.altura ? usuario.altura + " cm" : "Não informado";

        document.getElementById("email").textContent =
            usuario.email || "Não informado";


        // Mostrar foto, caso exista
        const avatar = document.getElementById("avatar");

        if (usuario.foto) {
            avatar.innerHTML = `<img src="${usuario.foto}" 
                style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
        } else {
            // Primeira letra do nome
            avatar.textContent = usuario.nome.charAt(0).toUpperCase();
        }
    }


    // Mostrar os dados ao abrir a página
    mostrarPerfil();


    // ==========================================
    // 4. EDITAR PERFIL
    // ==========================================

    document.getElementById("btnEditar").addEventListener("click", function () {

        const novoNome = prompt("Nome completo:", usuario.nome);
        if (novoNome === null) return;

        const novaData = prompt(
            "Data de nascimento (AAAA-MM-DD):",
            usuario.dataNascimento
        );
        if (novaData === null) return;

        const novoTelefone = prompt(
            "Número de telefone:",
            usuario.telefone
        );
        if (novoTelefone === null) return;

        const novoPeso = prompt(
            "Peso em kg:",
            usuario.peso || ""
        );
        if (novoPeso === null) return;

        const novaAltura = prompt(
            "Altura em cm:",
            usuario.altura || ""
        );
        if (novaAltura === null) return;

        const novoEmail = prompt(
            "E-mail:",
            usuario.email || ""
        );
        if (novoEmail === null) return;


        // Actualizar os dados
        usuario.nome = novoNome.trim();
        usuario.dataNascimento = novaData;
        usuario.telefone = novoTelefone.trim();
        usuario.peso = novoPeso.trim();
        usuario.altura = novaAltura.trim();
        usuario.email = novoEmail.trim();


        // Guardar novamente no LocalStorage
        localStorage.setItem("usuario", JSON.stringify(usuario));


        // Actualizar o perfil sem recarregar a página
        mostrarPerfil();

        alert("Perfil actualizado com sucesso!");
    });


    // ==========================================
    // 5. ADICIONAR FOTO AO PERFIL
    // ==========================================

    const avatar = document.getElementById("avatar");
    const inputFoto = document.getElementById("inputFoto");

    // Clicar no avatar para escolher uma foto
    avatar.addEventListener("click", function () {
        inputFoto.click();
    });


    inputFoto.addEventListener("change", function () {

        const ficheiro = this.files[0];

        if (!ficheiro) return;

        const leitor = new FileReader();

        leitor.onload = function (evento) {

            // Guardar imagem no LocalStorage
            usuario.foto = evento.target.result;

            localStorage.setItem(
                "usuario",
                JSON.stringify(usuario)
            );

            mostrarPerfil();
        };

        leitor.readAsDataURL(ficheiro);
    });


    // ==========================================
    // 6. NOTIFICAÇÕES SMS
    // ==========================================

    const smsSwitch = document.getElementById("smsSwitch");

    // Recuperar estado guardado
    const notificacoes = localStorage.getItem("smsAtivo");

    if (notificacoes === "true") {
        smsSwitch.classList.add("active");
    }

    // Alterar estado
    smsSwitch.addEventListener("click", function () {

        smsSwitch.classList.toggle("active");

        const estaAtivo = smsSwitch.classList.contains("active");

        localStorage.setItem("smsAtivo", estaAtivo);
    });


    // ==========================================
    // 7. SAIR DA CONTA
    // ==========================================

    document.getElementById("btnLogout").addEventListener("click", function () {

        // Remove apenas a sessão, NÃO remove o cadastro
        localStorage.removeItem("logado");

        // Voltar para o login
        window.location.href = "index.html";
    });

});

//  notificacao...

// ==========================================
// NOTIFICAÇÕES SMS
// ==========================================

const smsSwitch = document.getElementById("smsSwitch");
const smsLabel = document.getElementById("smsLabel");

// Buscar o estado guardado
let smsAtivo = localStorage.getItem("smsAtivo") === "true";

// Função para actualizar o botão
function atualizarSMS() {

    if (smsAtivo) {
        smsSwitch.classList.add("active");
        smsLabel.textContent = "Notificações SMS activadas";
    } else {
        smsSwitch.classList.remove("active");
        smsLabel.textContent = "Receber Notificações SMS";
    }

    // Guardar no LocalStorage
    localStorage.setItem("smsAtivo", smsAtivo);
}

// Mostrar o estado inicial
atualizarSMS();

// Quando clicar no botão
smsSwitch.addEventListener("click", function () {
    smsAtivo = !smsAtivo;
    atualizarSMS();
});














































// ==========================================
// ELEMENTOS DA PÁGINA
// ==========================================

const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const chatMessages = document.getElementById('chatMessages');
const micBtn = document.getElementById('micBtn');

const newChatBtn = document.getElementById('newChatBtn');
const openHistoryBtn = document.getElementById('openHistoryBtn');
const closeHistoryBtn = document.getElementById('closeHistoryBtn');
const historySidebar = document.getElementById('historySidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const historyList = document.getElementById('historyList');


// ==========================================
// CONFIGURAÇÃO DA API
// ==========================================

// ⚠️ NÃO coloques uma chave secreta num site público.
// Para testes locais podes colocar temporariamente a tua nova chave aqui.
// O ideal é usar um servidor/backend para proteger a chave.
const GROQ_API_KEY = "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";

const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "openai/gpt-oss-20b";

// ==========================================
// MENSAGEM DO SISTEMA
// ==========================================

const promptSistema = {
    role: "system",
content: `Você é o Benildo, um assistente virtual acolhedor, amigável e humano do projecto Vida-Fonte.

A sua principal missão é apoiar famílias, líderes comunitários e agentes de saúde com informações sobre segurança alimentar, nutrição, saúde infantil e combate à desnutrição infantil.

IMPORTANTE SOBRE A CONVERSA:
- Cumprimente sempre as pessoas de forma calorosa e amigável.
- Se alguém disser "Olá", "Oi", "Bom dia", "Boa tarde" ou iniciar uma conversa casual, responda naturalmente e pergunte como pode ajudar.
- Pode conversar brevemente e de forma acolhedora antes de orientar o utilizador.
- Nunca responda "Não fui programado para isso" a um simples cumprimento, agradecimento ou conversa educada.
- Demonstre empatia, respeito e interesse pelas preocupações da pessoa.

SOBRE AS RESPOSTAS:
- Dê respostas simples, claras, práticas e fáceis de compreender.
- Baseie as informações de saúde em fontes confiáveis, como a OMS e UNICEF.
- Quando apropriado, termine com um breve aconselhamento.
- Destaque as informações importantes utilizando **negrito** quando possível.

LIMITES:
Se a pessoa fizer uma pergunta completamente fora das áreas de saúde, nutrição, saude reprodutiva, direitos das crianças, segurança alimentar ou factores relacionados, responda educadamente:
"Posso conversar consigo, mas fui especialmente criado para ajudar com assuntos relacionados à saúde, nutrição e bem-estar das crianças. Como posso ajudar dentro dessas áreas?"

IDENTIDADE:
Se perguntarem quem criou, desenvolveu ou é dono do assistente, informe que foi criado e desenvolvido por Benildo Dinis, da empresa NEXORA, sendo ele CEO.`};


// ==========================================
// ESTRUTURA DOS CHATS
// ==========================================

let bancoDeChats = {};
let chatIdAtual = null;


// Carregar os chats guardados com segurança
try {
    bancoDeChats =
        JSON.parse(localStorage.getItem('banco_de_chats')) || {};
} catch (erro) {
    console.error("Erro ao carregar o histórico:", erro);
    bancoDeChats = {};
}


// ==========================================
// GUARDAR NO LOCALSTORAGE
// ==========================================

function atualizarArmazenamentoLocal() {
    try {
        localStorage.setItem(
            'banco_de_chats',
            JSON.stringify(bancoDeChats)
        );
    } catch (erro) {
        console.error("Erro ao guardar o histórico:", erro);
    }
}


// ==========================================
// INICIAR NOVA CONVERSA
// ==========================================

function iniciarNovaSessaoChat() {

    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }

    chatIdAtual = "chat_" + Date.now();

    bancoDeChats[chatIdAtual] = {
        titulo: "Nova conversa",
        mensagens: [promptSistema]
    };

    atualizarArmazenamentoLocal();
    renderizarConversaAtual();
    renderizarListaHistorico();

    if (userInput) {
        userInput.focus();
    }
}


// ==========================================
// MOSTRAR CONVERSA ACTUAL
// ==========================================

function renderizarConversaAtual() {

    if (!chatMessages) return;

    chatMessages.innerHTML = '';

    const chatAtivo = bancoDeChats[chatIdAtual];

    if (!chatAtivo || chatAtivo.mensagens.length <= 1) {

        appendMessageVisual(
            "Olá! Sou Benildo, o assistente do Vida-Fonte. Estou aqui para apoiar com orientações sobre nutrição e combate à desnutrição infantil. Como posso ajudar?",
            'bot'
        );

        return;
    }

    for (let i = 1; i < chatAtivo.mensagens.length; i++) {

        const msg = chatAtivo.mensagens[i];

        appendMessageVisual(
            msg.content,
            msg.role === 'user' ? 'user' : 'bot'
        );
    }
}


// ==========================================
// HISTÓRICO DAS CONVERSAS
// ==========================================

function renderizarListaHistorico() {

    if (!historyList) return;

    historyList.innerHTML = '';

    const ids = Object.keys(bancoDeChats).reverse();

    ids.forEach(id => {

        const chat = bancoDeChats[id];

        if (chat && chat.mensagens && chat.mensagens.length > 1) {

            const item = document.createElement('div');

            item.className =
                `history-item ${id === chatIdAtual ? 'active' : ''}`;

            item.innerText = chat.titulo || "Nova conversa";

            item.addEventListener('click', () => {

                chatIdAtual = id;

                renderizarConversaAtual();
                renderizarListaHistorico();
                fecharMenuHistorico();

            });

            historyList.appendChild(item);
        }
    });
}


// ==========================================
// ABRIR E FECHAR HISTÓRICO
// ==========================================

function abrirMenuHistorico() {

    if (historySidebar) {
        historySidebar.classList.add('open');
    }

    if (sidebarOverlay) {
        sidebarOverlay.classList.add('open');
    }

    renderizarListaHistorico();
}


function fecharMenuHistorico() {

    if (historySidebar) {
        historySidebar.classList.remove('open');
    }

    if (sidebarOverlay) {
        sidebarOverlay.classList.remove('open');
    }
}


// Eventos do histórico

if (openHistoryBtn) {
    openHistoryBtn.addEventListener('click', abrirMenuHistorico);
}

if (closeHistoryBtn) {
    closeHistoryBtn.addEventListener('click', fecharMenuHistorico);
}

if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', fecharMenuHistorico);
}

if (newChatBtn) {
    newChatBtn.addEventListener('click', iniciarNovaSessaoChat);
}


// ==========================================
// LEITURA DAS RESPOSTAS POR VOZ
// ==========================================

function redefinirBotoesVoz() {

    const botoes =
        document.querySelectorAll('.action-btn.audio-btn');

    botoes.forEach(botao => {

        botao.classList.remove('falando');
        botao.style.color = '';

    });
}


function gerenciarLeituraTexto(texto, botao) {

    if (!('speechSynthesis' in window)) {
        alert("A leitura por voz não é suportada neste navegador.");
        return;
    }

    // Segundo clique: parar
    if (
        window.speechSynthesis.speaking &&
        botao.classList.contains('falando')
    ) {

        window.speechSynthesis.cancel();
        redefinirBotoesVoz();
        return;
    }

    // Parar qualquer leitura anterior
    window.speechSynthesis.cancel();
    redefinirBotoesVoz();

    const textoLimpo =
        texto.replace(/[*#_`]/g, '');

    const utterance =
        new SpeechSynthesisUtterance(textoLimpo);

    utterance.lang = 'pt-PT';
    utterance.rate = 1;

    botao.classList.add('falando');
    botao.style.color = '#0084ff';

    utterance.onend = () => {
        botao.classList.remove('falando');
        botao.style.color = '';
    };

    utterance.onerror = () => {
        botao.classList.remove('falando');
        botao.style.color = '';
    };

    window.speechSynthesis.speak(utterance);
}


// ==========================================
// MICROFONE
// ==========================================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


if (SpeechRecognition && micBtn) {

    const recognition =
        new SpeechRecognition();

    recognition.lang = 'pt-PT';
    recognition.continuous = false;
    recognition.interimResults = false;

    let gravando = false;


    recognition.onstart = () => {

        gravando = true;
        micBtn.classList.add('gravando');

        if (userInput) {
            userInput.placeholder = "Ouvindo a sua voz...";
        }
    };


    recognition.onend = () => {

        gravando = false;
        micBtn.classList.remove('gravando');

        if (userInput) {
            userInput.placeholder =
                "Digite a sua dúvida ou fale no microfone...";
        }
    };


    recognition.onresult = (event) => {

        const resultadoTexto =
            event.results[0][0].transcript;

        if (
            resultadoTexto &&
            resultadoTexto.trim() !== ''
        ) {

            userInput.value = resultadoTexto;

            // Enviar automaticamente
            setTimeout(() => {

                if (chatForm) {
                    chatForm.requestSubmit();
                }

            }, 300);
        }
    };


    recognition.onerror = (event) => {

        console.error(
            "Erro no microfone:",
            event.error
        );

        gravando = false;
        micBtn.classList.remove('gravando');

        if (userInput) {
            userInput.placeholder =
                "Não foi possível ouvir. Tente digitar.";
        }
    };


    micBtn.addEventListener('click', (e) => {

        e.preventDefault();

        try {

            if (!gravando) {
                recognition.start();
            } else {
                recognition.stop();
            }

        } catch (erro) {
            console.error(
                "Erro ao iniciar o microfone:",
                erro
            );
        }
    });

} else if (micBtn) {

    micBtn.style.opacity = "0.5";
    micBtn.title =
        "Microfone não suportado neste navegador";

}


// ==========================================
// MOSTRAR MENSAGENS NO CHAT
// ==========================================

function appendMessageVisual(text, sender) {

    if (!chatMessages) return;

    const messageContainer =
        document.createElement('div');

    messageContainer.classList.add(
        'message',
        sender
    );


    const messageContent =
        document.createElement('div');

    messageContent.classList.add(
        'message-content'
    );

    // Usamos textContent para maior segurança
messageContent.innerHTML = formatarTexto(text);
    messageContainer.appendChild(
        messageContent
    );


    // Botões apenas para respostas do assistente
    if (
        sender === 'bot' &&
        text !== "Digitando..."
    ) {

        const actionsContainer =
            document.createElement('div');

        actionsContainer.classList.add(
            'message-actions'
        );


        // BOTÃO OUVIR
        const escutarBtn =
            document.createElement('button');

        escutarBtn.type = "button";
        escutarBtn.className =
            'action-btn audio-btn';

        escutarBtn.title =
            "Ouvir ou parar resposta";

        escutarBtn.innerHTML = `
            <svg viewBox="0 0 24 24"
                 width="16"
                 height="16"
                 aria-hidden="true">
                <path fill="currentColor"
                d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12
                C19,15.17 16.89,17.85 14,18.71V20.77
                C18.07,19.86 21,16.28 21,12
                C21,7.72 18.07,4.14 14,3.23
                M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16
                C15.5,15.29 16.5,13.77 16.5,12
                M3,9V15H7L12,20V4L7,9H3Z"/>
            </svg>
        `;

        escutarBtn.addEventListener(
            'click',
            () => gerenciarLeituraTexto(
                text,
                escutarBtn
            )
        );


        // BOTÃO COPIAR
        const copiarBtn =
            document.createElement('button');

        copiarBtn.type = "button";
        copiarBtn.className =
            'action-btn';

        copiarBtn.title = "Copiar texto";

        copiarBtn.innerHTML = `
            <svg viewBox="0 0 24 24"
                 width="16"
                 height="16"
                 aria-hidden="true">
                <path fill="currentColor"
                d="M19,21H8V7H19M19,5H8A2,2 0,0,0 6,7V21
                A2,2 0,0,0 8,23H19A2,2 0,0,0 21,21V7
                A2,2 0,0,0 19,5M16,1H4A2,2 0,0,0 2,3V17
                H4V3H16V1Z"/>
            </svg>
        `;

        copiarBtn.addEventListener(
            'click',
            async () => {

                try {

                    await navigator.clipboard
                        .writeText(text);

                    copiarBtn.title =
                        "Texto copiado!";

                    setTimeout(() => {
                        copiarBtn.title =
                            "Copiar texto";
                    }, 1500);

                } catch (erro) {

                    console.error(
                        "Erro ao copiar:",
                        erro
                    );
                }
            }
        );


        actionsContainer.appendChild(
            escutarBtn
        );

        actionsContainer.appendChild(
            copiarBtn
        );

        messageContainer.appendChild(
            actionsContainer
        );
    }


    chatMessages.appendChild(
        messageContainer
    );

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

    return messageContainer;
}


// ==========================================
// ENVIAR MENSAGEM PARA A API
// ==========================================

if (chatForm) {

    chatForm.addEventListener(
        'submit',
        async function (e) {

            e.preventDefault();

            const messageText =
                userInput.value.trim();

            if (!messageText) return;


            // Verificar se existe uma conversa
            if (!chatIdAtual ||
                !bancoDeChats[chatIdAtual]) {

                iniciarNovaSessaoChat();
            }


            // Verificar a chave
            if (
                !GROQ_API_KEY ||
                GROQ_API_KEY ===
                "COLOQUE_AQUI_A_SUA_NOVA_CHAVE"
            ) {

                appendMessageVisual(
                    "A chave da API ainda não foi configurada. Configure a chave para utilizar o assistente.",
                    'bot'
                );

                return;
            }


            const chatAtual =
                bancoDeChats[chatIdAtual];


            // Definir título da primeira pergunta
            if (
                chatAtual.mensagens.length === 1
            ) {

                chatAtual.titulo =
                    messageText.length > 25
                        ? messageText.substring(0, 25) + "..."
                        : messageText;
            }


            // Guardar pergunta
            chatAtual.mensagens.push({
                role: "user",
                content: messageText
            });

            atualizarArmazenamentoLocal();
            renderizarListaHistorico();


            // Mostrar pergunta
            appendMessageVisual(
                messageText,
                'user'
            );

            userInput.value = '';

            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                redefinirBotoesVoz();
            }


            // Mostrar indicador de carregamento
            const ultimoBalao =
                appendMessageVisual(
                    "Digitando...",
                    'bot'
                );


            try {

                const response =
                    await fetch(API_URL, {

                        method: "POST",

                        headers: {
                            "Authorization":
                                `Bearer ${GROQ_API_KEY}`,
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            model: MODEL,

                            messages:
                                chatAtual.mensagens,

                            temperature: 0.3,

                            max_tokens: 800

                        })

                    });


                // Ler a resposta da API
                const data =
                    await response.json()
                    .catch(() => null);


                // Mostrar o erro verdadeiro
                if (!response.ok) {

                    console.error(
                        "Erro da API:",
                        response.status,
                        data
                    );

                    let mensagemErro =
                        `Erro da API (${response.status}).`;

                    if (
                        data &&
                        data.error &&
                        data.error.message
                    ) {

                        mensagemErro +=
                            " " +
                            data.error.message;
                    }

                    throw new Error(
                        mensagemErro
                    );
                }


                // Verificar resposta
                const respostaIA =
                    data?.choices?.[0]?.message?.content;


                if (!respostaIA) {

                    console.error(
                        "Resposta inesperada:",
                        data
                    );

                    throw new Error(
                        "A API não devolveu uma resposta válida."
                    );
                }


                // Guardar resposta
                chatAtual.mensagens.push({

                    role: "assistant",

                    content: respostaIA

                });

                atualizarArmazenamentoLocal();


                // Remover "Digitando..."
                if (
                    ultimoBalao &&
                    ultimoBalao.parentNode
                ) {

                    ultimoBalao.remove();
                }


                // Mostrar resposta
                appendMessageVisual(
                    respostaIA,
                    'bot'
                );


            } catch (error) {

                console.error(
                    "ERRO COMPLETO:",
                    error
                );


                // Remover "Digitando..."
                if (
                    ultimoBalao &&
                    ultimoBalao.parentNode
                ) {

                    ultimoBalao.remove();
                }


                // Mostrar erro real de forma amigável
                let mensagem =
                    "Não foi possível comunicar com o assistente.";

                if (
                    error.name === "TypeError" &&
                    error.message.includes("fetch")
                ) {

                    mensagem =
                        "Não foi possível ligar ao servidor. Verifique a sua ligação à internet e tente novamente.";

                } else if (error.message) {

                    mensagem =
                        error.message;
                }


                appendMessageVisual(
                    mensagem,
                    'bot'
                );
            }

        }
    );
}


// ==========================================
// INICIALIZAÇÃO
// ==========================================

iniciarNovaSessaoChat();
