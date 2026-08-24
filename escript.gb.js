function aplicarPreferencias() {
    // 1. Aplicar tamanho da fonte
    let fonteSalva = localStorage.getItem('acessibilidade-fonte');
    if (fonteSalva) {
        document.documentElement.style.fontSize = fonteSalva;
    }

    // 2. Aplicar Alto Contraste
    let contrasteSalvo = localStorage.getItem('acessibilidade-contraste');
    if (contrasteSalvo === 'sim') {
        document.body.classList.add('alto-contraste');
    } else if (contrasteSalvo === 'nao') {
        document.body.classList.remove('alto-contraste');
    }

    // 3. Aplicar Fonte para Dislexia
    let dislexiaSalva = localStorage.getItem('acessibilidade-dislexia');
    if (dislexiaSalva === 'sim') {
        document.body.classList.add('fonte-dislexia');
    } else if (dislexiaSalva === 'nao') {
        document.body.classList.remove('fonte-dislexia');
    }
}

// Executa automaticamente assim que a estrutura da página estiver pronta
document.addEventListener("DOMContentLoaded", aplicarPreferencias);