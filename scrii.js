// Função para Aumentar/Diminuir Fonte
function alterarFonte(acao) {
    let htmlTag = document.documentElement;
    let estiloAtual = window.getComputedStyle(htmlTag).getPropertyValue('font-size');
    let tamanhoAtual = parseFloat(estiloAtual);
    let novoTamanho = 16;

    if (acao === 'aumentar' && tamanhoAtual < 24) {
        novoTamanho = tamanhoAtual + 2;
    } else if (acao === 'diminuir' && tamanhoAtual > 12) {
        novoTamanho = tamanhoAtual - 2;
    } else if (acao === 'normal') {
        novoTamanho = 16;
    } else {
        return; // Não faz nada se já estiver nos limites
    }

    htmlTag.style.fontSize = novoTamanho + 'px';
    localStorage.setItem('acessibilidade-fonte', novoTamanho + 'px');
}

// Função para Alto Contraste
function toggleContraste() {
    let ativo = document.body.classList.toggle('alto-contraste');
    localStorage.setItem('acessibilidade-contraste', ativo ? 'sim' : 'nao');
}

// Função para Fonte Adaptada a Dislexia
function toggleFonteDislexia() {
    let ativo = document.body.classList.toggle('fonte-dislexia');
    localStorage.setItem('acessibilidade-dislexia', ativo ? 'sim' : 'nao');
}

// Executar ao carregar a página de acessibilidade para garantir que os botões refletem o estado atual
document.addEventListener("DOMContentLoaded", aplicarPreferencias);