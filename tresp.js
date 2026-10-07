/* =========================================================
   VIDA FONTE
   tresp.js
   REGISTO + RECUPERAÇÃO DE SENHA
   ========================================================= */


/* =========================================================
   DETECTAR PÁGINA
   ========================================================= */

const selectMetodo = document.getElementById("gener");

/*
   Na página de REGISTO:
   1 = Homem
   2 = Mulher
   3 = Outro

   Na página de RECUPERAÇÃO:
   1 = Telefone
   2 = G-mail

   Assim conseguimos distinguir automaticamente as páginas.
*/

const paginaRecuperacao =
    selectMetodo &&
    selectMetodo.querySelector('option[value="3"]') === null;


/* =========================================================
   ELEMENTOS COMUNS
   ========================================================= */

const nomeInput = document.getElementById("nome");
const telefoneInput = document.getElementById("telefone");
const senhaInput = document.getElementById("senha");
const confirmarSenhaInput =
    document.getElementById("confirmar-senha");


/* =========================================================
   FUNÇÕES DE ESTADO DOS CAMPOS
   ========================================================= */

function campoValido(campo) {

    if (!campo) return;

    campo.classList.remove("campo-invalido");
    campo.classList.add("campo-valido");
}


function campoInvalido(campo) {

    if (!campo) return;

    campo.classList.remove("campo-valido");
    campo.classList.add("campo-invalido");
}


function limparEstado(campo) {

    if (!campo) return;

    campo.classList.remove("campo-valido");
    campo.classList.remove("campo-invalido");
}


/* =========================================================
   ==================== REGISTO =============================
   ========================================================= */


/* =========================================================
   ELEMENTOS DO REGISTO
   ========================================================= */

const dataNascimentoInput =
    document.getElementById("data-nascimento");

const bairroInput =
    document.getElementById("bar");

const generoInput =
    document.getElementById("gener");


/*
   Só executar as validações de registo quando estivermos
   realmente na página de registo.
*/

