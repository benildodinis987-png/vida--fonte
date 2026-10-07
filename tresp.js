/* =========================================================
   VIDA FONTE - REGISTO DE CRIANÇA
   tresp.js
   ========================================================= */


/* =========================================================
   ELEMENTOS DO FORMULÁRIO
   ========================================================= */

const nomeInput = document.getElementById("nome");
const dataNascimentoInput = document.getElementById("data-nascimento");
const bairroInput = document.getElementById("bar");
const generoInput = document.getElementById("gener");
const telefoneInput = document.getElementById("telefone");
const senhaInput = document.getElementById("senha");
const confirmarSenhaInput = document.getElementById("confirmar-senha");


/* =========================================================
   FUNÇÃO PARA MARCAR CAMPO COMO VÁLIDO
   ========================================================= */

function campoValido(campo) {

    if (!campo) return;

    campo.classList.remove("campo-invalido");
    campo.classList.add("campo-valido");
}


/* =========================================================
   FUNÇÃO PARA MARCAR CAMPO COMO INVÁLIDO
   ========================================================= */

function campoInvalido(campo) {

    if (!campo) return;

    campo.classList.remove("campo-valido");
    campo.classList.add("campo-invalido");
}


/* =========================================================
   REMOVER ESTADO DE VALIDAÇÃO
   ========================================================= */

function limparEstado(campo) {

    if (!campo) return;

    campo.classList.remove("campo-valido");
    campo.classList.remove("campo-invalido");
}


/* =========================================================
   VALIDAR NOME
   Apenas letras e espaços
   ========================================================= */

function validarNome() {

    if (!nomeInput) return false;

    const nome = nomeInput.value.trim();

    // Permite letras portuguesas e espaços
    const regexNome = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;

    if (nome.length < 2 || !regexNome.test(nome)) {

        campoInvalido(nomeInput);
        return false;
    }

    campoValido(nomeInput);
    return true;
}


/* =========================================================
   VALIDAR DATA DE NASCIMENTO
   Não pode estar vazia
   Não pode ser uma data futura
   ========================================================= */

function validarDataNascimento() {

    if (!dataNascimentoInput) return false;

    const data = dataNascimentoInput.value;

    if (!data) {

        campoInvalido(dataNascimentoInput);
        return false;
    }

    const dataSelecionada = new Date(data + "T00:00:00");
    const hoje = new Date();

    hoje.setHours(0, 0, 0, 0);

    if (dataSelecionada > hoje) {

        campoInvalido(dataNascimentoInput);
        return false;
    }

    campoValido(dataNascimentoInput);
    return true;
}


/* =========================================================
   VALIDAR BAIRRO / LOCAL ONDE VIVE
   Permite letras, números, espaços e pontuação comum
   ========================================================= */

function validarBairro() {

    if (!bairroInput) return false;

    const bairro = bairroInput.value.trim();

    const regexBairro = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s.,'’\-\/]+$/;

    if (
        bairro.length < 2 ||
        !regexBairro.test(bairro)
    ) {

        campoInvalido(bairroInput);
        return false;
    }

    campoValido(bairroInput);
    return true;
}


/* =========================================================
   VALIDAR GÉNERO
   Valores permitidos:
   1 = Homem
   2 = Mulher
   3 = Outro
   ========================================================= */

function validarGenero() {

    if (!generoInput) return false;

    const genero = generoInput.value;

    if (!["1", "2", "3"].includes(genero)) {

        campoInvalido(generoInput);
        return false;
    }

    campoValido(generoInput);
    return true;
}


/* =========================================================
   VALIDAR TELEFONE
   Moçambique:
   82, 83, 84, 85, 86 ou 87
   Exactamente 9 dígitos
   ========================================================= */

function validarTelefone() {

    if (!telefoneInput) return false;

    // Remover tudo que não seja número
    telefoneInput.value = telefoneInput.value.replace(/\D/g, "");

    const telefone = telefoneInput.value;

    const regexTelefone = /^(82|83|84|85|86|87)\d{7}$/;

    if (!regexTelefone.test(telefone)) {

        campoInvalido(telefoneInput);
        return false;
    }

    campoValido(telefoneInput);
    return true;
}


/* =========================================================
   VALIDAR SENHA
   Mínimo de 6 caracteres
   ========================================================= */

function validarSenha() {

    if (!senhaInput) return false;

    const senha = senhaInput.value;

    if (senha.length < 6) {

        campoInvalido(senhaInput);
        return false;
    }

    campoValido(senhaInput);
    return true;
}


/* =========================================================
   VALIDAR CONFIRMAÇÃO DA SENHA
   ========================================================= */

function validarConfirmarSenha() {

    if (!confirmarSenhaInput) return false;

    const senha = senhaInput.value;
    const confirmarSenha = confirmarSenhaInput.value;

    if (
        confirmarSenha.length < 6 ||
        confirmarSenha !== senha
    ) {

        campoInvalido(confirmarSenhaInput);
        return false;
    }

    campoValido(confirmarSenhaInput);
    return true;
}


