const btnDesnutricao = document.getElementById('btnDesnutricao');
const btnHospital = document.getElementById('btnHospital');
const formDesnutricao = document.getElementById('formDesnutricao');
const formHospital = document.getElementById('formHospital');

btnDesnutricao.addEventListener('click', () => {
    formDesnutricao.style.display = 'block';
    formHospital.style.display = 'none';
    btnDesnutricao.classList.add('active');
    btnHospital.classList.remove('active');
});

btnHospital.addEventListener('click', () => {
    formDesnutricao.style.display = 'none';
    formHospital.style.display = 'block';
    btnHospital.classList.add('active');
    btnDesnutricao.classList.remove('active');
});

// Funções de envio para Local Storage
formDesnutricao.addEventListener('submit', function(e) {
    e.preventDefault();
    const denuncia = {
        tipo: 'Desnutrição Infantil',
        nomeCrianca: document.getElementById('nomeCrianca').value,
        idadeCrianca: document.getElementById('idadeCrianca').value,
        localidade: document.getElementById('localidade').value,
        descricao: document.getElementById('descricao').value,
        data: new Date().toLocaleString()
    };
    let denuncias = JSON.parse(localStorage.getItem('denuncias')) || [];
    denuncias.push(denuncia);
    localStorage.setItem('denuncias', JSON.stringify(denuncias));
    formDesnutricao.reset();
    document.getElementById('msgDesnutricao').textContent = "Denúncia enviada com sucesso!";
});

formHospital.addEventListener('submit', function(e) {
    e.preventDefault();
    const denuncia = {
        tipo: 'Mau Atendimento',
        hospital: document.getElementById('hospital').value,
        problemaHospital: document.getElementById('problemaHospital').value,
        nomeDenunciante: document.getElementById('nomeDenunciante').value,
        contato: document.getElementById('contato').value,
        data: new Date().toLocaleString()
    };
    let denuncias = JSON.parse(localStorage.getItem('denuncias')) || [];
    denuncias.push(denuncia);
    localStorage.setItem('denuncias', JSON.stringify(denuncias));
    formHospital.reset();
    document.getElementById('msgHospital').textContent = "Denúncia enviada com sucesso!";
});