if (!paginaRecuperacao) {


    /* =====================================================
       VALIDAR NOME
       ===================================================== */

    function validarNome() {

        if (!nomeInput) return false;

        const nome = nomeInput.value.trim();

        const regexNome =
            /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;

        if (
            nome.length < 2 ||
            !regexNome.test(nome)
        ) {

            campoInvalido(nomeInput);
            return false;
        }

        campoValido(nomeInput);
        return true;
    }


    /* =====================================================
       VALIDAR DATA DE NASCIMENTO
       ===================================================== */

    function validarDataNascimento() {

        if (!dataNascimentoInput) return false;

        const data =
            dataNascimentoInput.value;

        if (!data) {

            campoInvalido(dataNascimentoInput);
            return false;
        }

        const dataSelecionada =
            new Date(data + "T00:00:00");

        const hoje = new Date();

        hoje.setHours(0, 0, 0, 0);

        if (dataSelecionada > hoje) {

            campoInvalido(dataNascimentoInput);
            return false;
        }

        campoValido(dataNascimentoInput);
        return true;
    }


    /* =====================================================
       VALIDAR BAIRRO
       ===================================================== */

    function validarBairro() {

        if (!bairroInput) return false;

        const bairro =
            bairroInput.value.trim();

        const regexBairro =
            /^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s.,'’\-\/]+$/;

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


    /* =====================================================
       VALIDAR GÉNERO
       ===================================================== */

    function validarGenero() {

        if (!generoInput) return false;

        const genero =
            generoInput.value;

        if (
            !["1", "2", "3"].includes(genero)
        ) {

            campoInvalido(generoInput);
            return false;
        }

        campoValido(generoInput);
        return true;
    }


    /* =====================================================
       VALIDAR TELEFONE
       ===================================================== */

    function validarTelefone() {

        if (!telefoneInput) return false;

        telefoneInput.value =
            telefoneInput.value.replace(/\D/g, "");

        const telefone =
            telefoneInput.value;

        const regexTelefone =
            /^(82|83|84|85|86|87)\d{7}$/;

        if (!regexTelefone.test(telefone)) {

            campoInvalido(telefoneInput);
            return false;
        }

        campoValido(telefoneInput);
        return true;
    }


    /* =====================================================
       VALIDAR SENHA
       ===================================================== */

    function validarSenha() {

        if (!senhaInput) return false;

        const senha =
            senhaInput.value;

        if (senha.length < 6) {

            campoInvalido(senhaInput);
            return false;
        }

        campoValido(senhaInput);
        return true;
    }


    /* =====================================================
       VALIDAR CONFIRMAÇÃO
       ===================================================== */

    function validarConfirmarSenha() {

        if (!confirmarSenhaInput) return false;

        const senha =
            senhaInput.value;

        const confirmarSenha =
            confirmarSenhaInput.value;

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


    /* =====================================================
       EVENTOS DO REGISTO
       ===================================================== */

    if (nomeInput) {

        nomeInput.addEventListener(
            "input",
            validarNome
        );
    }


    if (dataNascimentoInput) {

        dataNascimentoInput.addEventListener(
            "change",
            validarDataNascimento
        );
    }


    if (bairroInput) {

        bairroInput.addEventListener(
            "input",
            validarBairro
        );
    }


    if (generoInput) {

        generoInput.addEventListener(
            "change",
            validarGenero
        );
    }


    if (telefoneInput) {

        telefoneInput.addEventListener(
            "input",
            function () {

                this.value =
                    this.value.replace(/\D/g, "");

                if (this.value.length > 9) {

                    this.value =
                        this.value.substring(0, 9);
                }

                validarTelefone();
            }
        );
    }


    if (senhaInput) {

        senhaInput.addEventListener(
            "input",
            function () {

                validarSenha();

                if (
                    confirmarSenhaInput &&
                    confirmarSenhaInput.value.length > 0
                ) {

                    validarConfirmarSenha();
                }
            }
        );
    }


    if (confirmarSenhaInput) {

        confirmarSenhaInput.addEventListener(
            "input",
            validarConfirmarSenha
        );
    }


    /* =====================================================
       REGISTRAR
       ===================================================== */

    function registrar() {

        const nomeValido =
            validarNome();

        const dataValida =
            validarDataNascimento();

        const bairroValido =
            validarBairro();

        const generoValido =
            validarGenero();

        const telefoneValido =
            validarTelefone();

        const senhaValida =
            validarSenha();

        const confirmacaoValida =
            validarConfirmarSenha();


        /* =================================================
           VERIFICAR CAMPOS
           ================================================= */

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
                "Por favor, corrija os campos destacados a vermelho."
            );

            return;
        }


        /* =================================================
           VERIFICAR SE JÁ EXISTE CONTA
           ================================================= */

        const usuarioExistente =
            JSON.parse(
                localStorage.getItem("usuario")
            );


        if (
            usuarioExistente &&
            usuarioExistente.telefone ===
            telefoneInput.value.trim()
        ) {

            campoInvalido(telefoneInput);

            alert(
                "Este número de telefone já está registado na plataforma VidaFonte."
            );

            telefoneInput.focus();

            return;
        }


        /* =================================================
           CRIAR UTILIZADOR
           ================================================= */

        const usuario = {

            nome:
                nomeInput.value.trim(),

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


        /* =================================================
           GUARDAR UTILIZADOR
           ================================================= */

        localStorage.setItem(
            "usuario",
            JSON.stringify(usuario)
        );


        localStorage.setItem(
            "dadosBebe",
            JSON.stringify(usuario)
        );


        localStorage.setItem(
            "telefoneUsuario",
            usuario.telefone
        );


        localStorage.setItem(
            "nomeCrianca",
            usuario.nome
        );


        /* =================================================
           NÃO ENTRAR AUTOMATICAMENTE
           ================================================= */

        localStorage.removeItem("logado");

        localStorage.removeItem(
            "usuarioLogado"
        );


        /* =================================================
           POPUP
           ================================================= */

        const nomePopup =
            document.getElementById(
                "nomeCriancaPopup"
            );

        if (nomePopup) {

            nomePopup.textContent =
                usuario.nome;
        }


        const popup =
            document.getElementById(
                "popupSucesso"
            );


        if (popup) {

            popup.classList.add("mostrar");

        } else {

            alert(
                "Parabéns! A conta de " +
                usuario.nome +
                " foi criada com sucesso na plataforma VidaFonte."
            );
        }
    }


    /* =====================================================
       DISPONIBILIZAR REGISTRAR GLOBALMENTE
       ===================================================== */

    window.registrar = registrar;


    /* =====================================================
       FECHAR POPUP
       ===================================================== */

    function fecharPopup() {

        const popup =
            document.getElementById(
                "popupSucesso"
            );

        if (!popup) return;

        popup.classList.remove(
            "mostrar"
        );


        setTimeout(
            function () {

                window.location.href =
                    "index.html";

            },
            300
        );
    }


    window.fecharPopup =
        fecharPopup;
}


/* =========================================================
   ================= RECUPERAÇÃO ===========================
   ========================================================= */


/*
   Esta parte é executada apenas na página de recuperação.
*/

if (paginaRecuperacao) {


    /* =====================================================
       CAMPOS DA RECUPERAÇÃO
       ===================================================== */

    /*
       ATENÇÃO:

       No teu HTML atual:

       data-nascimento = G-mail ou Telefone
       gener           = método de recebimento
       telefone       = número de telefone
       bar             = código recebido
       senha           = nova senha
       confirmar-senha = confirmar nova senha
    */

    const contactoRecuperacao =
        document.getElementById(
            "data-nascimento"
        );

    const codigoRecuperacao =
        document.getElementById(
            "bar"
        );


    /* =====================================================
       VALIDAR NOME
       ===================================================== */

    function validarNomeRecuperacao() {

        if (!nomeInput) return false;

        const nome =
            nomeInput.value.trim();

        if (nome.length < 2) {

            campoInvalido(nomeInput);
            return false;
        }

        campoValido(nomeInput);
        return true;
    }


    /* =====================================================
       VALIDAR CONTACTO
       ===================================================== */

    function validarContactoRecuperacao() {

        if (!contactoRecuperacao)
            return false;

        const contacto =
            contactoRecuperacao.value.trim();

        if (contacto.length < 5) {

            campoInvalido(
                contactoRecuperacao
            );

            return false;
        }

        campoValido(
            contactoRecuperacao
        );

        return true;
    }


    /* =====================================================
       VALIDAR MÉTODO
       ===================================================== */

    function validarMetodoRecuperacao() {

        if (!generoInput)
            return false;

        const metodo =
            generoInput.value;

        if (
            !["1", "2"].includes(metodo)
        ) {

            campoInvalido(
                generoInput
            );

            return false;
        }

        campoValido(
            generoInput
        );

        return true;
    }


    /* =====================================================
       VALIDAR CÓDIGO
       ===================================================== */

    function validarCodigoRecuperacao() {

        if (!codigoRecuperacao)
            return false;

        const codigo =
            codigoRecuperacao.value.trim();

        if (codigo.length < 4) {

            campoInvalido(
                codigoRecuperacao
            );

            return false;
        }

        campoValido(
            codigoRecuperacao
        );

        return true;
    }


    /* =====================================================
       VALIDAR NOVA SENHA
       ===================================================== */

    function validarNovaSenha() {

        if (!senhaInput)
            return false;

        if (
            senhaInput.value.length < 6
        ) {

            campoInvalido(
                senhaInput
            );

            return false;
        }

        campoValido(
            senhaInput
        );

        return true;
    }


    /* =====================================================
       VALIDAR CONFIRMAÇÃO
       ===================================================== */

    function validarNovaConfirmacao() {

        if (!confirmarSenhaInput)
            return false;

        if (
            confirmarSenhaInput.value.length < 6 ||
            confirmarSenhaInput.value !==
            senhaInput.value
        ) {

            campoInvalido(
                confirmarSenhaInput
            );

            return false;
        }

        campoValido(
            confirmarSenhaInput
        );

        return true;
    }


    /* =====================================================
       EVENTOS
       ===================================================== */

    if (nomeInput) {

        nomeInput.addEventListener(
            "input",
            validarNomeRecuperacao
        );
    }


    if (contactoRecuperacao) {

        contactoRecuperacao.addEventListener(
            "input",
            validarContactoRecuperacao
        );
    }


    if (generoInput) {

        generoInput.addEventListener(
            "change",
            validarMetodoRecuperacao
        );
    }


    if (codigoRecuperacao) {

        codigoRecuperacao.addEventListener(
            "input",
            validarCodigoRecuperacao
        );
    }


    if (senhaInput) {

        senhaInput.addEventListener(
            "input",
            function () {

                validarNovaSenha();

                if (
                    confirmarSenhaInput &&
                    confirmarSenhaInput.value
                ) {

                    validarNovaConfirmacao();
                }
            }
        );
    }


    if (confirmarSenhaInput) {

        confirmarSenhaInput.addEventListener(
            "input",
            validarNovaConfirmacao
        );
    }


    /* =====================================================
       GERAR CÓDIGO DE RECUPERAÇÃO
       ===================================================== */

    function gerarCodigoRecuperacao() {

        const codigo =
            Math.floor(
                100000 +
                Math.random() * 900000
            ).toString();


        localStorage.setItem(
            "codigoRecuperacao",
            codigo
        );


        localStorage.setItem(
            "codigoRecuperacaoData",
            Date.now().toString()
        );


        /*
           Isto é apenas para testes locais.

           Numa versão real, o código deve ser enviado
           por SMS ou Gmail através de um servidor.
        */

        alert(
            "Código de recuperação gerado para teste: " +
            codigo
        );


        return codigo;
    }


    /* =====================================================
       RECUPERAR SENHA
       ===================================================== */

    function recuperarSenha() {


        /* =================================================
           VALIDAR CAMPOS
           ================================================= */

        const nomeValido =
            validarNomeRecuperacao();

        const contactoValido =
            validarContactoRecuperacao();

        const metodoValido =
            validarMetodoRecuperacao();

        const codigoValido =
            validarCodigoRecuperacao();

        const senhaValida =
            validarNovaSenha();

        const confirmacaoValida =
            validarNovaConfirmacao();


        if (
            !nomeValido ||
            !contactoValido ||
            !metodoValido ||
            !codigoValido ||
            !senhaValida ||
            !confirmacaoValida
        ) {

            alert(
                "Por favor, corrija os campos destacados a vermelho."
            );

            return;
        }


        /* =================================================
           PROCURAR CONTA EXISTENTE
           ================================================= */

        const usuario =
            JSON.parse(
                localStorage.getItem(
                    "usuario"
                )
            );


        if (!usuario) {

            alert(
                "Não foi encontrada nenhuma conta registada neste dispositivo."
            );

            return;
        }


        /* =================================================
           VERIFICAR NOME
           ================================================= */

        const nomeInformado =
            nomeInput.value
                .trim()
                .toLowerCase();

        const nomeGuardado =
            (usuario.nome || "")
                .trim()
                .toLowerCase();


        if (
            nomeInformado !== nomeGuardado
        ) {

            campoInvalido(nomeInput);

            alert(
                "O nome informado não corresponde à conta registada."
            );

            nomeInput.focus();

            return;
        }


        /* =================================================
           VERIFICAR CONTACTO
           ================================================= */

        const contacto =
            contactoRecuperacao.value
                .trim();


        const telefoneGuardado =
            usuario.telefone || "";


        const emailGuardado =
            usuario.email || "";


        /*
           Método 1 = telefone
           Método 2 = Gmail
        */

        if (
            generoInput.value === "1"
        ) {

            const telefoneLimpo =
                contacto.replace(/\D/g, "");

            if (
                telefoneLimpo !==
                telefoneGuardado
            ) {

                campoInvalido(
                    contactoRecuperacao
                );

                alert(
                    "O número de telefone não corresponde à conta registada."
                );

                contactoRecuperacao.focus();

                return;
            }

        } else {

            /*
               Gmail só pode ser validado se o
               utilizador tiver um email guardado.
            */

            if (!emailGuardado) {

                campoInvalido(
                    contactoRecuperacao
                );

                alert(
                    "Esta conta não possui um G-mail registado. Utilize o número de telefone."
                );

                contactoRecuperacao.focus();

                return;
            }


            if (
                contacto.toLowerCase() !==
                emailGuardado.toLowerCase()
            ) {

                campoInvalido(
                    contactoRecuperacao
                );

                alert(
                    "O G-mail informado não corresponde à conta registada."
                );

                contactoRecuperacao.focus();

                return;
            }
        }


        /* =================================================
           VERIFICAR CÓDIGO
           ================================================= */

        const codigoGuardado =
            localStorage.getItem(
                "codigoRecuperacao"
            );


        if (!codigoGuardado) {

            alert(
                "Ainda não foi gerado um código de recuperação."
            );

            return;
        }


        if (
            codigoRecuperacao.value.trim() !==
            codigoGuardado
        ) {

            campoInvalido(
                codigoRecuperacao
            );

            alert(
                "O código de recuperação está incorreto."
            );

            codigoRecuperacao.focus();

            return;
        }


        /* =================================================
           VERIFICAR EXPIRAÇÃO DO CÓDIGO
           ================================================= */

        const dataCodigo =
            parseInt(
                localStorage.getItem(
                    "codigoRecuperacaoData"
                )
            );


        const dezMinutos =
            10 * 60 * 1000;


        if (
            dataCodigo &&
            Date.now() - dataCodigo >
            dezMinutos
        ) {

            localStorage.removeItem(
                "codigoRecuperacao"
            );

            localStorage.removeItem(
                "codigoRecuperacaoData"
            );

            campoInvalido(
                codigoRecuperacao
            );

            alert(
                "O código de recuperação expirou. Solicite um novo código."
            );

            return;
        }


        /* =================================================
           ALTERAR SENHA
           ================================================= */

        usuario.senha =
            senhaInput.value;


        usuario.dataAlteracaoSenha =
            new Date().toISOString();


        /* =================================================
           GUARDAR NOVAMENTE
           ================================================= */

        localStorage.setItem(
            "usuario",
            JSON.stringify(usuario)
        );


        /*
           Também actualiza os dados usados pelo perfil.
        */

        localStorage.setItem(
            "dadosBebe",
            JSON.stringify(usuario)
        );


        localStorage.setItem(
            "telefoneUsuario",
            usuario.telefone
        );


        localStorage.setItem(
            "nomeCrianca",
            usuario.nome
        );


        /* =================================================
           LIMPAR CÓDIGO USADO
           ================================================= */

        localStorage.removeItem(
            "codigoRecuperacao"
        );

        localStorage.removeItem(
            "codigoRecuperacaoData"
        );


        /* =================================================
           GARANTIR QUE NÃO FICA LOGADO
           ================================================= */

        localStorage.removeItem(
            "logado"
        );

        localStorage.removeItem(
            "usuarioLogado"
        );


        /* =================================================
           SUCESSO
           ================================================= */

        alert(
            "Senha recuperada com sucesso! Agora pode entrar na sua conta."
        );


        window.location.href =
            "index.html";
    }


    /* =====================================================
       DISPONIBILIZAR FUNÇÕES
       ===================================================== */

    window.recuperarSenha =
        recuperarSenha;


    window.gerarCodigoRecuperacao =
        gerarCodigoRecuperacao;
}


/* =========================================================
   FORMULÁRIO
   ========================================================= */

const formulario =
    document.querySelector("form");


if (formulario) {

    formulario.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            if (paginaRecuperacao) {

                recuperarSenha();

            } else {

                registrar();
            }
        }
    );
}
