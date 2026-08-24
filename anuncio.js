// ALERTA DE VACINA

const alerta = document.querySelector(".alert-box");

alerta.addEventListener("click", () => {
    alert("Redirecionando para agendamento da vacina...");
    window.location.href = "Comprar.html"; // coloca aqui a página de agendamento
});



const ad = document.getElementById("adOverlay");
const video = document.getElementById("adVideo");
const closeBtn = document.getElementById("closeAd");

// verificar se já mostrou o anúncio nesta sessão
if (!sessionStorage.getItem("adShown")) {

    ad.style.display = "flex"; // ou block, depende do seu CSS
    sessionStorage.setItem("adShown", "true");

    // fechar manual
    closeBtn.onclick = () => {
        ad.style.display = "none";
        video.pause();
    };

    // fechar automático após 7.3s
    setTimeout(() => {
        ad.style.display = "none";
        video.pause();
    }, 7270);

    // fechar quando video terminar
    video.onended = () => {
        ad.style.display = "none";
    };

} else {
    // se já mostrou, garante que fique escondido
    ad.style.display = "none";
}

// MENU

function toggleMenu(){
  let menu = document.getElementById("menu");

  if(menu.style.display === "block"){
      menu.style.display = "none";
  }else{
      menu.style.display = "block";
  }
}



function irParaPlayer(video, titulo) {
            // Redireciona corretamente para o ficheiro VIDIOSS.HTML passando as variáveis organizadas
            window.location.href = "viiii.html?video=" + encodeURIComponent(video) + "&titulo=" + encodeURIComponent(titulo);
        }

        // Efeito premium: Reproduz automaticamente uma pré-visualização rápida ao passar o rato
        document.querySelectorAll(".thumbnail-container video").forEach(v => {
            v.addEventListener("mouseenter", () => {
                v.play().catch(e => console.log("Autoplay suspenso"));
            });
            v.addEventListener("mouseleave", () => {
                v.pause();
                v.currentTime = 0; // Volta ao início para manter o aspeto limpo
            });
        });