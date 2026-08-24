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

// Cole aqui a sua NOVA chave da API.
// Não publique esta chave num site público.
const GROQ_API_KEY = "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";

const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "openai/gpt-oss-20b";


// ==========================================
// MENSAGEM DO SISTEMA
// ==========================================

const promptSistema = {
    role: "system",

    content: `Você é o Benildo, um assistente virtual acolhedor, amigável e humano do projecto Vida-Fonte.

A sua principal missão é apoiar famílias, líderes comunitários e agentes de saúde com informações sobre segurança alimentar, nutrição, saúde infantil, saúde reprodutiva e combate à desnutrição infantil.

IMPORTANTE SOBRE A CONVERSA:
- Cumprimente sempre as pessoas de forma calorosa e amigável.
- Se alguém disser "Olá", "Oi", "Bom dia", "Boa tarde" ou iniciar uma conversa casual, responda naturalmente e pergunte como pode ajudar.
- Pode conversar brevemente e de forma acolhedora.
- Nunca responda "Não fui programado para isso" a um simples cumprimento, agradecimento ou conversa educada.
- Demonstre empatia, respeito e interesse pelas preocupações da pessoa.

SOBRE AS RESPOSTAS:
- Dê respostas simples, claras, práticas e fáceis de compreender.
- Organize sempre as respostas de forma bonita e fácil de ler.
- Use parágrafos curtos.
- Quando houver vários pontos importantes, utilize listas.
- Use pequenos títulos quando ajudarem a organizar a resposta.
- Destaque apenas informações importantes usando **negrito**.
- NÃO utilize tabelas com os símbolos |.
- Evite textos muito longos, confusos ou todos juntos.
- Use emojis apenas ocasionalmente e sem exagerar.
- Baseie as informações de saúde em fontes confiáveis, como a OMS e UNICEF.
- Quando apropriado, termine com um breve aconselhamento.

EXEMPLO DE UMA BOA RESPOSTA:

**Título do assunto**

Explicação simples e directa.

- Primeiro ponto importante.
- Segundo ponto importante.
- Terceiro ponto importante.

**Aconselhamento:** Uma recomendação breve, prática e acolhedora.

LIMITES:
Se a pessoa fizer uma pergunta completamente fora das áreas de saúde, nutrição, saúde reprodutiva, direitos das crianças, segurança alimentar ou factores relacionados, responda educadamente:
"Posso conversar consigo, mas fui especialmente criado para ajudar com assuntos relacionados à saúde, nutrição e bem-estar das crianças. Como posso ajudar dentro dessas áreas?"

IDENTIDADE:
Se perguntarem quem criou, desenvolveu ou é dono do assistente, informe que foi criado e desenvolvido por Benildo Dinis, da empresa NEXORA, sendo ele CEO.`
};


// ==========================================
// ESTRUTURA DOS CHATS
// ==========================================

let bancoDeChats = {};
let chatIdAtual = null;


