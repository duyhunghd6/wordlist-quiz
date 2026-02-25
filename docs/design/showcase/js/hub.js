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
            const target = e.currentTarget;
            const targetUrl = target.getAttribute("data-target");
            
            // Update URL using Hash Routing without reload
            window.location.hash = targetUrl;

            // Update Active State
            navButtons.forEach(b => b.classList.remove("active"));
            target.classList.add("active");

            // Load Content
            await loadSection(targetUrl, container, loader);
        });
    });

    // Handle browser back/forward buttons (hashchange is better than popstate for hashes)
    window.addEventListener("hashchange", async () => {
        await loadInitialSection();
    });

    // Load initial section
    await loadInitialSection();
}

async function loadInitialSection() {
    const navButtons = document.querySelectorAll(".nav-btn");
    const container = document.getElementById("content-container");
    const loader = document.getElementById("content-loader");

    // Extract target from hash (e.g. #sections/tokens.html -> sections/tokens.html)
    let targetPage = window.location.hash ? window.location.hash.slice(1) : null;

    if (!targetPage) {
        const activeBtn = document.querySelector(".nav-btn.active");
        if (activeBtn) {
            targetPage = activeBtn.getAttribute("data-target");
            // Set initial hash
            window.history.replaceState({}, "", "#" + targetPage);
        }
    }

    if (targetPage) {
        navButtons.forEach(b => {
            if (b.getAttribute("data-target") === targetPage) {
                b.classList.add("active");
            } else {
                b.classList.remove("active");
            }
        });
        
        // If someone types an invalid hash, we might not have a button for it, but we still try to fetch it.
        await loadSection(targetPage, container, loader);
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
            if (window.cleanUpPhysics) window.cleanUpPhysics();
        } else if(url.includes("game-journey.html")) {
            initGameJourney();
            if (window.cleanUpPhysics) window.cleanUpPhysics();
        } else if(url.includes("game-angry-tenses.html")) {
            setTimeout(() => {
                if (window.initAngryPhysics) window.initAngryPhysics();
            }, 100);
        } else {
            if (window.cleanUpPhysics) window.cleanUpPhysics();
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

// Game Journey Logic
function initGameJourney() {
    const subjects = {
        esl: {
            objective: "Objective: Describe daily routines and past experiences",
            nodes: [
                { label: "Vocab Basics", sub: "Swipe, Quiz, Bubble", icon: "ph-stack", state: "completed", stars: 3 },
                { label: "Grammar Structures", sub: "Shape Builder, Timeline", icon: "ph-squares-four", state: "active", stars: 1 },
                { label: "Simple Sentences", sub: "Typing, Scramble", icon: "ph-keyboard", state: "locked", stars: 0 },
                { label: "Complex Output", sub: "Coming Soon", icon: "ph-text-align-left", state: "locked", stars: 0 },
                { label: "Mastery", sub: "Calculate & Explain", icon: "ph-lightbulb", state: "locked", stars: 0 }
            ]
        },
        math: {
            objective: "Objective: Master addition, subtraction and word problems",
            nodes: [
                { label: "Number Basics", sub: "Number match, Quiz", icon: "ph-hash", state: "completed", stars: 3 },
                { label: "Calculation Methods", sub: "Speed Add, Timeline", icon: "ph-math-operations", state: "completed", stars: 3 },
                { label: "Equations", sub: "Equation Builder", icon: "ph-equals", state: "active", stars: 1 },
                { label: "Word Problems", sub: "Coming Soon", icon: "ph-text-aa", state: "locked", stars: 0 },
                { label: "Concept Mastery", sub: "Explain steps", icon: "ph-lightbulb", state: "locked", stars: 0 }
            ]
        },
        science: {
            objective: "Objective: Understand properties of matter, force and ecosystems",
            nodes: [
                { label: "Science Vocab", sub: "Quiz, Flashcards", icon: "ph-flask", state: "completed", stars: 3 },
                { label: "Identify Concepts", sub: "Sort & Match", icon: "ph-magnifying-glass", state: "active", stars: 2 },
                { label: "Simple Processes", sub: "Process Builder", icon: "ph-arrows-clockwise", state: "locked", stars: 0 },
                { label: "Complex Systems", sub: "Coming Soon", icon: "ph-tree", state: "locked", stars: 0 },
                { label: "Method Mastery", sub: "Explain phenomena", icon: "ph-lightbulb", state: "locked", stars: 0 }
            ]
        }
    };

    // --- Progression Logic: Unlock nodes based on previous node score ---
    function applyProgression(nodes) {
        // Start all as locked except first
        nodes.forEach((n, i) => { 
            if (i > 0) n.state = "locked"; 
            else if (n.state === "locked") n.state = "active"; // Force first node open
        });

        for (let i = 0; i < nodes.length - 1; i++) {
            const current = nodes[i];
            const next = nodes[i+1];
            
            // If current is completed with >= 2 stars (roughly >50%), unlock the next
            if (current.state === "completed" && current.stars >= 2) {
                // If the next node was previously locked, make it active
                if (next.state === "locked") {
                    next.state = "active";
                }
            } else {
                // Progression stops here
                break;
            }
        }
        return nodes;
    }

    const buttons = document.querySelectorAll(".js-btn");
    const objectiveEl = document.querySelector(".js-objective");
    const mapArea = document.querySelector(".journey-map-area");
    
    // Modal Elements
    const backdrop = document.querySelector(".js-modal-backdrop");
    const modal = document.querySelector(".js-game-modal");
    const closeBtn = document.querySelector(".js-close-modal");

    if (!buttons.length || !mapArea || !modal) return;

    let currentSubject = "esl";

    // Set initial progression
    Object.keys(subjects).forEach(key => {
        subjects[key].nodes = applyProgression(subjects[key].nodes);
    });

    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            // Update buttons
            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            // Determine subject
            currentSubject = "esl";
            if (btn.classList.contains("js-math")) currentSubject = "math";
            if (btn.classList.contains("js-science")) currentSubject = "science";

            const data = subjects[currentSubject];
            objectiveEl.textContent = data.objective;

            // Rebuild nodes, dropping the old SVG path (drawJourneyPath will recreate it)
            rebuildJourneyNodes(mapArea, data.nodes, currentSubject);
        });
    });

    // Close Modal Logic
    function closeModal() {
        modal.classList.remove("open");
        backdrop.classList.remove("open");
    }
    closeBtn.addEventListener("click", closeModal);
    backdrop.addEventListener("click", closeModal);

    // Initial render
    rebuildJourneyNodes(mapArea, subjects[currentSubject].nodes, currentSubject);
}

