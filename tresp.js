function registrar() {
    const nome = document.getElementById("nome").value.trim();
    const dataNascimento = document.getElementById("data-nascimento").value;
    const bairro = document.getElementById("bar").value.trim();
    const genero = document.getElementById("gener").value;
    const telefone = document.getElementById("telefone").value.trim();
    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmar-senha").value;

    if (!nome || !dataNascimento || !bairro || !genero || !telefone || !senha || !confirmarSenha) {
        alert("Preencha todos os campos!");
        return;
    }

    if (senha !== confirmarSenha) {
        alert("As senhas não são iguais!");
        return;
    }

    // Guardar os dados exactamente como foram preenchidos
    const usuario = {
        nome: nome,
        dataNascimento: dataNascimento,
        bairro: bairro,
        genero: genero,
        telefone: telefone,
        senha: senha
    };

    localStorage.setItem("usuario", JSON.stringify(usuario));

    // CONFIRMAÇÃO: verificar se foi guardado
    console.log("Utilizador guardado:", usuario);

    alert("Cadastro realizado com sucesso!");

    // Redireccionar depois de guardar
    window.location.href = "Login%202.js.html";
}