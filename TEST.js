```jsx
// AccessibilityTool.jsx
import React, { useState, useEffect, useRef } from "react";
import styled, { createGlobalStyle, css } from "styled-components";

// --- Global Styles for High Contrast, Scaling, Font Size, Usability ---
const GlobalStyles = createGlobalStyle`
    body {
        ${({ highContrast }) =>
            highContrast &&
            css`
                background: #111 !important;
                color: #fff !important;
            `}
        ${({ scale }) =>
            scale !== 1 &&
            css`
                transform: scale(${scale});
                transform-origin: top left;
            `}
        ${({ fontSize }) =>
            fontSize !== 100 &&
            css`
                font-size: ${fontSize}%;
            `}
        transition: background 0.2s, color 0.2s, font-size 0.2s, transform 0.2s;
    }
    * {
        ${({ easyUsability }) =>
            easyUsability &&
            css`
                font-size: 1.2em !important;
                padding: 0.5em 1em !important;
                min-width: 44px;
                min-height: 44px;
            `}
    }
`;

// --- Styled Components ---
const FloatingButton = styled.button`
    position: fixed;
    right: 24px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10000;
    background: #0078d4;
    color: #fff;
    border: none;
    border-radius: 50%;
    width: 56px;
    height: 56px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
`;

const Panel = styled.div`
    position: fixed;
    right: 96px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10001;
    background: #fff;
    color: #222;
    border-radius: 12px;
    box-shadow: 0 2px 16px rgba(0,0,0,0.2);
    padding: 24px;
    min-width: 320px;
    ${({ highContrast }) =>
        highContrast &&
        css`
            background: #222;
            color: #fff;
        `}
`;

const Section = styled.div`
    margin-bottom: 18px;
`;

const Label = styled.label`
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
`;

const Slider = styled.input`
    width: 100%;
`;

const Button = styled.button`
    margin: 0 6px;
    padding: 8px 16px;
    font-size: 1.1em;
    border-radius: 6px;
    border: none;
    background: #0078d4;
    color: #fff;
    cursor: pointer;
    ${({ easyUsability }) =>
        easyUsability &&
        css`
            font-size: 1.3em;
            padding: 16px 24px;
        `}
`;

const Toggle = styled(Button)`
    background: ${({ active }) => (active ? "#005a9e" : "#0078d4")};
`;

// --- Main Component ---
const defaultSettings = {
    highContrast: false,
    scale: 1,
    fontSize: 100,
    easyUsability: false,
};

const SETTINGS_KEY = "accessibilityToolSettings";

export default function AccessibilityTool() {
    const [open, setOpen] = useState(false);
    const [settings, setSettings] = useState(defaultSettings);
    const speechRef = useRef(null);

    // Load settings from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(SETTINGS_KEY);
        if (saved) setSettings(JSON.parse(saved));
    }, []);

    // Persist settings
    useEffect(() => {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }, [settings]);

    // --- Text-to-Speech Hover Handler ---
    useEffect(() => {
        if (!open) return;
        const handleMouseOver = (e) => {
            if (!settings.easyUsability && !settings.highContrast) return;
            const target = e.target;
            if (
                target &&
                target.nodeType === 1 &&
                target.textContent &&
                target.textContent.trim().length > 0 &&
                !["SCRIPT", "STYLE"].includes(target.tagName) &&
                !target.closest('[data-accessibility-tool]')
            ) {
                if (speechRef.current) window.speechSynthesis.cancel();
                const utter = new window.SpeechSynthesisUtterance(target.textContent.trim());
                speechRef.current = utter;
                window.speechSynthesis.speak(utter);
            }
        };
        const handleMouseOut = () => {
            if (speechRef.current) window.speechSynthesis.cancel();
        };
        document.body.addEventListener("mouseover", handleMouseOver);
        document.body.addEventListener("mouseout", handleMouseOut);
        return () => {
            document.body.removeEventListener("mouseover", handleMouseOver);
            document.body.removeEventListener("mouseout", handleMouseOut);
        };
    }, [open, settings.easyUsability, settings.highContrast]);

    // --- Handlers ---
    const toggleSetting = (key) =>
        setSettings((s) => ({ ...s, [key]: !s[key] }));

    const setScale = (value) =>
        setSettings((s) => ({ ...s, scale: value }));

    const adjustFontSize = (delta) =>
        setSettings((s) => ({
            ...s,
            fontSize: Math.max(60, Math.min(200, s.fontSize + delta)),
        }));

    // --- Render ---
    return (
        <>
            <GlobalStyles
                highContrast={settings.highContrast}
                scale={settings.scale}
                fontSize={settings.fontSize}
                easyUsability={settings.easyUsability}
            />
            <FloatingButton
                aria-label="Open accessibility tools"
                onClick={() => setOpen((o) => !o)}
                data-accessibility-tool
                title="Accessibility Tools"
            >
                {/* Person SVG Icon */}
                <svg width="32" height="32" fill="none" viewBox="0 0 32 32">
                    <circle cx="16" cy="9" r="5" fill="currentColor"/>
                    <rect x="13" y="15" width="6" height="12" rx="3" fill="currentColor"/>
                    <rect x="6" y="15" width="6" height="3" rx="1.5" fill="currentColor"/>
                    <rect x="20" y="15" width="6" height="3" rx="1.5" fill="currentColor"/>
                </svg>
            </FloatingButton>
            {open && (
                <Panel highContrast={settings.highContrast} data-accessibility-tool>
                    <Section>
                        <Label>Improve Contrast</Label>
                        <Toggle
                            onClick={() => toggleSetting("highContrast")}
                            active={settings.highContrast}
                            easyUsability={settings.easyUsability}
                        >
                            {settings.highContrast ? "On" : "Off"}
                        </Toggle>
                    </Section>
                    <Section>
                        <Label>Scaling</Label>
                        <Slider
                            type="range"
                            min="0.8"
                            max="1.5"
                            step="0.01"
                            value={settings.scale}
                            onChange={(e) => setScale(Number(e.target.value))}
                            easyUsability={settings.easyUsability ? 1 : 0}
                        />
                        <div>{Math.round(settings.scale * 100)}%</div>
                    </Section>
                    <Section>
                        <Label>Text Size</Label>
                        <Button
                            onClick={() => adjustFontSize(-5)}
                            easyUsability={settings.easyUsability}
                            aria-label="Decrease text size"
                        >
                            –
                        </Button>
                        <span style={{ margin: "0 12px" }}>{settings.fontSize}%</span>
                        <Button
                            onClick={() => adjustFontSize(5)}
                            easyUsability={settings.easyUsability}
                            aria-label="Increase text size"
                        >
                            +
                        </Button>
                    </Section>
                    <Section>
                        <Label>Text-to-Speech</Label>
                        <div style={{ fontSize: "0.95em" }}>
                            Hover over any text to read aloud.
                        </div>
                    </Section>
                    <Section>
                        <Label>Easy Usability</Label>
                        <Toggle
                            onClick={() => toggleSetting("easyUsability")}
                            active={settings.easyUsability}
                            easyUsability={settings.easyUsability}
                        >
                            {settings.easyUsability ? "On" : "Off"}
                        </Toggle>
                    </Section>
                </Panel>
            )}
        </>
    );
}
```