// ==========================================
// CARREGAR O HISTÓRICO
// ==========================================

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
            "Olá! 😊 Sou Benildo, o assistente do Vida-Fonte. Estou aqui para conversar e apoiar com informações sobre saúde, nutrição e bem-estar das crianças. Como posso ajudar?",
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

        if (
            chat &&
            chat.mensagens &&
            chat.mensagens.length > 1
        ) {

            const item = document.createElement('div');

            item.className =
                `history-item ${id === chatIdAtual ? 'active' : ''}`;

            item.innerText =
                chat.titulo || "Nova conversa";

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


// ==========================================
// EVENTOS DO HISTÓRICO
// ==========================================

if (openHistoryBtn) {
    openHistoryBtn.addEventListener(
        'click',
        abrirMenuHistorico
    );
}

if (closeHistoryBtn) {
    closeHistoryBtn.addEventListener(
        'click',
        fecharMenuHistorico
    );
}

if (sidebarOverlay) {
    sidebarOverlay.addEventListener(
        'click',
        fecharMenuHistorico
    );
}

if (newChatBtn) {
    newChatBtn.addEventListener(
        'click',
        iniciarNovaSessaoChat
    );
}


// ==========================================
// LEITURA DAS RESPOSTAS POR VOZ
// ==========================================

function redefinirBotoesVoz() {

    const botoes =
        document.querySelectorAll(
            '.action-btn.audio-btn'
        );

    botoes.forEach(botao => {
        botao.classList.remove('falando');
        botao.style.color = '';
    });
}


function gerenciarLeituraTexto(texto, botao) {

    if (!('speechSynthesis' in window)) {
        alert(
            "A leitura por voz não é suportada neste navegador."
        );
        return;
    }

    // Segundo clique: parar a leitura
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

    const textoLimpo = texto
        .replace(/\*\*/g, '')
        .replace(/#/g, '')
        .replace(/`/g, '')
        .replace(/\|/g, ', ');

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
            userInput.placeholder =
                "Ouvindo a sua voz...";
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
// FORMATAR O TEXTO DAS RESPOSTAS
// ==========================================

// Esta função protege o chat e transforma
// Markdown simples em texto visual organizado.

function escaparHTML(texto) {

    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}


function formatarTextoInline(texto) {

    let resultado = escaparHTML(texto);

    // Negrito: **texto**
    resultado = resultado.replace(
        /\*\*(.*?)\*\*/g,
        '<strong>$1</strong>'
    );

    // Itálico simples: *texto*
    resultado = resultado.replace(
        /(?<!\*)\*([^*]+)\*(?!\*)/g,
        '<em>$1</em>'
    );

    return resultado;
}


function formatarTexto(texto) {

    if (
        texto === null ||
        texto === undefined
    ) {
        return '';
    }

    const linhas =
        String(texto).replace(/\r\n/g, '\n').split('\n');

    let html = '';
    let listaAberta = false;
    let listaNumeradaAberta = false;


    function fecharListas() {

        if (listaAberta) {
            html += '</ul>';
            listaAberta = false;
        }

        if (listaNumeradaAberta) {
            html += '</ol>';
            listaNumeradaAberta = false;
        }
    }


    for (let i = 0; i < linhas.length; i++) {

        const linha = linhas[i].trim();

        // Linha vazia
        if (!linha) {

            fecharListas();
            continue;
        }


        // Título nível 1
        if (/^#\s+/.test(linha)) {

            fecharListas();

            html +=
                `<h2>${formatarTextoInline(
                    linha.replace(/^#\s+/, '')
                )}</h2>`;

            continue;
        }


        // Título nível 2
        if (/^##\s+/.test(linha)) {

            fecharListas();

            html +=
                `<h3>${formatarTextoInline(
                    linha.replace(/^##\s+/, '')
                )}</h3>`;

            continue;
        }


        // Título nível 3
        if (/^###\s+/.test(linha)) {

            fecharListas();

            html +=
                `<h4>${formatarTextoInline(
                    linha.replace(/^###\s+/, '')
                )}</h4>`;

            continue;
        }


        // Separador
        if (/^---+$/.test(linha)) {

            fecharListas();
            html += '<hr>';
            continue;
        }


        // Lista normal
        if (/^[-•]\s+/.test(linha)) {

            if (listaNumeradaAberta) {
                html += '</ol>';
                listaNumeradaAberta = false;
            }

            if (!listaAberta) {
                html += '<ul>';
                listaAberta = true;
            }

            const conteudo =
                linha.replace(/^[-•]\s+/, '');

            html +=
                `<li>${formatarTextoInline(
                    conteudo
                )}</li>`;

            continue;
        }


        // Lista numerada
        if (/^\d+[.)]\s+/.test(linha)) {

            if (listaAberta) {
                html += '</ul>';
                listaAberta = false;
            }

            if (!listaNumeradaAberta) {
                html += '<ol>';
                listaNumeradaAberta = true;
            }

            const conteudo =
                linha.replace(/^\d+[.)]\s+/, '');

            html +=
                `<li>${formatarTextoInline(
                    conteudo
                )}</li>`;

            continue;
        }


        // Transformar linhas antigas com | em texto normal
        if (linha.includes('|')) {

            fecharListas();

            const partes = linha
                .split('|')
                .map(item => item.trim())
                .filter(item => item);

            // Ignorar linhas de separação de tabelas
            const apenasSeparador =
                partes.every(item =>
                    /^[-:\s]+$/.test(item)
                );

            if (!apenasSeparador && partes.length > 0) {

                html +=
                    `<p>${partes
                        .map(item =>
                            formatarTextoInline(item)
                        )
                        .join('<br>')
                    }</p>`;

            }

            continue;
        }


        // Parágrafo normal
        fecharListas();

        html +=
            `<p>${formatarTextoInline(
                linha
            )}</p>`;
    }


    fecharListas();

    return html;
}


// ==========================================
// ESTILOS PARA AS RESPOSTAS FICAREM BONITAS
// ==========================================

function adicionarEstilosFormatacao() {

    if (
        document.getElementById(
            'vida-fonte-formatacao'
        )
    ) {
        return;
    }

    const style =
        document.createElement('style');

    style.id = 'vida-fonte-formatacao';

    style.textContent = `

        .message-content {
            line-height: 1.65;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }

        .message-content p {
            margin: 0 0 10px 0;
        }

        .message-content p:last-child {
            margin-bottom: 0;
        }

        .message-content h2,
        .message-content h3,
        .message-content h4 {
            line-height: 1.3;
            margin: 14px 0 8px;
        }

        .message-content h2 {
            font-size: 18px;
        }

        .message-content h3 {
            font-size: 16px;
        }

        .message-content h4 {
            font-size: 15px;
        }

        .message-content ul,
        .message-content ol {
            margin: 8px 0 12px;
            padding-left: 22px;
        }

        .message-content li {
            margin: 6px 0;
            padding-left: 2px;
        }

        .message-content strong {
            font-weight: 700;
        }

        .message-content em {
            font-style: italic;
        }

        .message-content hr {
            border: none;
            border-top: 1px solid rgba(0, 0, 0, 0.15);
            margin: 14px 0;
        }
    `;

    document.head.appendChild(style);
}


// ==========================================
// MOSTRAR MENSAGENS NO CHAT
// ==========================================

function appendMessageVisual(text, sender) {

    if (!chatMessages) return null;

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


    // Formatar as respostas do assistente
    // As mensagens do utilizador continuam simples
    if (sender === 'bot') {

        messageContent.innerHTML =
            formatarTexto(text);

    } else {

        messageContent.textContent = text;
    }


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

        copiarBtn.title =
            "Copiar texto";

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

            if (!userInput) return;

            const messageText =
                userInput.value.trim();

            if (!messageText) return;


            // Verificar se existe uma conversa activa
            if (
                !chatIdAtual ||
                !bancoDeChats[chatIdAtual]
            ) {
                iniciarNovaSessaoChat();
            }


            // Verificar a chave
            if (
                !GROQ_API_KEY ||
                GROQ_API_KEY ===
                "COLOQUE_AQUI_A_SUA_CHAVE"
            ) {

                appendMessageVisual(
                    "A chave da API ainda não foi configurada. Configure a chave para utilizar o assistente.",
                    'bot'
                );

                return;
            }


            const chatAtual =
                bancoDeChats[chatIdAtual];


            // Definir o título da primeira pergunta
            if (
                chatAtual.mensagens.length === 1
            ) {

                chatAtual.titulo =
                    messageText.length > 25
                        ? messageText.substring(
                            0,
                            25
                        ) + "..."
                        : messageText;
            }


            // Guardar a pergunta
            chatAtual.mensagens.push({
                role: "user",
                content: messageText
            });

            atualizarArmazenamentoLocal();
            renderizarListaHistorico();


            // Mostrar a pergunta
            appendMessageVisual(
                messageText,
                'user'
            );

            userInput.value = '';


            // Parar leitura anterior
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                redefinirBotoesVoz();
            }


            // Mostrar "Digitando..."
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

                            temperature: 0.4,

                            max_tokens: 800

                        })

                    });


                // Ler a resposta
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


                // Obter a resposta
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


                // Guardar a resposta
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


                // Mostrar a resposta organizada
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

// Adiciona automaticamente os estilos
// para organizar as respostas
adicionarEstilosFormatacao();

// Inicia o chat
iniciarNovaSessaoChat();