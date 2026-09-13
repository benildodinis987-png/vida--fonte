function registrar() {
    const nomeInput = document.getElementById("nome");
    const dataNascimentoInput = document.getElementById("data-nascimento");
    const bairroInput = document.getElementById("bar");
    const generoInput = document.getElementById("gener");
    const telefoneInput = document.getElementById("telefone");
    const senhaInput = document.getElementById("senha");
    const confirmarSenhaInput = document.getElementById("confirmar-senha");

    const nome = nomeInput.value.trim();
    const dataNascimento = dataNascimentoInput.value;
    const bairro = bairroInput.value.trim();
    const genero = generoInput.value;
    const telefone = telefoneInput.value.trim();
    const senha = senhaInput.value;
    const confirmarSenha = confirmarSenhaInput.value;

    // ==============================
    // VERIFICAR CAMPOS VAZIOS
    // ==============================

    if (
        !nome ||
        !dataNascimento ||
        !bairro ||
        !genero ||
        !telefone ||
        !senha ||
        !confirmarSenha
    ) {
        alert("Preencha todos os campos!");
        return;
    }

    // ==============================
    // VALIDAR NOME
    // ==============================

    // Apenas letras, espaços e acentos
    const nomeRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;

    if (!nomeRegex.test(nome)) {
        alert("O nome deve conter apenas letras e espaços. Números e símbolos não são permitidos.");
        nomeInput.focus();
        return;
    }

    // Nome deve ter pelo menos duas palavras
    const partesNome = nome.split(/\s+/);

    if (partesNome.length < 2) {
        alert("Digite o nome completo da criança.");
        nomeInput.focus();
        return;
    }

    // ==============================
    // VALIDAR DATA DE NASCIMENTO
    // ==============================

    const dataNascimentoObj = new Date(dataNascimento + "T00:00:00");
    const hoje = new Date();

    hoje.setHours(0, 0, 0, 0);

    if (dataNascimentoObj > hoje) {
        alert("A data de nascimento não pode ser uma data futura.");
        dataNascimentoInput.focus();
        return;
    }

    // ==============================
    // VALIDAR BAIRRO
    // ==============================

    // Permite letras, números, espaços e alguns sinais comuns
    const bairroRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ0-9\s.,'-]+$/;

    if (!bairroRegex.test(bairro)) {
        alert("Digite uma localização válida.");
        bairroInput.focus();
        return;
    }

    // ==============================
    // VALIDAR GÉNERO
    // ==============================

    if (!["1", "2", "3"].includes(genero)) {
        alert("Escolha um género válido.");
        generoInput.focus();
        return;
    }

    // ==============================
    // VALIDAR TELEFONE
    // ==============================

    // Só permite números
    const telefoneRegex = /^[0-9]+$/;

    if (!telefoneRegex.test(telefone)) {
        alert("O número de telefone deve conter apenas números.");
        telefoneInput.focus();
        return;
    }

    // Número moçambicano com 9 dígitos
    if (telefone.length !== 9) {
        alert("O número de telefone deve ter 9 dígitos.");
        telefoneInput.focus();
        return;
    }

    // Prefixos comuns de telemóveis em Moçambique
    const prefixosValidos = [
        "82", "83", "84", "85", "86", "87"
    ];

    const prefixo = telefone.substring(0, 2);

    if (!prefixosValidos.includes(prefixo)) {
        alert("Digite um número de telefone moçambicano válido.");
        telefoneInput.focus();
        return;
    }

    // ==============================
    // VALIDAR SENHA
    // ==============================

    if (senha.length < 6) {
        alert("A senha deve ter pelo menos 6 caracteres.");
        senhaInput.focus();
        return;
    }

    // ==============================
    // CONFIRMAR SENHA
    // ==============================

    if (senha !== confirmarSenha) {
        alert("As senhas não são iguais!");
        confirmarSenhaInput.focus();
        return;
    }

    // ==============================
    // CRIAR UTILIZADOR
    // ==============================

    const usuario = {
        nome: nome,
        dataNascimento: dataNascimento,
        bairro: bairro,
        genero: genero,
        telefone: telefone,
        senha: senha
    };

    // ==============================
    // GUARDAR NO LOCALSTORAGE
    // ==============================

    localStorage.setItem("usuario", JSON.stringify(usuario));

    // Confirmar no console
    console.log("Utilizador guardado:", usuario);

    // ==============================
    // CONFIRMAÇÃO
    // ==============================

    alert("Cadastro realizado com sucesso!");

    // ==============================
    // IR PARA LOGIN
    // ==============================

    window.location.href = "index.html";
}
