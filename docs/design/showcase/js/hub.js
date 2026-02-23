document.addEventListener("DOMContentLoaded", () => {
    initHub();
});

async function initHub() {
    await loadDesignTokens();
    
    const navButtons = document.querySelectorAll(".nav-btn");
    const container = document.getElementById("content-container");
    const loader = document.getElementById("content-loader");

    // Handle Navigation
    navButtons.forEach(btn => {
        btn.addEventListener("click", async (e) => {
            // Update Active State
            navButtons.forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");

            // Load Content
            const targetUrl = e.target.getAttribute("data-target");
            await loadSection(targetUrl, container, loader);
        });
    });

    // Load initial section
    const activeBtn = document.querySelector(".nav-btn.active");
    if (activeBtn) {
        await loadSection(activeBtn.getAttribute("data-target"), container, loader);
    }
}

async function loadSection(url, container, loader) {
    try {
        loader.style.display = "block";
        container.style.opacity = "0.5";
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to load ${url}`);
        
        const html = await response.text();
        container.innerHTML = html;
        
        // Re-initialize specific section scripts if needed here (e.g. rendering swatches)
        if(url.includes("tokens.html")) {
            renderTokenSwatches();
        }

    } catch (err) {
        console.error(err);
        container.innerHTML = `<div style="color:red; padding:20px;">Error loading section. ${err.message}</div>`;
    } finally {
        loader.style.display = "none";
        container.style.opacity = "1";
    }
}

// Token Management
let currentTokens = null;

async function loadDesignTokens() {
    try {
        const res = await fetch("../design-tokens.json");
        currentTokens = await res.json();
        applyTokensToRoot(currentTokens);
    } catch (e) {
        console.error("Failed parsing design-tokens.json", e);
    }
}

function applyTokensToRoot(tokens) {
    const root = document.documentElement;
    
    // Apply Colors
    Object.entries(tokens.semantic.color).forEach(([key, val]) => {
        root.style.setProperty(`--color-${key}`, val);
    });
    
    // Apply Typography
    root.style.setProperty(`--font-family`, tokens.semantic.typography['font-family']);

    // Apply Core
    Object.entries(tokens.core.space).forEach(([key, val]) => {
        root.style.setProperty(`--space-${key}`, val);
    });

    Object.entries(tokens.core.shadow).forEach(([key, val]) => {
        root.style.setProperty(`--shadow-${key}`, val);
    });
    
    Object.entries(tokens.core.radius).forEach(([key, val]) => {
        root.style.setProperty(`--radius-${key}`, val);
    });
}

// Renders visual representations of the loaded tokens inside tokens.html
function renderTokenSwatches() {
    if (!currentTokens) return;

    const colorContainer = document.getElementById("color-swatches");
    if (colorContainer) {
        colorContainer.innerHTML = '';
        Object.entries(currentTokens.semantic.color).forEach(([key, val]) => {
            colorContainer.innerHTML += `
                <div class="swatch-card">
                    <div class="swatch-color" style="background-color: var(--color-${key}); border: 1px solid var(--color-border-default)"></div>
                    <div class="swatch-details">
                        <div class="swatch-name">${key}</div>
                        <div class="swatch-val">${val}</div>
                    </div>
                </div>
            `;
        });
    }

    const spaceContainer = document.getElementById("space-swatches");
    if(spaceContainer) {
        spaceContainer.innerHTML = '';
        Object.entries(currentTokens.core.space).forEach(([key, val]) => {
            spaceContainer.innerHTML += `
                <div class="space-row">
                    <div class="space-label">${key} <span class="space-val">(${val})</span></div>
                    <div class="space-bar" style="width: ${val}; background: var(--color-accent)"></div>
                </div>
            `;
        });
    }
}