function rebuildJourneyNodes(mapArea, nodesData, subjectKey) {
    let nodesHtml = '';
    nodesData.forEach((node) => {
        let starsHtml = '';
        if (node.state !== 'locked') {
            starsHtml = `
                <div class="j-node-stars">
                    <i class="ph-fill ph-star j-star ${node.stars >= 1 ? '' : 'empty'}"></i>
                    <i class="ph-fill ph-star j-star ${node.stars >= 2 ? '' : 'empty'}"></i>
                    <i class="ph-fill ph-star j-star ${node.stars >= 3 ? '' : 'empty'}"></i>
                </div>
            `;
        }

        const actionBubbleHtml = node.state === 'active' ? `
            <div class="j-action-bubble">
                <i class="ph-fill ph-play"></i>
            </div>
        ` : '';

        nodesHtml += `
            <div class="journey-node-wrapper">
                <div class="j-node ${node.state}" data-label="${node.label}" data-sub="${node.sub}">
                    <i class="ph-fill ${node.icon}"></i>
                    ${starsHtml}
                </div>
                ${actionBubbleHtml}
                <div class="j-node-label-container">
                    <div class="j-node-label">${node.label}</div>
                    <div class="j-node-sub">${node.sub}</div>
                </div>
            </div>
        `;
    });

    mapArea.innerHTML = nodesHtml;
    drawJourneyPath();
    bindNodeClicks(mapArea, subjectKey);
}

function bindNodeClicks(mapArea, subjectKey) {
    const clickableNodes = mapArea.querySelectorAll(".j-node:not(.locked), .j-action-bubble");
    clickableNodes.forEach(el => {
        el.addEventListener("click", (e) => {
            const wrapper = e.currentTarget.closest(".journey-node-wrapper");
            const nodeEl = wrapper.querySelector(".j-node");
            const label = nodeEl.getAttribute("data-label");
            const sub = nodeEl.getAttribute("data-sub");
            openGameModal(label, sub, subjectKey);
        });
    });
}

