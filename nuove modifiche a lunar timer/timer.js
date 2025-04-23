var CONFIG = {
    eventStartMinute: 52,
    eventStartSecond: 25
};

let timerMinutes = 45;
let secondsRemaining = timerMinutes * 60;
let phase = "main";
let lastTickTime = performance.now();
let accumulatedTime = 0;

const timerElement = document.getElementById('timer');
const messageElement = document.getElementById('message');
const timerContainer = document.getElementById('timerContainer');
const bgBanner1Input = document.getElementById('banner1Url'); // cambiato da 'bgBanner1'
const textBanner1Input = document.getElementById('banner1Text'); // cambiato da 'textBanner1'
const bgBanner2Input = document.getElementById('banner2Url'); // cambiato da 'bgBanner2'
const textBanner2Input = document.getElementById('banner2Text'); // cambiato da 'textBanner2'

// Get appearance input elements
const timerColor = document.getElementById('timerColor');
const messageColor = document.getElementById('messageColor');
const shadowColor = document.getElementById('shadowColor');
const shadowSize = document.getElementById('shadowSize');
const shadowBlur = document.getElementById('shadowBlur');

// Add this function near the top of the file
function showNotification(message) {
    // You can customize this notification display
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = translations[currentLanguage][message] || message;
    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function getReferenceTime() {
    const now = new Date();
    now.setSeconds(0);
    now.setMilliseconds(0);
    return now.getTime();
}

function updateTimerDisplay() {
    let minutes = Math.floor(secondsRemaining / 60);
    let seconds = secondsRemaining % 60;
    timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function updateMessage() {
    const params = new URLSearchParams(window.location.search);
    
    if (phase === "main") {
        const text = textBanner1Input?.value || 
                    params.get('text1') || 
                    sessionStorage.getItem('text1') || 
                    "Timer Text 45 min";
        messageElement.textContent = decodeURIComponent(text);
        timerContainer.className = "container main";
        
        const bgUrl = bgBanner1Input?.value || 
                     params.get('bg1') || 
                     sessionStorage.getItem('bg1');
        if (bgUrl) {
            timerContainer.style.backgroundImage = `url('${bgUrl}')`;
            sessionStorage.setItem('bg1', bgUrl);
        }
    } else {
        const text = textBanner2Input?.value || 
                    params.get('text2') || 
                    sessionStorage.getItem('text2') || 
                    "Timer Text 15 min";
        messageElement.textContent = decodeURIComponent(text);
        timerContainer.className = "container short";
        
        const bgUrl = bgBanner2Input?.value || 
                     params.get('bg2') || 
                     sessionStorage.getItem('bg2');
        if (bgUrl) {
            timerContainer.style.backgroundImage = `url('${bgUrl}')`;
            sessionStorage.setItem('bg2', bgUrl);
        }
    }
}

function switchPhase() {
    if (phase === "main") {
        phase = "short";
        timerMinutes = 15;
    } else {
        phase = "main";
        timerMinutes = 45;
    }
    secondsRemaining = timerMinutes * 60;
    updateMessage();
    saveState();
}

function saveState() {
    const state = {
        phase,
        secondsRemaining,
        timerMinutes,
        referenceTime: getReferenceTime(),
        eventStartMinute: CONFIG.eventStartMinute,
        eventStartSecond: CONFIG.eventStartSecond
    };
    sessionStorage.setItem('timerState', JSON.stringify(state));
}

// Modifica la funzione copyToOBS
function copyToOBS() {
    const referenceTime = getReferenceTime();
    
    // Usa i valori correnti dei campi di input
    const banner1Url = bgBanner1Input?.value || sessionStorage.getItem('bg1') || '';
    const banner1Text = textBanner1Input?.value || sessionStorage.getItem('text1') || '';
    const banner2Url = bgBanner2Input?.value || sessionStorage.getItem('bg2') || '';
    const banner2Text = textBanner2Input?.value || sessionStorage.getItem('text2') || '';

    // Costruisci l'URL base
    let url = `${window.location.origin}/lunar%20banners.html?ref=${referenceTime}`;

    // Aggiungi i parametri dei banner se presenti
    if (banner1Url) url += `&bg1=${encodeURIComponent(banner1Url)}`;
    if (banner1Text) url += `&text1=${encodeURIComponent(banner1Text)}`;
    if (banner2Url) url += `&bg2=${encodeURIComponent(banner2Url)}`;
    if (banner2Text) url += `&text2=${encodeURIComponent(banner2Text)}`;

    // Aggiungi le impostazioni di aspetto
    const appearanceSettings = getAppearanceSettings();
    url += `&appearance=${encodeURIComponent(JSON.stringify(appearanceSettings))}`;

    // Salva le impostazioni nel sessionStorage
    saveBannerSettings();

    // Copia l'URL negli appunti
    navigator.clipboard.writeText(url)
        .then(() => {
            showNotification('urlCopied');
            console.log('URL copiato:', url); // Per debug
        })
        .catch(err => {
            console.error('Errore durante la copia:', err);
            alert('Errore durante la copia dell\'URL');
        });
}

function initializeTimer() {
    const params = new URLSearchParams(window.location.search);
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    
    // Calcola il tempo totale in secondi dall'inizio dell'ora
    const currentTimeInSeconds = (currentMinute * 60) + currentSecond;
    const targetTimeInSeconds = (CONFIG.eventStartMinute * 60) + CONFIG.eventStartSecond;
    
    // Reset accumulatori
    accumulatedTime = 0;
    lastTickTime = performance.now();

    // Se il tempo corrente è prima del target time nell'ora corrente
    if (currentTimeInSeconds < targetTimeInSeconds) {
        phase = "main";
        secondsRemaining = targetTimeInSeconds - currentTimeInSeconds;
    } else {
        // Siamo dopo il target time, quindi dobbiamo essere nella fase "short"
        phase = "short";
        const timePassedSeconds = currentTimeInSeconds - targetTimeInSeconds;
        const shortTimerSeconds = 15 * 60; // 15 minuti in secondi
        
        // Calcola quanto tempo è passato nel ciclo corrente di 15 minuti
        const currentCycleSeconds = timePassedSeconds % shortTimerSeconds;
        
        // Calcola i secondi rimanenti nel ciclo corrente di 15 minuti
        secondsRemaining = shortTimerSeconds - currentCycleSeconds;
    }

    timerMinutes = phase === "main" ? 45 : 15;
    updateMessage();
    updateTimerDisplay();
    saveState();
}

function initializeFromURL() {
    const params = new URLSearchParams(window.location.search);
    const savedState = sessionStorage.getItem('timerState');
    
    if (savedState) {
        const state = JSON.parse(savedState);
        const elapsedSeconds = Math.floor((Date.now() - state.startTime) / 1000);
        
        phase = state.phase;
        secondsRemaining = Math.max(0, state.secondsRemaining - elapsedSeconds);
        timerMinutes = state.timerMinutes;
        CONFIG.eventStartMinute = state.eventStartMinute;
        CONFIG.eventStartSecond = state.eventStartSecond;

        if (bgBanner1Input && state.bg1) bgBanner1Input.value = state.bg1;
        if (textBanner1Input && state.text1) textBanner1Input.value = state.text1;
        if (bgBanner2Input && state.bg2) bgBanner2Input.value = state.bg2;
        if (textBanner2Input && state.text2) textBanner2Input.value = state.text2;
    } else {
        if (params.has('minute')) CONFIG.eventStartMinute = parseInt(params.get('minute'), 10);
        if (params.has('second')) CONFIG.eventStartSecond = parseInt(params.get('second'), 10);
        initializeTimer();
    }

    if (params.has('bg1') && bgBanner1Input) bgBanner1Input.value = params.get('bg1');
    if (params.has('text1') && textBanner1Input) textBanner1Input.value = decodeURIComponent(params.get('text1'));
    if (params.has('bg2') && bgBanner2Input) bgBanner2Input.value = params.get('bg2');
    if (params.has('text2') && textBanner2Input) textBanner2Input.value = decodeURIComponent(params.get('text2'));
    
    if (params.has('transparent')) {
        document.body.style.backgroundColor = 'transparent';
        timerContainer.style.backgroundColor = 'rgba(36, 36, 36, 0.7)';
    }
    const signature = document.querySelector('.signature');
    if (signature) {
        signature.style.display = params.get('showSignature') === 'true' ? 'block' : 'none';
    }
    updateMessage();
    updateTimerDisplay();
}

// Function to update text appearance
function updateTextAppearance() {
    const timer = document.getElementById('timer');
    const message = document.getElementById('message');
    const shadowStyle = `${shadowSize.value}px ${shadowSize.value}px ${shadowBlur.value}px ${shadowColor.value}`;
    
    timer.style.color = timerColor.value;
    timer.style.textShadow = shadowStyle;
    
    message.style.color = messageColor.value;
    message.style.textShadow = shadowStyle;
}

// Add event listeners for appearance inputs
timerColor.addEventListener('input', updateTextAppearance);
messageColor.addEventListener('input', updateTextAppearance);
shadowColor.addEventListener('input', updateTextAppearance);
shadowSize.addEventListener('input', updateTextAppearance);
shadowBlur.addEventListener('input', updateTextAppearance);

// Save appearance settings in localStorage
function saveAppearanceSettings() {
    const settings = {
        timerColor: timerColor.value,
        messageColor: messageColor.value,
        shadowColor: shadowColor.value,
        shadowSize: shadowSize.value,
        shadowBlur: shadowBlur.value
    };
    localStorage.setItem('appearanceSettings', JSON.stringify(settings));
}

// Load appearance settings from localStorage
function loadAppearanceSettings() {
    const settings = JSON.parse(localStorage.getItem('appearanceSettings'));
    if (settings) {
        timerColor.value = settings.timerColor;
        messageColor.value = settings.messageColor;
        shadowColor.value = settings.shadowColor;
        shadowSize.value = settings.shadowSize;
        shadowBlur.value = settings.shadowBlur;
        updateTextAppearance();
    }
}

function rotateSignatures() {
    const signatures = [
        "Created by Ch3f_nerd_art",
        "Ch3f_nerd_art が制作",
        "由 Ch3f_nerd_art 创作"
    ];
    const signatureElement = document.querySelector('.signature');
    if (!signatureElement) return;

    let currentIndex = 0;
    setInterval(() => {
        signatureElement.style.opacity = '0';
        setTimeout(() => {
            signatureElement.textContent = signatures[currentIndex];
            signatureElement.style.opacity = '1';
            currentIndex = (currentIndex + 1) % signatures.length;
        }, 500);
    }, 30000);
}
function timerTick() {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastTickTime;
    lastTickTime = currentTime;
    
    accumulatedTime += deltaTime;
    
    while (accumulatedTime >= 1000) {
        if (secondsRemaining > 0) {
            secondsRemaining--;
            saveState();
        } else {
            switchPhase();
        }
        accumulatedTime -= 1000;
    }
    
    updateTimerDisplay();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input[type="number"]');
    if (inputs.length > 0) {
        document.getElementById('setTimeBtn')?.addEventListener('click', function() {
            const minute = parseInt(document.getElementById('minuteInput').value, 10);
            const second = parseInt(document.getElementById('secondInput').value, 10);
            
            if (minute < 0 || minute > 59 || second < 0 || second > 59) {
                alert('Inserisci valori validi (0-59) per minuti e secondi.');
                return;
            }
            
            CONFIG.eventStartMinute = minute;
            CONFIG.eventStartSecond = second;
            initializeTimer();
        });

        document.getElementById('defaultBtn')?.addEventListener('click', function() {
            document.getElementById('minuteInput').value = '52';
            document.getElementById('secondInput').value = '25';
            CONFIG.eventStartMinute = 52;
            CONFIG.eventStartSecond = 25;
            initializeTimer();
        });

        const applyButton = document.getElementById('applyCustomizationsBtn');
        if (applyButton) {
            applyButton.addEventListener('click', function() {
                try {
                    const settings = saveBannerSettings();
                    if (settings && (settings.text1 || settings.text2 || settings.bg1 || settings.bg2)) {
                        saveAppearanceSettings();
                        updateMessage(); // Update preview immediately
                        updateTextAppearance();
                        alert('Modifiche applicate con successo');
                    } else {
                        alert('Nessuna modifica da salvare');
                    }
                } catch (error) {
                    console.error('Error applying customizations:', error);
                    alert('Errore durante l\'applicazione delle modifiche');
                }
            });
        }

        document.getElementById('copyToOBSBtn')?.addEventListener('click', copyToOBS);
    }

    // Carica i valori salvati nei campi di input
    const savedText1 = sessionStorage.getItem('text1');
    const savedBg1 = sessionStorage.getItem('bg1');
    const savedText2 = sessionStorage.getItem('text2');
    const savedBg2 = sessionStorage.getItem('bg2');

    if (savedText1 && textBanner1Input) textBanner1Input.value = savedText1;
    if (savedBg1 && bgBanner1Input) bgBanner1Input.value = savedBg1;
    if (savedText2 && textBanner2Input) textBanner2Input.value = savedText2;
    if (savedBg2 && bgBanner2Input) bgBanner2Input.value = savedBg2;

    initializeFromURL();
    rotateSignatures();
    setInterval(timerTick, 100); // Mettere qui l'intervallo
});

// Combinare i listeners di load in uno solo
window.addEventListener('load', () => {
    loadAppearanceSettings();
    loadSettingsFromUrl();
});

// Funzione per caricare le impostazioni dall'URL quando la pagina si carica
function loadSettingsFromUrl() {
    const url = new URL(window.location.href);
    const appearanceParam = url.searchParams.get('appearance');
    
    if (appearanceParam) {
        try {
            const settings = JSON.parse(appearanceParam);
            timerColor.value = settings.timerColor;
            messageColor.value = settings.messageColor;
            shadowColor.value = settings.shadowColor;
            shadowSize.value = settings.shadowSize;
            shadowBlur.value = settings.shadowBlur;
            updateTextAppearance();
        } catch (e) {
            console.error('Error loading appearance settings from URL:', e);
        }
    }
}

// Creare una funzione helper per le impostazioni di aspetto
function getAppearanceSettings() {
    return {
        timerColor: document.getElementById('timerColor')?.value,
        messageColor: document.getElementById('messageColor')?.value,
        shadowColor: document.getElementById('shadowColor')?.value,
        shadowSize: document.getElementById('shadowSize')?.value,
        shadowBlur: document.getElementById('shadowBlur')?.value
    };
}

// Modifica la funzione saveBannerSettings per controllare se gli elementi esistono prima di accederli
function saveBannerSettings() {
    try {
        // Get the input elements first
        const banner1TextInput = document.getElementById('banner1Text');
        const banner1UrlInput = document.getElementById('banner1Url');
        const banner2TextInput = document.getElementById('banner2Text');
        const banner2UrlInput = document.getElementById('banner2Url');

        // Get the current values if inputs exist, otherwise use existing sessionStorage values
        const banner1Text = banner1TextInput?.value || sessionStorage.getItem('text1') || '';
        const banner1Url = banner1UrlInput?.value || sessionStorage.getItem('bg1') || '';
        const banner2Text = banner2TextInput?.value || sessionStorage.getItem('text2') || '';
        const banner2Url = banner2UrlInput?.value || sessionStorage.getItem('bg2') || '';

        // Only save non-empty values to sessionStorage
        if (banner1Text) sessionStorage.setItem('text1', banner1Text);
        if (banner1Url) sessionStorage.setItem('bg1', banner1Url);
        if (banner2Text) sessionStorage.setItem('text2', banner2Text);
        if (banner2Url) sessionStorage.setItem('bg2', banner2Url);

        const settings = {
            text1: banner1Text,
            bg1: banner1Url,
            text2: banner2Text,
            bg2: banner2Url
        };

        console.log('Current input values:', {
            banner1Text: banner1TextInput?.value,
            banner1Url: banner1UrlInput?.value,
            banner2Text: banner2TextInput?.value,
            banner2Url: banner2UrlInput?.value
        });

        console.log('Saved banner settings:', settings);
        return settings;
    } catch (error) {
        console.error('Error saving banner settings:', error);
        return null;
    }
}