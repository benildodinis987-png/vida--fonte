/* ==========================================
   ELEMENTOS DO FORMULÁRIO
========================================== */

const nomeInput = document.getElementById("nome");
const dataNascimentoInput = document.getElementById("data-nascimento");
const bairroInput = document.getElementById("bar");
const generoInput = document.getElementById("gener");
const telefoneInput = document.getElementById("telefone");
const senhaInput = document.getElementById("senha");
const confirmarSenhaInput = document.getElementById("confirmar-senha");


/* ==========================================
   CORES DOS CAMPOS
========================================== */

function campoValido(campo) {
    campo.classList.remove("campo-invalido");
    campo.classList.add("campo-valido");
}


function campoInvalido(campo) {
    campo.classList.remove("campo-valido");
    campo.classList.add("campo-invalido");
}


function campoNormal(campo) {
    campo.classList.remove("campo-valido");
    campo.classList.remove("campo-invalido");
}


/* ==========================================
   VALIDAR NOME
   SOMENTE LETRAS E ESPAÇOS
========================================== */

function validarNome() {

    const nome = nomeInput.value.trim();

    if (nome === "") {
        campoNormal(nomeInput);
        return false;
    }

    const nomeRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;

    if (!nomeRegex.test(nome)) {
        campoInvalido(nomeInput);
        return false;
    }

    const partesNome = nome.split(/\s+/);

    if (partesNome.length < 2) {
        campoInvalido(nomeInput);
        return false;
    }

    campoValido(nomeInput);

    return true;
}


/* ==========================================
   VALIDAR DATA DE NASCIMENTO
========================================== */

function validarData() {

    const data = dataNascimentoInput.value;

    if (data === "") {
        campoNormal(dataNascimentoInput);
        return false;
    }

    const dataObj = new Date(data + "T00:00:00");

    const hoje = new Date();

    hoje.setHours(0, 0, 0, 0);

    if (dataObj > hoje) {
        campoInvalido(dataNascimentoInput);
        return false;
    }

    campoValido(dataNascimentoInput);

    return true;
}


/* ==========================================
   VALIDAR LOCALIZAÇÃO
   LETRAS, NÚMEROS E PONTUAÇÃO
========================================== */

function validarBairro() {

    const bairro = bairroInput.value.trim();

    if (bairro === "") {
        campoNormal(bairroInput);
        return false;
    }

    const bairroRegex =
        /^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s.,'-]+$/;

    if (!bairroRegex.test(bairro)) {
        campoInvalido(bairroInput);
        return false;
    }

    campoValido(bairroInput);

    return true;
}


/* ==========================================
   VALIDAR GÉNERO
========================================== */

function validarGenero() {

    if (!["1", "2", "3"].includes(generoInput.value)) {

        campoInvalido(generoInput);

        return false;
    }

    campoValido(generoInput);

    return true;
}


/* ==========================================
   VALIDAR TELEFONE
   SOMENTE NÚMEROS
========================================== */

function validarTelefone() {

    const telefone = telefoneInput.value.trim();

    if (telefone === "") {
        campoNormal(telefoneInput);
        return false;
    }

    const telefoneRegex = /^[0-9]+$/;

    if (!telefoneRegex.test(telefone)) {
        campoInvalido(telefoneInput);
        return false;
    }

    if (telefone.length !== 9) {
        campoInvalido(telefoneInput);
        return false;
    }

    const prefixosValidos = [
        "82",
        "83",
        "84",
        "85",
        "86",
        "87"
    ];

    const prefixo = telefone.substring(0, 2);

    if (!prefixosValidos.includes(prefixo)) {
        campoInvalido(telefoneInput);
        return false;
    }

    campoValido(telefoneInput);

    return true;
}


/* ==========================================
   VALIDAR SENHA
   MÍNIMO 6 CARACTERES
   PODE TER LETRAS, NÚMEROS E SÍMBOLOS
========================================== */

function validarSenha() {

    const senha = senhaInput.value;

    if (senha === "") {
        campoNormal(senhaInput);
        return false;
    }

    if (senha.length < 6) {
        campoInvalido(senhaInput);
        return false;
    }

    campoValido(senhaInput);

    return true;
}


/* ==========================================
   CONFIRMAR SENHA
========================================== */

function validarConfirmacaoSenha() {

    const senha = senhaInput.value;
    const confirmar = confirmarSenhaInput.value;

    if (confirmar === "") {
        campoNormal(confirmarSenhaInput);
        return false;
    }

    if (senha !== confirmar) {
        campoInvalido(confirmarSenhaInput);
        return false;
    }

    campoValido(confirmarSenhaInput);

    return true;
}