function openGameModal(nodeLabel, nodeSubDesc, subjectKey) {
    const titleEl = document.querySelector(".js-modal-title");
    const descEl = document.querySelector(".js-modal-desc");
    const gamesContainer = document.querySelector(".js-modal-games");
    const modal = document.querySelector(".js-game-modal");
    const backdrop = document.querySelector(".js-modal-backdrop");

    titleEl.textContent = nodeLabel;
    descEl.textContent = `Select a game to practice: ${nodeSubDesc}`;

    // Mock Database of games based on the 'sub' string passed from the node
    let gamesHtml = '';
    const gamesList = nodeSubDesc.split(",").map(s => s.trim()).filter(s => s.toLowerCase() !== "coming soon");

    if (gamesList.length === 0) {
        gamesHtml = `<div style="text-align:center; padding: 20px; color: #94A3B8;">More games arriving in the next update!</div>`;
    } else {
        const gameIcons = {
            "Swipe": { icon: "ph-cards", color: "gs-bg-blue", tags: ["Vocab", "Flashcards"] },
            "Quiz": { icon: "ph-check-square-offset", color: "gs-bg-purple", tags: ["Testing", "Recall"] },
            "Bubble": { icon: "ph-strategy", color: "gs-bg-pink", tags: ["Reflex", "Fun"] },
            "Shape Builder": { icon: "ph-squares-four", color: "gs-bg-purple", tags: ["Grammar", "Drag & Drop"] },
            "Timeline": { icon: "ph-clock-counter-clockwise", color: "gs-bg-orange", tags: ["Context", "Logic"] },
            "Typing": { icon: "ph-keyboard", color: "gs-bg-blue", tags: ["Spelling", "Focus"] },
            "Scramble": { icon: "ph-arrows-left-right", color: "gs-bg-pink", tags: ["Syntax", "Puzzle"] },
            "Number match": { icon: "ph-hash", color: "gs-bg-blue", tags: ["Math", "Pairs"] },
            "Speed Add": { icon: "ph-lightning", color: "gs-bg-orange", tags: ["Speed", "Reflex"] },
            "Equation Builder": {icon: "ph-equals", color: "gs-bg-purple", tags: ["Logic", "Math"] },
            "Flashcards": { icon: "ph-cards", color: "gs-bg-blue", tags: ["Recall"] },
            "Sort & Match": { icon: "ph-intersect", color: "gs-bg-pink", tags: ["Logic", "Categories"] },
            "Process Builder": { icon: "ph-arrows-clockwise", color: "gs-bg-orange", tags: ["Sequence", "Science"] }
        };

        gamesList.forEach(gameName => {
            // Fuzzy match icon data 
            let matchedKey = Object.keys(gameIcons).find(k => gameName.includes(k)) || "Quiz";
            const config = gameIcons[matchedKey];

            const tagsHtml = config.tags.map(t => `<span class="gs-tag">${t}</span>`).join('');

            gamesHtml += `
                <div class="gs-game-card">
                    <div class="gs-game-icon ${config.color}"><i class="ph-fill ${config.icon}"></i></div>
                    <div class="gs-game-info">
                        <div class="gs-game-name">${gameName}</div>
                        <div class="gs-game-tags">${tagsHtml}</div>
                    </div>
                    <div style="display:flex; flex-direction:column; align-items:flex-end; gap: 4px;">
                        <span style="font-size: 0.75rem; font-weight:700; color:#94A3B8;">10 Qs</span>
                        <i class="ph-bold ph-caret-right" style="color:#94A3B8"></i>
                    </div>
                </div>
            `;
        });
    }

    gamesContainer.innerHTML = gamesHtml;

    // Show modal
    backdrop.classList.add("open");
    modal.classList.add("open");
}

function drawJourneyPath() {
    const mapArea = document.querySelector(".journey-map-area");
    if (!mapArea) return;

    // Use absolute timeout to ensure DOM layout is complete before calculating coords
    setTimeout(() => {
        const nodes = mapArea.querySelectorAll(".j-node");
        if (!nodes.length) return;

        let pathD = "";
        let completedPathD = "";

        const containerRect = mapArea.getBoundingClientRect();

        nodes.forEach((node, index) => {
            const rect = node.getBoundingClientRect();
            const x = rect.left - containerRect.left + rect.width / 2 + mapArea.scrollLeft;
            const y = rect.top - containerRect.top + rect.height / 2 + mapArea.scrollTop;

            if (index === 0) {
                pathD += `M ${x},${y} `;
                completedPathD += `M ${x},${y} `;
            } else {
                const prevNode = nodes[index - 1];
                const prevRect = prevNode.getBoundingClientRect();
                const prevX = prevRect.left - containerRect.left + prevRect.width / 2 + mapArea.scrollLeft;
                const prevY = prevRect.top - containerRect.top + prevRect.height / 2 + mapArea.scrollTop;

                const controlY = (prevY + y) / 2;
                const curve = ` C ${prevX},${controlY} ${x},${controlY} ${x},${y}`;
                
                pathD += curve;

                if (node.classList.contains("completed") || node.classList.contains("active")) {
                    completedPathD += curve;
                }
            }
        });

        const svgHeight = mapArea.scrollHeight;
        const svgHtml = `
            <svg class="journey-path-svg" viewBox="0 0 ${containerRect.width} ${svgHeight}" style="position: absolute; top: 0; left: 0; width: 100%; height: ${svgHeight}px; pointer-events: none; z-index: 1;">
                <!-- Shadow/Outline for uncompleted path -->
                <path d="${pathD}" fill="none" stroke="#CBD5E1" stroke-width="20" stroke-linecap="round"/>
                <path d="${pathD}" fill="none" stroke="#F1F5F9" stroke-width="16" stroke-linecap="round"/>
                
                <!-- Completed path with its own stroke outline -->
                <path d="${completedPathD}" fill="none" stroke="#047857" stroke-width="20" stroke-linecap="round"/>
                <path d="${completedPathD}" fill="none" stroke="#10B981" stroke-width="16" stroke-linecap="round"/>
            </svg>
        `;

        const existingSvg = mapArea.querySelector(".journey-path-svg");
        if (existingSvg) existingSvg.remove();

        mapArea.insertAdjacentHTML('afterbegin', svgHtml);
    }, 50);
}