/* =========================================================
   VALIDAÇÃO AUTOMÁTICA ENQUANTO O UTILIZADOR ESCREVE
   ========================================================= */

if (nomeInput) {

    nomeInput.addEventListener("input", validarNome);
}

if (dataNascimentoInput) {

    dataNascimentoInput.addEventListener("change", validarDataNascimento);
}

if (bairroInput) {

    bairroInput.addEventListener("input", validarBairro);
}

if (generoInput) {

    generoInput.addEventListener("change", validarGenero);
}

if (telefoneInput) {

    telefoneInput.addEventListener("input", function () {

        // Permitir apenas números
        this.value = this.value.replace(/\D/g, "");

        // Limitar a 9 dígitos
        if (this.value.length > 9) {

            this.value = this.value.substring(0, 9);
        }

        validarTelefone();
    });
}

if (senhaInput) {

    senhaInput.addEventListener("input", function () {

        validarSenha();

        // Actualizar também a confirmação
        if (confirmarSenhaInput.value.length > 0) {
            validarConfirmarSenha();
        }
    });
}

if (confirmarSenhaInput) {

    confirmarSenhaInput.addEventListener(
        "input",
        validarConfirmarSenha
    );
}


/* =========================================================
   FUNÇÃO PRINCIPAL DE REGISTO
   ========================================================= */

function registrar() {

    // Executar todas as validações
    const nomeValido = validarNome();
    const dataValida = validarDataNascimento();
    const bairroValido = validarBairro();
    const generoValido = validarGenero();
    const telefoneValido = validarTelefone();
    const senhaValida = validarSenha();
    const confirmacaoValida = validarConfirmarSenha();


    /* =====================================================
       SE ALGUM CAMPO FOR INVÁLIDO
       ===================================================== */

    if (
        !nomeValido ||
        !dataValida ||
        !bairroValido ||
        !generoValido ||
        !telefoneValido ||
        !senhaValida ||
        !confirmacaoValida
    ) {

        // Mostrar mensagem sem utilizar alert em excesso
        alert(
            "Por favor, corrija os campos destacados a vermelho."
        );

        return;
    }


    /* =====================================================
       VERIFICAR SE JÁ EXISTE UMA CONTA COM O MESMO TELEFONE
       ===================================================== */

    const usuarioExistente =
        JSON.parse(localStorage.getItem("usuario"));

    if (
        usuarioExistente &&
        usuarioExistente.telefone === telefoneInput.value.trim()
    ) {

        campoInvalido(telefoneInput);

        alert(
            "Este número de telefone já está registado na plataforma VidaFonte."
        );

        telefoneInput.focus();

        return;
    }


    /* =====================================================
       CRIAR OBJECTO DO UTILIZADOR
       ===================================================== */

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


    /* =====================================================
       GUARDAR OS DADOS
       ===================================================== */

    // Principal
    localStorage.setItem(
        "usuario",
        JSON.stringify(usuario)
    );

    // Dados utilizados pelo perfil
    localStorage.setItem(
        "dadosBebe",
        JSON.stringify(usuario)
    );

    // Informações auxiliares
    localStorage.setItem(
        "telefoneUsuario",
        usuario.telefone
    );

    localStorage.setItem(
        "nomeCrianca",
        usuario.nome
    );


    /* =====================================================
       IMPORTANTE:
       NÃO DEFINIMOS "logado" AQUI.

       O utilizador será considerado autenticado
       somente depois de introduzir correctamente
       telefone + senha no LOGIN.
       ===================================================== */

    localStorage.removeItem("logado");
    localStorage.removeItem("usuarioLogado");


    /* =====================================================
       MOSTRAR NOME NO POPUP
       ===================================================== */

    const nomePopup =
        document.getElementById("nomeCriancaPopup");

    if (nomePopup) {

        nomePopup.textContent = usuario.nome;
    }


    /* =====================================================
       MOSTRAR POPUP DE SUCESSO
       ===================================================== */

    const popup =
        document.getElementById("popupSucesso");

    if (popup) {

        popup.classList.add("mostrar");

    } else {

        // Caso o popup não exista no HTML
        alert(
            "Parabéns! A conta de " +
            usuario.nome +
            " foi criada com sucesso na plataforma VidaFonte."
        );
    }
}


/* =========================================================
   FECHAR POPUP
   ========================================================= */

function fecharPopup() {

    const popup =
        document.getElementById("popupSucesso");

    if (!popup) return;

    popup.classList.remove("mostrar");


    /* =====================================================
       DEPOIS DO REGISTO, IR PARA O LOGIN
       ===================================================== */

    setTimeout(function () {

        window.location.href = "index.html";

    }, 300);
}


/* =========================================================
   IMPEDIR FORMULÁRIO DE SER ENVIADO AUTOMATICAMENTE
   ========================================================= */

const formulario =
    document.querySelector("form");

if (formulario) {

    formulario.addEventListener("submit", function (event) {

        event.preventDefault();

        registrar();
    });
}