/* ==========================================
   VALIDAÇÃO AUTOMÁTICA
========================================== */

nomeInput.addEventListener("input", validarNome);

dataNascimentoInput.addEventListener("change", validarData);

bairroInput.addEventListener("input", validarBairro);

generoInput.addEventListener("change", validarGenero);

telefoneInput.addEventListener("input", function () {

    /* Remove tudo que não for número */

    this.value = this.value.replace(/\D/g, "");

    validarTelefone();

});


senhaInput.addEventListener("input", function () {

    validarSenha();

    if (confirmarSenhaInput.value !== "") {
        validarConfirmacaoSenha();
    }

});


confirmarSenhaInput.addEventListener(
    "input",
    validarConfirmacaoSenha
);


/* ==========================================
   REGISTRAR
========================================== */

function registrar() {

    const nomeValido = validarNome();
    const dataValida = validarData();
    const bairroValido = validarBairro();
    const generoValido = validarGenero();
    const telefoneValido = validarTelefone();
    const senhaValida = validarSenha();
    const confirmacaoValida = validarConfirmacaoSenha();


    /* ======================================
       VERIFICAR TODOS OS CAMPOS
    ====================================== */

    if (
        !nomeValido ||
        !dataValida ||
        !bairroValido ||
        !generoValido ||
        !telefoneValido ||
        !senhaValida ||
        !confirmacaoValida
    ) {

        alert(
            "Existem campos incorrectos. Verifique os campos assinalados a vermelho."
        );

        /* Colocar foco no primeiro campo inválido */

        if (!nomeValido) {
            nomeInput.focus();
        }
        else if (!dataValida) {
            dataNascimentoInput.focus();
        }
        else if (!bairroValido) {
            bairroInput.focus();
        }
        else if (!generoValido) {
            generoInput.focus();
        }
        else if (!telefoneValido) {
            telefoneInput.focus();
        }
        else if (!senhaValida) {
            senhaInput.focus();
        }
        else if (!confirmacaoValida) {
            confirmarSenhaInput.focus();
        }

        return;
    }


    /* ======================================
       VERIFICAR SE O TELEFONE JÁ EXISTE
    ====================================== */

    const usuarioExistente =
        localStorage.getItem("usuario");

    if (usuarioExistente) {

        try {

            const dadosExistentes =
                JSON.parse(usuarioExistente);

            if (dadosExistentes.telefone === telefoneInput.value.trim()) {

                campoInvalido(telefoneInput);

                alert(
                    "Este número de telefone já está cadastrado."
                );

                telefoneInput.focus();

                return;
            }

        } catch (erro) {

            console.error(
                "Erro ao ler os dados existentes:",
                erro
            );

        }
    }


    /* ======================================
       CRIAR OBJECTO DO UTILIZADOR
    ====================================== */

    const usuario = {

        nome: nomeInput.value.trim(),

        dataNascimento:
            dataNascimentoInput.value,

        bairro:
            bairroInput.value.trim(),

        genero:
            generoInput.value,

        telefone:
            telefoneInput.value.trim(),

        senha:
            senhaInput.value,

        dataCadastro:
            new Date().toISOString()

    };


    /* ======================================
       GUARDAR UTILIZADOR
    ====================================== */

    localStorage.setItem(
        "usuario",
        JSON.stringify(usuario)
    );


    /* ======================================
       CRIAR SESSÃO
    ====================================== */

    localStorage.setItem(
        "usuarioLogado",
        "true"
    );


    localStorage.setItem(
        "telefoneUsuario",
        usuario.telefone
    );


    /* ======================================
       GUARDAR NOME
    ====================================== */

    localStorage.setItem(
        "nomeCrianca",
        usuario.nome
    );


    /* ======================================
       PREPARAR POPUP
    ====================================== */

    document.getElementById(
        "nomeCriancaPopup"
    ).textContent = usuario.nome;


    /* ======================================
       MOSTRAR POPUP
    ====================================== */

    document.getElementById(
        "popupSucesso"
    ).classList.add("mostrar");

}


/* ==========================================
   FECHAR POPUP
========================================== */

function fecharPopup() {

    document.getElementById(
        "popupSucesso"
    ).classList.remove("mostrar");


    /* Ir para a página de login */

    window.location.href = "index.html";
}
