const bancoPerguntas = [

    {
        pergunta: "Qual o alimento ideal para bebês até 6 meses?",
        opcoes: [
            "Leite materno exclusivo",
            "Papinha de frutas",
            "Suco natural",
            "Água com açúcar"
        ],
        resposta: "Leite materno exclusivo"
    },

    {
        pergunta: "Com quantos meses inicia a introdução alimentar?",
        opcoes: [
            "3 meses",
            "4 meses",
            "6 meses",
            "9 meses"
        ],
        resposta: "6 meses"
    },

    {
        pergunta: "Qual vitamina é importante para imunidade?",
        opcoes: [
            "Vitamina C",
            "Vitamina K",
            "Vitamina B12",
            "Vitamina D"
        ],
        resposta: "Vitamina C"
    },

    {
        pergunta: "Qual alimento é rico em ferro?",
        opcoes: [
            "Feijão",
            "Refrigerante",
            "Bolacha",
            "Sorvete"
        ],
        resposta: "Feijão"
    },

    {
        pergunta: "Quantos copos de água devemos beber por dia?",
        opcoes: [
            "1 copo",
            "2 copos",
            "6 a 8 copos",
            "15 copos"
        ],
        resposta: "6 a 8 copos"
    }

];


/* =========================
   VARIÁVEIS
========================= */

let perguntas = [];
let perguntaAtual = 0;
let pontuacao = 0;
let respondeu = false;


/* =========================
   ELEMENTOS HTML
========================= */

const textoPergunta =
    document.getElementById("texto_pergunta");

const listaOpcoes =
    document.getElementById("lista_opcoes");

const botaoProxima =
    document.getElementById("botao_proxima");

const barra =
    document.getElementById("barra");

const telaResultado =
    document.getElementById("tela_resultado");

const textoResultado =
    document.getElementById("texto_resultado");

const codigoSessao =
    document.getElementById("codigo_sessao");


/* =========================
   GERAR CÓDIGO DE SESSÃO
========================= */

function gerarCodigoSessao() {

    const letras =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const numeros =
        "0123456789";

    let codigo = "";

    // LETRAS
    for (let i = 0; i < 3; i++) {

        codigo +=
            letras[Math.floor(Math.random() * letras.length)];
    }

    codigo += "-";

    // NÚMEROS
    for (let i = 0; i < 4; i++) {

        codigo +=
            numeros[Math.floor(Math.random() * numeros.length)];
    }

    return codigo;
}


/* =========================
   EMBARALHAR ARRAY
========================= */

function embaralhar(array) {

    return array.sort(() => Math.random() - 0.5);
}


/* =========================
   PREPARAR QUIZ
========================= */

function prepararQuiz() {

    perguntas = [...bancoPerguntas];

    // EMBARALHAR OPÇÕES
    perguntas.forEach(pergunta => {

        pergunta.opcoes =
            embaralhar([...pergunta.opcoes]);
    });

    // EMBARALHAR PERGUNTAS
    perguntas = embaralhar(perguntas);

    perguntaAtual = 0;
    pontuacao = 0;

    // GERAR NOVA SESSÃO
    if (codigoSessao) {

        codigoSessao.innerText =
            "Sessão: " + gerarCodigoSessao();
    }

    carregarPergunta();
}


/* =========================
   CARREGAR PERGUNTA
========================= */

function carregarPergunta() {

    respondeu = false;

    limparOpcoes();

    botaoProxima.style.display = "none";

    let pergunta = perguntas[perguntaAtual];

    textoPergunta.innerText =
        pergunta.pergunta;

    pergunta.opcoes.forEach(opcao => {

        const item =
            document.createElement("li");

        item.classList.add("opcao");

        const botao =
            document.createElement("button");

        botao.classList.add("botao_opcao");

        botao.innerText = opcao;

        botao.onclick = () =>
            selecionarResposta(botao, opcao);

        item.appendChild(botao);

        listaOpcoes.appendChild(item);
    });

    atualizarProgresso();
}


/* =========================
   LIMPAR OPÇÕES
========================= */

function limparOpcoes() {

    listaOpcoes.innerHTML = "";
}


/* =========================
   SELECIONAR RESPOSTA
========================= */

function selecionarResposta(botaoSelecionado, respostaEscolhida) {

    if (respondeu) return;

    respondeu = true;

    let pergunta =
        perguntas[perguntaAtual];

    let correta =
        pergunta.resposta;

    const botoes =
        document.querySelectorAll(".botao_opcao");

    botoes.forEach(botao => {

        botao.disabled = true;

        // RESPOSTA CORRETA
        if (botao.innerText === correta) {

            botao.style.backgroundColor = "green";
            botao.style.color = "white";
        }

    });

    // SE ACERTOU
    if (respostaEscolhida === correta) {

        pontuacao++;

        // ESPERA 3 SEGUNDOS
        setTimeout(() => {

            perguntaAtual++;

            if (perguntaAtual < perguntas.length) {

                carregarPergunta();

            } else {

                mostrarResultado();
            }

        }, 2000);

    } else {

        // RESPOSTA ERRADA
        botaoSelecionado.style.backgroundColor = "red";
        botaoSelecionado.style.color = "white";

        const mensagem =
            document.createElement("p");

        mensagem.innerHTML = `
             🚨 Resposta errada! <br>
            ✅ Correta:
            <strong>${correta}</strong>
        `;

        mensagem.style.marginTop = "15px";
        mensagem.style.fontWeight = "bold";

        listaOpcoes.appendChild(mensagem);

        // MOSTRAR BOTÃO
        botaoProxima.style.display = "block";
    }
}


/* =========================
   BOTÃO PRÓXIMA
========================= */

botaoProxima.addEventListener("click", () => {

    perguntaAtual++;

    if (perguntaAtual < perguntas.length) {

        carregarPergunta();

    } else {

        mostrarResultado();
    }
});


/* =========================
   RESULTADO FINAL
========================= */

function mostrarResultado() {

    document.querySelector(".area_pergunta")
        .style.display = "none";

    telaResultado.style.display = "block";

    let percentual =
        Math.round((pontuacao / perguntas.length) * 100);

    let mensagem = "";

    if (percentual >= 80) {

        mensagem = "Excelente desempenho!";

    } else if (percentual >= 50) {

        mensagem = "Bom trabalho!";

    } else {

        mensagem = "Precisa estudar mais.";
    }

    textoResultado.innerHTML = `
        Você acertou
        <strong>${pontuacao}</strong>
        de
        <strong>${perguntas.length}</strong>
        perguntas.
        <br><br>
        ${mensagem}
    `;
}


/* =========================
   BARRA DE PROGRESSO
========================= */

function atualizarProgresso() {

    let progresso =
        ((perguntaAtual + 1) / perguntas.length) * 100;

    barra.style.width =
        progresso + "%";
}


/* =========================
   REINICIAR QUIZ
========================= */

function reiniciarQuiz() {

    telaResultado.style.display = "none";

    document.querySelector(".area_pergunta")
        .style.display = "block";

    prepararQuiz();
}


/* =========================
   INICIAR QUIZ
========================= */

prepararQuiz();