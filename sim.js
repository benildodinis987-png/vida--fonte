// Smooth scroll para links de navegação
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Mensagem de boas-vindas ao carregar a página
window.addEventListener('load', () => {
    console.log("Bem-vindo ao AgriSaúde 2.0 - Segurança Alimentar Digital!");
});