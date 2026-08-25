document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // 1. VERIFICAR AUTENTICAÇÃO E LER DADOS
    // ==========================================
    if (localStorage.getItem("logado") !== "true") {
        window.location.href = "index.html";
        return; // CORRIGIDO: de 'retorno;' para 'return;'
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
        return; // CORRIGIDO: de 'retorno;' para 'return;'
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
    // 4. CADERNETA DE VACINAS INTERATIVA
    // ==========================================
    function atualizarCadernetaVacinas(dataNasc) {
        const idadeMeses = calcularIdadeMeses(dataNasc);

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

                const elStatus = elStatusOld.cloneNode(true);
                elStatusOld.parentNode.replaceChild(elStatus, elStatusOld);

                elStatus.style.cursor = "pointer";
                elStatus.title = "Clique para marcar como concluída (✔) ou remover";

                const atualizarVisual = () => {
                    if (usuario.vacinasConcluidas[item.id]) {
                        elStatus.className = "ok";
                        elStatus.textContent = "✔";
                        elStatus.style.backgroundColor = ""; 
                        elStatus.style.color = "";
                    } else {
                        if (idadeMeses >= item.mes) {
                            elStatus.className = "alert";
                            elStatus.textContent = "!";
                            elStatus.style.backgroundColor = "";
                            elStatus.style.color = "";
                        } else {
                            elStatus.className = "alert";
                            elStatus.textContent = "⏳";
                            elStatus.style.backgroundColor = "#e2e8f0";
                            elStatus.style.color = "#64748b";
                        }
                    }
                };

                atualizarVisual();

                elStatus.addEventListener("click", () => {
                    usuario.vacinasConcluidas[item.id] = !usuario.vacinasConcluidas[item.id];
                    localStorage.setItem("usuario", JSON.stringify(usuario));
                    localStorage.setItem("dadosBebe", JSON.stringify(usuario));
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
});
