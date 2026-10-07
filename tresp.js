/* =========================================================
   VIDA FONTE
   tresp.js
   REGISTO + RECUPERAÇÃO DE SENHA
   VERSÃO ACTUALIZADA
   ========================================================= */


/* =========================================================
   DETECTAR PÁGINA
   ========================================================= */

const selectMetodo = document.getElementById("gener");

/*
   REGISTO:
   1 = Homem
   2 = Mulher
   3 = Outro

   RECUPERAÇÃO:
   1 = Telefone
   2 = G-mail
*/

const paginaRecuperacao =
    selectMetodo &&
    selectMetodo.querySelector('option[value="3"]') === null;


/* =========================================================
   ELEMENTOS COMUNS
   ========================================================= */

const nomeInput =
    document.getElementById("nome");

const telefoneInput =
    document.getElementById("telefone");

const senhaInput =
    document.getElementById("senha");

const confirmarSenhaInput =
    document.getElementById("confirmar-senha");


/* =========================================================
   ESTADO VISUAL DOS CAMPOS
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
   NORMALIZAÇÃO
   ========================================================= */

function normalizarTexto(texto) {

    return String(texto || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ");
}


function normalizarNome(nome) {

    return normalizarTexto(nome);
}


function obterUsuarios() {

    let usuarios = [];

    try {

        usuarios =
            JSON.parse(
                localStorage.getItem("usuarios") || "[]"
            );

    } catch (erro) {

        usuarios = [];
    }


    if (!Array.isArray(usuarios)) {

        usuarios = [];
    }


    /*
       MIGRAÇÃO DO SISTEMA ANTIGO

       Se já existia um único utilizador guardado
       em "usuario", ele passa automaticamente
       para a nova lista "usuarios".
    */

    let usuarioAntigo = null;

    try {

        usuarioAntigo =
            JSON.parse(
                localStorage.getItem("usuario") || "null"
            );

    } catch (erro) {

        usuarioAntigo = null;
    }


    if (
        usuarioAntigo &&
        typeof usuarioAntigo === "object"
    ) {

        const existe = usuarios.some(function (u) {

            return (
                String(u.telefone || "") ===
                String(usuarioAntigo.telefone || "") &&

                String(u.dataNascimento || "") ===
                String(usuarioAntigo.dataNascimento || "")
            );

        });


        if (!existe) {

            usuarios.push(usuarioAntigo);

            localStorage.setItem(
                "usuarios",
                JSON.stringify(usuarios)
            );
        }
    }


    return usuarios;
}


function guardarUsuarios(usuarios) {

    localStorage.setItem(
        "usuarios",
        JSON.stringify(usuarios)
    );
}


/* =========================================================
   ID ÚNICO DO UTILIZADOR
   ========================================================= */

function gerarIdUtilizador() {

    return (
        Date.now().toString(36) +
        "-" +
        Math.random().toString(36).substring(2, 10)
    );
}


/* =========================================================
   IDADE
   ========================================================= */

function calcularIdade(dataNascimento) {

    if (!dataNascimento) return -1;

    const nascimento =
        new Date(dataNascimento + "T00:00:00");

    if (isNaN(nascimento.getTime())) {

        return -1;
    }


    const hoje = new Date();

    let idade =
        hoje.getFullYear() -
        nascimento.getFullYear();


    const mes =
        hoje.getMonth() -
        nascimento.getMonth();


    if (
        mes < 0 ||
        (
            mes === 0 &&
            hoje.getDate() < nascimento.getDate()
        )
    ) {

        idade--;
    }


    return idade;
}


/* =========================================================
   ASSINATURA DO UTILIZADOR
   ========================================================= */

function criarAssinatura(usuario) {

    return [

        normalizarNome(usuario.nome),

        String(usuario.dataNascimento || ""),

        normalizarTexto(usuario.bairro),

        String(usuario.genero || ""),

        String(usuario.telefone || "")

    ].join("|");
}


/* =========================================================
   VERIFICAR UTILIZADOR DUPLICADO
   ========================================================= */

function verificarDuplicado(usuario, usuarios) {

    const telefone =
        String(usuario.telefone || "").trim();


    const nome =
        normalizarNome(usuario.nome);


    const dataNascimento =
        String(usuario.dataNascimento || "");


    const assinaturaNova =
        criarAssinatura(usuario);


    for (const existente of usuarios) {

        /*
           1. TELEFONE
           O telefone é único.
        */

        if (
            telefone &&
            String(existente.telefone || "").trim() ===
            telefone
        ) {

            return {
                duplicado: true,
                campo: "telefone",
                mensagem:
                    "Este número de telefone já está registado na plataforma VidaFonte."
            };
        }


        /*
           2. NOME + DATA DE NASCIMENTO
        */

        if (
            nome ===
            normalizarNome(existente.nome) &&

            dataNascimento ===
            String(existente.dataNascimento || "")
        ) {

            return {
                duplicado: true,
                campo: "nome",
                mensagem:
                    "Já existe uma criança registada com este nome e esta data de nascimento."
            };
        }


        /*
           3. TODOS OS DADOS PRINCIPAIS IGUAIS
        */

        if (
            assinaturaNova ===
            criarAssinatura(existente)
        ) {

            return {
                duplicado: true,
                campo: "geral",
                mensagem:
                    "Estes dados já estão registados numa conta VidaFonte."
            };
        }
    }


    return {
        duplicado: false
    };
}


/* =========================================================
   ==================== REGISTO =============================
   ========================================================= */

if (!paginaRecuperacao) {


    /* =====================================================
       ELEMENTOS
       ===================================================== */

    const dataNascimentoInput =
        document.getElementById("data-nascimento");


    const bairroInput =
        document.getElementById("bar");


    const generoInput =
        document.getElementById("gener");


    /* =====================================================
       VALIDAR NOME
       ===================================================== */

    function validarNome() {

        if (!nomeInput) return false;

        const nome =
            nomeInput.value.trim();


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

            campoInvalido(
                dataNascimentoInput
            );

            return false;
        }


        const dataSelecionada =
            new Date(data + "T00:00:00");


        if (isNaN(dataSelecionada.getTime())) {

            campoInvalido(
                dataNascimentoInput
            );

            return false;
        }


        const hoje =
            new Date();


        hoje.setHours(
            0,
            0,
            0,
            0
        );


        /*
           NÃO PERMITIR DATA FUTURA
        */

        if (
            dataSelecionada >
            hoje
        ) {

            campoInvalido(
                dataNascimentoInput
            );

            return false;
        }


        /*
           CALCULAR IDADE
        */

        const idade =
            calcularIdade(data);


        /*
           REGRA VIDA FONTE:
           SOMENTE CRIANÇAS COM MENOS DE 10 ANOS
        */

        if (
            idade < 0 ||
            idade >= 10
        ) {

            campoInvalido(
                dataNascimentoInput
            );

            return false;
        }


        campoValido(
            dataNascimentoInput
        );

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

            campoInvalido(
                bairroInput
            );

            return false;
        }


        campoValido(
            bairroInput
        );

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


        if (
            !regexTelefone.test(telefone)
        ) {

            campoInvalido(
                telefoneInput
            );

            return false;
        }


        campoValido(
            telefoneInput
        );

        return true;
    }


    /* =====================================================
       VALIDAR SENHA
       ===================================================== */

    function validarSenha() {

        if (!senhaInput) return false;


        const senha =
            senhaInput.value;


        if (
            senha.length < 6
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

    function validarConfirmarSenha() {

        if (!confirmarSenhaInput) return false;


        const senha =
            senhaInput ?
            senhaInput.value :
            "";


        const confirmarSenha =
            confirmarSenhaInput.value;


        if (
            confirmarSenha.length < 6 ||
            confirmarSenha !== senha
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
                    this.value
                        .replace(/\D/g, "")
                        .substring(0, 9);


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

        /*
           VALIDAR TODOS OS CAMPOS
        */

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


        /*
           SE EXISTIR ERRO
        */

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

            return false;
        }


        /*
           VERIFICAR NOVAMENTE A IDADE
        */

        const idade =
            calcularIdade(
                dataNascimentoInput.value
            );


        if (
            idade < 0 ||
            idade >= 10
        ) {

            campoInvalido(
                dataNascimentoInput
            );

            alert(
                "A VidaFonte destina-se a crianças com menos de 10 anos. O cadastro não pode ser concluído."
            );

            dataNascimentoInput.focus();

            return false;
        }


        /* =================================================
           CRIAR UTILIZADOR
           ================================================= */

        const usuario = {

            id:
                gerarIdUtilizador(),

            nome:
                nomeInput.value.trim(),

            dataNascimento:
                dataNascimentoInput.value,

            idade:
                idade,

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
           OBTER TODOS OS UTILIZADORES
           ================================================= */

        const usuarios =
            obterUsuarios();


        /* =================================================
           VERIFICAR DUPLICADOS
           ================================================= */

        const verificacao =
            verificarDuplicado(
                usuario,
                usuarios
            );


        if (
            verificacao.duplicado
        ) {

            if (
                verificacao.campo ===
                "telefone"
            ) {

                campoInvalido(
                    telefoneInput
                );

                telefoneInput.focus();

            } else if (
                verificacao.campo ===
                "nome"
            ) {

                campoInvalido(
                    nomeInput
                );

                campoInvalido(
                    dataNascimentoInput
                );

                nomeInput.focus();

            } else {

                campoInvalido(
                    nomeInput
                );

                campoInvalido(
                    dataNascimentoInput
                );
            }


            alert(
                verificacao.mensagem
            );

            return false;
        }


        /* =================================================
           ADICIONAR NOVO UTILIZADOR
           ================================================= */

        usuarios.push(
            usuario
        );


        /* =================================================
           GUARDAR LISTA COMPLETA
           ================================================= */

        guardarUsuarios(
            usuarios
        );


        /*
           "usuario" continua a ser utilizado
           para o perfil da conta seleccionada.
        */

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


        /*
           NÃO ENTRAR AUTOMATICAMENTE
        */

        localStorage.removeItem(
            "logado"
        );


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

            popup.classList.add(
                "mostrar"
            );

        } else {

            alert(
                "Parabéns! A conta de " +
                usuario.nome +
                " foi criada com sucesso na plataforma VidaFonte."
            );

            window.location.href =
                "index.html";
        }


        return false;
    }


    window.registrar =
        registrar;


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

if (paginaRecuperacao) {


    /* =====================================================
       CAMPOS
       ===================================================== */

    const contactoRecuperacao =
        document.getElementById(
            "data-nascimento"
        );


    const codigoRecuperacao =
        document.getElementById(
            "bar"
        );


    const generoRecuperacao =
        document.getElementById(
            "gener"
        );


    /* =====================================================
       VALIDAR NOME
       ===================================================== */

    function validarNomeRecuperacao() {

        if (!nomeInput) return false;


        const nome =
            nomeInput.value.trim();


        if (
            nome.length < 2
        ) {

            campoInvalido(
                nomeInput
            );

            return false;
        }


        campoValido(
            nomeInput
        );

        return true;
    }


    /* =====================================================
       VALIDAR CONTACTO
       ===================================================== */

    function validarContactoRecuperacao() {

        if (
            !contactoRecuperacao
        ) {

            return false;
        }


        const contacto =
            contactoRecuperacao.value.trim();


        if (
            contacto.length < 5
        ) {

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

        if (
            !generoRecuperacao
        ) {

            return false;
        }


        const metodo =
            generoRecuperacao.value;


        if (
            !["1", "2"].includes(metodo)
        ) {

            campoInvalido(
                generoRecuperacao
            );

            return false;
        }


        campoValido(
            generoRecuperacao
        );

        return true;
    }


    /* =====================================================
       VALIDAR CÓDIGO
       ===================================================== */

    function validarCodigoRecuperacao() {

        if (
            !codigoRecuperacao
        ) {

            return false;
        }


        codigoRecuperacao.value =
            codigoRecuperacao.value
                .replace(/\D/g, "")
                .substring(0, 6);


        const codigo =
            codigoRecuperacao.value.trim();


        if (
            codigo.length !== 6
        ) {

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

        if (!senhaInput) return false;


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

        if (
            !confirmarSenhaInput
        ) {

            return false;
        }


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


    if (generoRecuperacao) {

        generoRecuperacao.addEventListener(
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
       LOCALIZAR CONTA PARA RECUPERAÇÃO
       ===================================================== */

    function localizarContaRecuperacao() {

        const nome =
            normalizarNome(
                nomeInput ?
                nomeInput.value :
                ""
            );


        const contacto =
            contactoRecuperacao ?
            contactoRecuperacao.value.trim() :
            "";


        const metodo =
            generoRecuperacao ?
            generoRecuperacao.value :
            "";


        if (!nome || !contacto || !metodo) {

            return null;
        }


        const usuarios =
            obterUsuarios();


        for (
            const usuario of usuarios
        ) {

            if (
                normalizarNome(
                    usuario.nome
                ) !== nome
            ) {

                continue;
            }


            /*
               TELEFONE
            */

            if (
                metodo === "1"
            ) {

                const telefoneInformado =
                    contacto.replace(
                        /\D/g,
                        ""
                    );


                const telefoneGuardado =
                    String(
                        usuario.telefone || ""
                    ).replace(
                        /\D/g,
                        ""
                    );


                if (
                    telefoneInformado ===
                    telefoneGuardado
                ) {

                    return usuario;
                }
            }


            /*
               G-MAIL
            */

            if (
                metodo === "2"
            ) {

                const emailGuardado =
                    String(
                        usuario.email || ""
                    )
                    .trim()
                    .toLowerCase();


                if (
                    emailGuardado &&
                    contacto.toLowerCase() ===
                    emailGuardado
                ) {

                    return usuario;
                }
            }
        }


        return null;
    }


    /* =====================================================
       GERAR CÓDIGO
       ===================================================== */

    function gerarCodigoRecuperacao() {

        /*
           Primeiro validar os dados
           necessários para localizar a conta.
        */

        const nomeValido =
            validarNomeRecuperacao();


        const contactoValido =
            validarContactoRecuperacao();


        const metodoValido =
            validarMetodoRecuperacao();


        if (
            !nomeValido ||
            !contactoValido ||
            !metodoValido
        ) {

            alert(
                "Preencha correctamente o nome, o contacto e o método de recuperação."
            );

            return false;
        }


        const usuario =
            localizarContaRecuperacao();


        if (!usuario) {

            campoInvalido(
                nomeInput
            );


            campoInvalido(
                contactoRecuperacao
            );


            alert(
                "Não foi encontrada nenhuma conta com os dados informados."
            );

            return false;
        }


        /*
           GERAR CÓDIGO DE 6 DÍGITOS
        */

        const codigo =
            Math.floor(
                100000 +
                Math.random() * 900000
            ).toString();


        /*
           Guardar código
        */

        localStorage.setItem(
            "codigoRecuperacao",
            codigo
        );


        localStorage.setItem(
            "codigoRecuperacaoData",
            Date.now().toString()
        );


        /*
           Guardar ID da conta a recuperar.
        */

        localStorage.setItem(
            "codigoRecuperacaoUsuarioId",
            usuario.id || ""
        );


        /*
           MODO DE TESTE

           Em produção, este código deverá ser
           enviado através de um servidor/SMS/Gmail.
        */

        alert(
            "Código de recuperação para teste: " +
            codigo
        );


        if (codigoRecuperacao) {

            codigoRecuperacao.focus();
        }


        return true;
    }


    /* =====================================================
       CRIAR BOTÃO "ENVIAR CÓDIGO"
       ===================================================== */

    function criarBotaoEnviarCodigo() {

        if (
            document.getElementById(
                "btnEnviarCodigo"
            )
        ) {

            return;
        }


        if (!codigoRecuperacao) {

            return;
        }


        const botao =
            document.createElement(
                "button"
            );


        botao.type =
            "button";


        botao.id =
            "btnEnviarCodigo";


        botao.className =
            "btn-enviar-codigo";


        botao.textContent =
            "Enviar código";


        botao.addEventListener(
            "click",
            gerarCodigoRecuperacao
        );


        codigoRecuperacao.parentNode.insertBefore(
            botao,
            codigoRecuperacao
        );
    }


    criarBotaoEnviarCodigo();


    /* =====================================================
       RECUPERAR SENHA
       ===================================================== */

    function recuperarSenha() {

        /*
           VALIDAR CAMPOS
        */

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

            return false;
        }


        /* =================================================
           OBTER CÓDIGO
           ================================================= */

        const codigoGuardado =
            localStorage.getItem(
                "codigoRecuperacao"
            );


        if (!codigoGuardado) {

            campoInvalido(
                codigoRecuperacao
            );


            alert(
                "Primeiro clique em 'Enviar código' para receber o código de recuperação."
            );

            return false;
        }


        /* =================================================
           VERIFICAR CÓDIGO
           ================================================= */

        if (
            codigoRecuperacao.value.trim() !==
            codigoGuardado
        ) {

            campoInvalido(
                codigoRecuperacao
            );


            alert(
                "O código de recuperação está incorrecto."
            );


            codigoRecuperacao.focus();

            return false;
        }


        /* =================================================
           VERIFICAR EXPIRAÇÃO
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
            !dataCodigo ||
            Date.now() - dataCodigo >
            dezMinutos
        ) {

            localStorage.removeItem(
                "codigoRecuperacao"
            );


            localStorage.removeItem(
                "codigoRecuperacaoData"
            );


            localStorage.removeItem(
                "codigoRecuperacaoUsuarioId"
            );


            campoInvalido(
                codigoRecuperacao
            );


            alert(
                "O código de recuperação expirou. Solicite um novo código."
            );


            return false;
        }


        /* =================================================
           LOCALIZAR UTILIZADOR
           ================================================= */

        const usuario =
            localizarContaRecuperacao();


        if (!usuario) {

            alert(
                "Os dados informados não correspondem a uma conta VidaFonte."
            );

            return false;
        }


        /* =================================================
           VERIFICAR UTILIZADOR DO CÓDIGO
           ================================================= */

        const usuarioIdCodigo =
            localStorage.getItem(
                "codigoRecuperacaoUsuarioId"
            );


        if (
            usuarioIdCodigo &&
            usuario.id &&
            usuarioIdCodigo !== usuario.id
        ) {

            alert(
                "O código de recuperação não corresponde a esta conta."
            );

            return false;
        }


        /* =================================================
           ALTERAR SENHA
           ================================================= */

        usuario.senha =
            senhaInput.value;


        usuario.dataAlteracaoSenha =
            new Date().toISOString();


        /* =================================================
           ACTUALIZAR LISTA
           ================================================= */

        const usuarios =
            obterUsuarios();


        const indice =
            usuarios.findIndex(
                function (u) {

                    return (
                        u.id === usuario.id
                    );

                }
            );


        if (
            indice === -1
        ) {

            alert(
                "Não foi possível actualizar a conta."
            );

            return false;
        }


        usuarios[indice] =
            usuario;


        guardarUsuarios(
            usuarios
        );


        /* =================================================
           ACTUALIZAR UTILIZADOR ACTUAL
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
           LIMPAR CÓDIGO
           ================================================= */

        localStorage.removeItem(
            "codigoRecuperacao"
        );


        localStorage.removeItem(
            "codigoRecuperacaoData"
        );


        localStorage.removeItem(
            "codigoRecuperacaoUsuarioId"
        );


        /* =================================================
           NÃO ENTRAR AUTOMATICAMENTE
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


        return false;
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


/* =========================================================
   EVITAR PROBLEMA COM BOTÕES DENTRO DE <a>
   ========================================================= */

document.addEventListener(
    "click",
    function (event) {

        const botao =
            event.target.closest(
                "button"
            );


        if (!botao) return;


        /*
           Na recuperação, o botão principal
           deve chamar recuperarSenha().
        */

        if (
            paginaRecuperacao &&
            (
                botao.id !==
                "btnEnviarCodigo"
            )
        ) {

            const texto =
                (
                    botao.textContent ||
                    ""
                )
                .trim()
                .toLowerCase();


            if (
                texto.includes("recuperar") ||
                texto.includes("alterar") ||
                texto.includes("senha")
            ) {

                event.preventDefault();

                recuperarSenha();
            }
        }
    }
);
