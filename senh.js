let metodoPagamentoSelecionado = null;

const precosHospitais = {
    "Centro de saude de Ingonane": 1,
    "centro de saude de Cariaco": 1,
    "Centro de Saúde de Natite": 1,
    "Centro de Saúde de Mahate": 1,
    "Centro de Saúde de Maringanha": 1,
    "Centro de Saúde de Muxara": 1,
    "Chuiba Centro de Saúde Urbano C": 1,
    "Hospital Provincial de Cabo Delgado": 100
};

document.getElementById("hospital").addEventListener("change", function() {
    const preco = precosHospitais[this.value] || 0;
    document.getElementById("preco").innerText = preco;
});

function selecionarPagamento(metodo) {
    metodoPagamentoSelecionado = metodo;
    alert("Selecionado: " + metodo);
}

function getContadorHospital(hospital) {
    let dados = JSON.parse(localStorage.getItem("senhas")) || {};
    if (!dados[hospital]) dados[hospital] = [];
    return dados;
}

function gerarHoraConsulta(posicao) {
    const inicio = 7;
    const minutos = 20;

    let total = (posicao - 1) * minutos;
    let horas = inicio + Math.floor(total / 60);
    let mins = total % 60;

    if (horas >= 15) return "Esgotado";

    return String(horas).padStart(2, "0") + ":" + String(mins).padStart(2, "0");
}

function confirmarPagamento() {

    const hospital = document.getElementById("hospital").value;
    const data = document.getElementById("dataConsulta").value;
    const especialidade = document.getElementById("especialidade").value;
    const preco = document.getElementById("preco").innerText;

    if (!hospital || !data || !metodoPagamentoSelecionado) {
        alert("Preencha todos os campos");
        return;
    }

    let dados = getContadorHospital(hospital);

    const posicao = dados[hospital].length + 1;
    const hora = gerarHoraConsulta(posicao);

    const id = "H" + hospital + "-" + String(posicao).padStart(4, "0");

    const senha = {
        id,
        hospital,
        especialidade,
        data,
        hora,
        preco,
        pagamento: metodoPagamentoSelecionado
    };

    dados[hospital].push(senha);
    localStorage.setItem("senhas", JSON.stringify(dados));

    mostrarCartao(senha);
}

function mostrarCartao(s) {

    document.getElementById("cartaoSenha").innerHTML = `
<div style="background:white;padding:20px;border-radius:10px;box-shadow:0 0 10px rgba(0,0,0,0.2)">
<h3>Senha Gerada</h3>
<p><b>ID:</b> ${s.id}</p>
<p><b>Hospital:</b> ${s.hospital}</p>
<p><b>Especialidade:</b> ${s.especialidade}</p>
<p><b>Data:</b> ${s.data}</p>
<p><b>Hora:</b> ${s.hora}</p>
<p><b>Pagamento:</b> ${s.pagamento}</p>
<button onclick="window.print()">Imprimir</button>
</div>
`;
}