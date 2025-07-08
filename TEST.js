/**
 * Accessibility Plugin
 * Features: High-Contrast Mode, Text Resizer, Color Vision Deficiency Support, Text-to-Speech, Reset
 * To use: Include this script in your HTML file.
 */

(function () {
    // --- Styles ---
    const style = document.createElement('style');
    style.innerHTML = `
        .a11y-toolbar {
            position: fixed; top: 10px; right: 10px; z-index: 99999;
            background: #222; color: #fff; border-radius: 8px; padding: 12px 16px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2); font-family: sans-serif;
            display: flex; flex-direction: column; gap: 8px; min-width: 220px;
        }
        .a11y-toolbar button, .a11y-toolbar input[type=range] {
            margin: 2px 0; font-size: 1em; border: none; border-radius: 4px;
            padding: 6px 10px; background: #444; color: #fff; cursor: pointer;
        }
        .a11y-toolbar button:hover { background: #666; }
        .a11y-toolbar label { font-size: 0.95em; margin-bottom: 2px; }
        .a11y-hidden { display: none !important; }
        .a11y-high-contrast * {
            background: #000 !important; color: #fff !important;
            border-color: #fff !important;
            text-shadow: none !important;
        }
        .a11y-high-contrast a, .a11y-high-contrast a:visited {
            color: #0ff !important; text-decoration: underline !important;
        }
        .a11y-high-contrast img, .a11y-high-contrast video {
            filter: grayscale(1) contrast(2) !important;
        }
        .a11y-cvd-redgreen * {
            filter: url('#a11y-cvd-protanope') !important;
        }
        .a11y-cvd-general * {
            filter: grayscale(0.5) !important;
        }
    `;
    document.head.appendChild(style);

    // SVG filter for red-green color blindness simulation
    const svgFilter = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgFilter.setAttribute('width', '0');
    svgFilter.setAttribute('height', '0');
    svgFilter.innerHTML = `
        <filter id="a11y-cvd-protanope">
            <feColorMatrix type="matrix" values="0.567 0.433 0 0 0 0.558 0.442 0 0 0 0 0.242 0.758 0 0 0 0 0 1 0"/>
        </filter>
    `;
    document.body.appendChild(svgFilter);

    // --- Toolbar UI ---
    const toolbar = document.createElement('div');
    toolbar.className = 'a11y-toolbar';
    toolbar.innerHTML = `
        <button id="a11y-contrast-btn" aria-pressed="false">High Contrast</button>
        <label for="a11y-text-size">Text Size</label>
        <input type="range" id="a11y-text-size" min="0" max="19" value="9" />
        <div style="display:flex;gap:4px;">
            <button id="a11y-cvd-redgreen-btn" aria-pressed="false" title="Red-Green Color Blindness">Red-Green CVD</button>
            <button id="a11y-cvd-general-btn" aria-pressed="false" title="General Color Weakness">General CVD</button>
        </div>
        <button id="a11y-tts-hover-btn" aria-pressed="false">Read on Hover</button>
        <button id="a11y-tts-page-btn">Read Page</button>
        <button id="a11y-reset-btn">Reset</button>
    `;
    document.body.appendChild(toolbar);

    // --- State ---
    let highContrast = false;
    let textSizeStep = 9; // 0-19, default 9
    let cvdRedGreen = false;
    let cvdGeneral = false;
    let ttsHover = false;
    let ttsUtterance = null;
    let ttsHoverHandler = null;

    // --- Functions ---
    function setHighContrast(on) {
        highContrast = on;
        document.documentElement.classList.toggle('a11y-high-contrast', on);
        document.getElementById('a11y-contrast-btn').setAttribute('aria-pressed', on);
    }

    function setTextSize(step) {
        textSizeStep = step;
        // 20 steps from 80% to 200%
        const percent = 80 + (step * 6.32);
        document.documentElement.style.fontSize = percent + '%';
        document.getElementById('a11y-text-size').value = step;
    }

    function setCvdRedGreen(on) {
        cvdRedGreen = on;
        document.documentElement.classList.toggle('a11y-cvd-redgreen', on);
        document.getElementById('a11y-cvd-redgreen-btn').setAttribute('aria-pressed', on);
        if (on) setCvdGeneral(false);
    }

    function setCvdGeneral(on) {
        cvdGeneral = on;
        document.documentElement.classList.toggle('a11y-cvd-general', on);
        document.getElementById('a11y-cvd-general-btn').setAttribute('aria-pressed', on);
        if (on) setCvdRedGreen(false);
    }

    function setTtsHover(on) {
        ttsHover = on;
        document.getElementById('a11y-tts-hover-btn').setAttribute('aria-pressed', on);
        if (on) {
            ttsHoverHandler = function (e) {
                if (e.target && e.target.innerText && e.target.innerText.trim().length > 0) {
                    speakText(e.target.innerText.trim());
                }
            };
            document.body.addEventListener('mouseover', ttsHoverHandler);
        } else {
            document.body.removeEventListener('mouseover', ttsHoverHandler);
            stopSpeech();
        }
    }

    function speakText(text) {
        stopSpeech();
        if ('speechSynthesis' in window) {
            ttsUtterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(ttsUtterance);
        }
    }

    function stopSpeech() {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        ttsUtterance = null;
    }

    function readPage() {
        stopSpeech();
        let text = document.body.innerText || '';
        speakText(text);
    }

    function resetAll() {
        setHighContrast(false);
        setTextSize(9);
        setCvdRedGreen(false);
        setCvdGeneral(false);
        setTtsHover(false);
        stopSpeech();
    }

    // --- Event Listeners ---
    document.getElementById('a11y-contrast-btn').onclick = () => setHighContrast(!highContrast);
    document.getElementById('a11y-text-size').oninput = (e) => setTextSize(Number(e.target.value));
    document.getElementById('a11y-cvd-redgreen-btn').onclick = () => setCvdRedGreen(!cvdRedGreen);
    document.getElementById('a11y-cvd-general-btn').onclick = () => setCvdGeneral(!cvdGeneral);
    document.getElementById('a11y-tts-hover-btn').onclick = () => setTtsHover(!ttsHover);
    document.getElementById('a11y-tts-page-btn').onclick = () => readPage();
    document.getElementById('a11y-reset-btn').onclick = () => resetAll();

    // --- Initialize ---
    setTextSize(textSizeStep);

    // --- Accessibility: Keyboard navigation ---
    toolbar.tabIndex = 0;
    toolbar.setAttribute('aria-label', 'Accessibility Toolbar');
})();