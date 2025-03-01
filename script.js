// Caricamento delle GIF
const gifContainer = document.getElementById("gifContainer");
const gifList = Array.from({ length: 9 }, (_, i) => `gifs/gif${i + 1}.gif`); // modifica il numeri di gif caricate 
if (gifContainer) {
    gifList.forEach(gif => {
        const div = document.createElement("div");
        div.classList.add("asset");
        div.innerHTML = `
            <img src="${gif}" alt="GIF ${gif}">
            <button onclick="copyToOBS('${gif}')">Copy for OBS</button>
        `;
        gifContainer.appendChild(div);
    });
}

function copyToOBS(gifPath) {
    // URL base del sito su Netlify o GitHub Pages
    const baseUrl = "https://ch3f-nerd-art-asset.netlify.app/"; // Sostituiscilo con il tuo vero dominio
    const obsUrl = baseUrl + gifPath;

    navigator.clipboard.writeText(obsUrl).then(() => {
        alert("URL copied for OBS: " + obsUrl);
    });
}

// Caricamento dei Banners
const bannerContainer = document.getElementById("bannerContainer");
const bannerList = Array.from({ length: 0 }, (_, i) => `banners/banner${i + 1}.png`);
const googleDriveUrl = "https://drive.google.com/drive/folders/1fKT6w6J248944ZQ41t_WE_RoqW9YRwwW?usp=sharing";

if (bannerContainer) {
    bannerList.forEach(banner => {
        const div = document.createElement("div");
        div.classList.add("asset");
        div.innerHTML = `<img src="${banner}" alt="Banner ${banner}">`;
        bannerContainer.appendChild(div);
    });
}


document.addEventListener("DOMContentLoaded", () => {
    const passwordSection = document.getElementById("password-section");
    const protectedContent = document.getElementById("protected-content");
    const errorMessage = document.getElementById("error-message");

    const correctPassword = "nuggets"; // Cambia la password qui

    window.checkPassword = function () {
        const userInput = document.getElementById("passwordInput").value;
        
        if (userInput === correctPassword) {
            passwordSection.style.display = "none";
            protectedContent.style.display = "block";
            loadPrivateBanners();
        } else {
            errorMessage.style.display = "block";
        }
    };
    passwordInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            checkPassword();
        }
    });
    function loadPrivateBanners() {
        const privateBannerContainer = document.getElementById("privateBannerContainer");
        const privateBannerList = Array.from({ length: 1 }, (_, i) => `banners/private/private-banner${i + 1}.png`);

        privateBannerList.forEach(banner => {
            const div = document.createElement("div");
            div.classList.add("asset");
            div.innerHTML = `<img src="${banner}" alt="Banner ${banner}">`;
            privateBannerContainer.appendChild(div);
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const paypalButton = document.getElementById("copyPaypal");
    
    if (paypalButton) {
        paypalButton.addEventListener("click", () => {
            const paypalEmail = "Ch3fcrack2@outlook.it"; // Sostituiscilo con la tua vera email di PayPal
            navigator.clipboard.writeText(paypalEmail).then(() => {
                alert("PayPal email copied: " + paypalEmail);
            });
        });
    }
});
document.addEventListener("DOMContentLoaded", () => {
    const presentations = [
        {
            containerId: "presentation1",
            images: ["banners/banner1.png", "banners/banner2.png", "banners/banner3.png"]
        },
        {
            containerId: "presentation2",
            images: ["banners/banner4.png", "banners/banner5.png", "banners/banner6.png","banners/banner7.png","banners/banner8.png","banners/banner9.png","banners/banner10.png","banners/banner11.png","banners/banner12.png","banners/banner13.png","banners/banner14.png","banners/banner15.png"]
        },
        {
            containerId: "presentation3",
            images: ["banners/banner16.png", "banners/banner17.png","banners/banner18.png","banners/banner19.png","banners/banner20.png","banners/banner21.png","banners/banner22.png", "banners/banner23.png"]
        },
        {
            containerId: "presentation4",
            images: ["banners/banner24.png", "banners/banner25.png", "banners/banner26.png","banners/banner27.png","banners/banner28.png","banners/banner29.png"]
        },
        {
            containerId: "presentation5",
            images: ["banners/banner31.png", "banners/banner32.png", "banners/banner36.png"]
        },
        {
            containerId: "presentation6",
            images: ["banners/banner30.png", "banners/banner35.png", "banners/banner34.png"]
        },
        {
            containerId: "presentation7",
            images: ["banners/banner37.png", "banners/banner38.png", "banners/banner39.png"]
        },
        {
            containerId: "presentation8",
            images: ["banners/banner40.png", "banners/banner41.png", "banners/banner42.png"]
        },
        {
            containerId: "presentation9",
            images: ["banners/banner43.png", "banners/banner44.png", "banners/banner45.png", "banners/banner46.png","banners/banner47.png","banners/banner48.png"]
        },
        {
            containerId: "presentation10",
            images: ["banners/banner49.png", "banners/banner50.png","banners/banner51.png", "banners/banner52.png", "banners/banner53.png", "banners/banner54.png"]
        },
        {
            containerId: "presentation11",
            images: ["banners/banner55.png", "banners/banner56.png", "banners/banner57.png"]
        },
        {
            containerId: "presentation12",
            images: ["banners/banner58.png", "banners/banner59.png", "banners/banner60.png"]
        },
        {
            containerId: "presentation13",
            images: ["banners/private/private-banner1.png","banners/private/private-banner1.png"]
        }
        // Aggiungi altre presentazioni qui
    ];

    presentations.forEach(presentation => {
        const container = document.getElementById(presentation.containerId);
        const bannerImage = container.querySelector(".bannerImage");
        const prevBtn = container.querySelector(".prevBtn");
        const nextBtn = container.querySelector(".nextBtn");
        const dots = container.querySelectorAll(".dot");
        let currentIndex = 0;

        function showBanner(index) {
            bannerImage.src = presentation.images[index];
            dots.forEach((dot, i) => {
                dot.classList.toggle("active", i === index);
            });
        }

        dots.forEach((dot, index) => {
            dot.addEventListener("click", () => {
                currentIndex = index;
                showBanner(currentIndex);
            });
        });

        prevBtn.addEventListener("click", () => {
            currentIndex = (currentIndex > 0) ? currentIndex - 1 : presentation.images.length - 1;
            showBanner(currentIndex);
        });

        nextBtn.addEventListener("click", () => {
            currentIndex = (currentIndex < presentation.images.length - 1) ? currentIndex + 1 : 0;
            showBanner(currentIndex);
        });

        showBanner(currentIndex);
    });
});