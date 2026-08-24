let medicoes = [];

const ctx = document.getElementById('grafico').getContext('2d');

const grafico = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Peso (kg)',
            data: [],
            borderColor: '#2ea44f',
            fill: false
        }]
    }
});

function registrarMedicao() {

    const data = document.getElementById("data").value;
    const peso = parseFloat(document.getElementById("peso").value);
    const altura = parseFloat(document.getElementById("altura").value);
    const braco = parseFloat(document.getElementById("braco").value);

    if (!data || !peso || !altura || !braco) {
        alert("Preencha todos os campos!");
        return;
    }

    const medicao = { data, peso, altura, braco };
    medicoes.push(medicao);

    atualizarGrafico();
    atualizarHistorico();
    calcularStatus(peso, altura);
    gerarDicas(peso, altura);

    limparCampos();
}

function atualizarGrafico() {
    grafico.data.labels = medicoes.map(m => m.data);
    grafico.data.datasets[0].data = medicoes.map(m => m.peso);
    grafico.update();
}

function atualizarHistorico() {
    const lista = document.getElementById("historico");
    lista.innerHTML = "";

    medicoes.forEach(m => {
        const item = document.createElement("li");
        item.textContent = `${m.data} - ${m.peso}kg - ${m.altura}cm - ${m.braco}cm`;
        lista.appendChild(item);
    });
}

function calcularStatus(peso, altura) {

    const imc = peso / ((altura / 100) ** 2);
    const status = document.getElementById("status");

    if (imc < 14) {
        status.innerHTML = "⚠️ Abaixo do peso ideal";
    } else if (imc >= 14 && imc <= 18) {
        status.innerHTML = "✅ Peso ideal";
    } else {
        status.innerHTML = "⚠️ Acima do peso recomendado";
    }
}

function gerarDicas(peso, altura) {

    const dicas = document.getElementById("dicas");
    const imc = peso / ((altura / 100) ** 2);

    if (imc < 14) {
        dicas.innerHTML = "Inclua mais proteínas e calorias saudáveis.";
    } else if (imc <= 18) {
        dicas.innerHTML = "Continue com alimentação equilibrada e hidratação.";
    } else {
        dicas.innerHTML = "Reduza alimentos processados e incentive atividade física.";
    }
}

function limparCampos() {
    document.getElementById("data").value = "";
    document.getElementById("peso").value = "";
    document.getElementById("altura").value = "";
    document.getElementById("braco").value = "";
}

async function baixarPDF() {

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text("Relatório de Crescimento DO BEBE - VIDAFONTE", 20, 20);

    let y = 40;

    medicoes.forEach(m => {
        doc.text(`${m.data} - Peso: ${m.peso}kg | Altura: ${m.altura}cm | Braço: ${m.braco}cm`, 20, y);
        y += 10;
    });

    

    doc.save("relatorio_vidafonte.pdf");
}