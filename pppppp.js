document.getElementById("btn-login").addEventListener("click", function () {

    const nomeDigitado = document.getElementById("codigo-estudante").value.trim();
    const senhaDigitada = document.getElementById("senha").value;

    // Buscar os dados do LocalStorage
    const dadosGuardados = localStorage.getItem("usuario");

    if (!dadosGuardados) {
        document.getElementById("mensagem").innerText =
            "Nenhum cadastro encontrado. Faça o cadastro primeiro.";
        return;
    }

    const usuario = JSON.parse(dadosGuardados);

    // Comparar os dados
    const nomeCorreto =
        nomeDigitado.toLowerCase() === usuario.nome.trim().toLowerCase();

    const senhaCorreta =
        senhaDigitada === usuario.senha;

    if (nomeCorreto && senhaCorreta) {

        // Guardar sessão
        localStorage.setItem("logado", "true");

        document.getElementById("mensagem").style.color = "green";
        document.getElementById("mensagem").innerText =
            "Login realizado com sucesso!";

        // Ir para o perfil
        setTimeout(function () {
            window.location.href = "paginal.html";
        }, 500);

    } else {

        document.getElementById("mensagem").style.color = "red";

        if (!nomeCorreto) {
            document.getElementById("mensagem").innerText =
                "O nome da criança está incorrecto.";
        } else {
            document.getElementById("mensagem").innerText =
                "A senha está incorrecta.";
        }
    }
});