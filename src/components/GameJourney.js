import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Calculator, MagnifyingGlass, Flask, X, CaretRight, Cards, CheckSquareOffset, Strategy, SquaresFour, ClockCounterClockwise, Keyboard, ArrowsLeftRight, Hash, Lightning, Equals, Intersect, ArrowsClockwise, CheckSquare, Square, UserGear, Play } from 'phosphor-react';
import { GAMES } from '../constants/gameConfig';

// Make subjects list to drive the Header Sub-navigation
const SUBJECTS = {
  wordlist_esl: { id: "wordlist_esl", label: "ESL", icon: BookOpen },
  wordlist_math: { id: "wordlist_math", label: "Math", icon: Calculator },
  wordlist_science: { id: "wordlist_science", label: "Sci", icon: Flask }
};

// Hardcoded journey data for each subject (Mocking backend progression)
const JOURNEY_DATA = {
    wordlist_esl: {
        objective: "Objective: Describe daily routines and past experiences",
        nodes: [
            { id: "esl_1", label: "Vocab Basics", sub: "Swipe, Quiz, Bubble", icon: "stack", type: "vocab" },
            { id: "esl_2", label: "Grammar Structures", sub: "Shape Builder, Timeline", icon: "squares-four", type: "grammar" },
            { id: "esl_3", label: "Simple Sentences", sub: "Typing, Scramble", icon: "keyboard", type: "grammar" },
            { id: "esl_4", label: "Complex Output", sub: "Coming Soon", icon: "text-align-left", type: "grammar" },
            { id: "esl_5", label: "Mastery", sub: "Calculate & Explain", icon: "lightbulb", type: "both" }
        ]
    },
    wordlist_math: {
        objective: "Objective: Master addition, subtraction and word problems",
        nodes: [
            { id: "math_1", label: "Number Basics", sub: "Number match, Quiz", icon: "hash" },
            { id: "math_2", label: "Calculation Methods", sub: "Speed Add, Timeline", icon: "math-operations" },
            { id: "math_3", label: "Equations", sub: "Equation Builder", icon: "equals" },
            { id: "math_4", label: "Word Problems", sub: "Coming Soon", icon: "text-aa" },
            { id: "math_5", label: "Concept Mastery", sub: "Explain steps", icon: "lightbulb" }
        ]
    },
    wordlist_science: {
        objective: "Objective: Understand properties of matter, force and ecosystems",
        nodes: [
            { id: "sci_1", label: "Science Vocab", sub: "Quiz, Flashcards", icon: "flask" },
            { id: "sci_2", label: "Identify Concepts", sub: "Sort & Match", icon: "magnifying-glass" },
            { id: "sci_3", label: "Simple Processes", sub: "Process Builder", icon: "arrows-clockwise" },
            { id: "sci_4", label: "Complex Systems", sub: "Coming Soon", icon: "tree" },
            { id: "sci_5", label: "Method Mastery", sub: "Explain phenomena", icon: "lightbulb" }
        ]
    }
};

const GAME_ICONS = {
    "Swipe": { icon: Cards, color: "gs-bg-blue", tags: ["Vocab", "Flashcards"] },
    "Quiz": { icon: CheckSquareOffset, color: "gs-bg-purple", tags: ["Testing", "Recall"] },
    "Bubble": { icon: Strategy, color: "gs-bg-pink", tags: ["Reflex", "Fun"] },
    "Shape Builder": { icon: SquaresFour, color: "gs-bg-purple", tags: ["Grammar", "Drag & Drop"] },
    "Timeline": { icon: ClockCounterClockwise, color: "gs-bg-orange", tags: ["Context", "Logic"] },
    "Typing": { icon: Keyboard, color: "gs-bg-blue", tags: ["Spelling", "Focus"] },
    "Scramble": { icon: ArrowsLeftRight, color: "gs-bg-pink", tags: ["Syntax", "Puzzle"] },
    "Number match": { icon: Hash, color: "gs-bg-blue", tags: ["Math", "Pairs"] },
    "Speed Add": { icon: Lightning, color: "gs-bg-orange", tags: ["Speed", "Reflex"] },
    "Equation Builder": {icon: Equals, color: "gs-bg-purple", tags: ["Logic", "Math"] },
    "Flashcards": { icon: Cards, color: "gs-bg-blue", tags: ["Recall"] },
    "Sort & Match": { icon: Intersect, color: "gs-bg-pink", tags: ["Logic", "Categories"] },
    "Process Builder": { icon: ArrowsClockwise, color: "gs-bg-orange", tags: ["Sequence", "Science"] },
    // Missing mappings for newer games
    "Word Search": { icon: MagnifyingGlass, color: "gs-bg-blue", tags: ["Vocab", "Focus"] },
    "Photobomb": { icon: Intersect, color: "gs-bg-pink", tags: ["Grammar", "Visual"] },
    "Tense Runner": { icon: Strategy, color: "gs-bg-orange", tags: ["Grammar", "Reflex"] },
    "Signal Spotter": { icon: BookOpen, color: "gs-bg-purple", tags: ["Grammar", "Reading"] },
    "Word Runner": { icon: Lightning, color: "gs-bg-blue", tags: ["Grammar", "Speed"] },
    "Angry Tenses": { icon: Strategy, color: "gs-bg-orange", tags: ["Grammar", "Physics"] }
};




const GameJourney = ({ 
    selectedWordlist, 
    handleWordlistChange, 
    wordlists,
    profile,
    avatar,
    onProfileClick,
    onEditName,
    onOpenParentReport,
    startQuiz,
    startGrammarGame,
    onSelectGame,
    selectedGame,
    units = [],
    selectedUnits = [],
    setSelectedUnits,
    numQuestions,
    setNumQuestions
}) => {
    const mapAreaRef = useRef(null);
    const [pathD, setPathD] = useState("");
    const [completedPathD, setCompletedPathD] = useState("");
    const [svgHeight, setSvgHeight] = useState(0);

    const [activeModalNode, setActiveModalNode] = useState(null); // { label, sub }
    
    // Derived State
    const currentSubjectKey = selectedWordlist || "wordlist_esl";
    const subjectData = JOURNEY_DATA[currentSubjectKey] || { nodes: [] };

    // Mock progress calculation for Demo
    // In reality, this would read from localstorage history per node.id
    const nodesWithProgress = (subjectData.nodes || []).map((node, i) => {
        let state = "locked";
        let stars = 0;
        
        // Mock data: first node 3 stars, second node 1 star, etc based on index
        if (i === 0) { state = "completed"; stars = 3; }
        else if (i === 1) { state = "active"; stars = 1; }
        else if (i === 2) { state = "locked"; stars = 0; }
        else { state = "locked"; stars = 0; }

        return { ...node, state, stars };
    });

    // Handle SVG Path Drawing 
    useEffect(() => {
        const drawPath = () => {
            if (!mapAreaRef.current) return;
            const container = mapAreaRef.current;
            const nodesDOM = container.querySelectorAll(".j-node");
            if (!nodesDOM.length) return;

            let d = "";
            let compD = "";
            const containerRect = container.getBoundingClientRect();

            nodesDOM.forEach((nodeEl, index) => {
                const rect = nodeEl.getBoundingClientRect();
                const x = rect.left - containerRect.left + rect.width / 2 + container.scrollLeft;
                const y = rect.top - containerRect.top + rect.height / 2 + container.scrollTop;

                if (index === 0) {
                    d += `M ${x},${y} `;
                    compD += `M ${x},${y} `;
                } else {
                    const prevNode = nodesDOM[index - 1];
                    const prevRect = prevNode.getBoundingClientRect();
                    const prevX = prevRect.left - containerRect.left + prevRect.width / 2 + container.scrollLeft;
                    const prevY = prevRect.top - containerRect.top + prevRect.height / 2 + container.scrollTop;

                    const controlY = (prevY + y) / 2;
                    const curve = ` C ${prevX},${controlY} ${x},${controlY} ${x},${y}`;
                    
                    d += curve;
                    const nodeState = nodesWithProgress[index].state;
                    if (nodeState === "completed" || nodeState === "active") {
                        compD += curve;
                    }
                }
            });

            setPathD(d);
            setCompletedPathD(compD);
            setSvgHeight(container.scrollHeight);
        };

        // Delay slighty to ensure React renders nodes to DOM completely before measuring
        setTimeout(drawPath, 50);
        window.addEventListener("resize", drawPath);
        return () => window.removeEventListener("resize", drawPath);
    }, [currentSubjectKey, nodesWithProgress]);


    const renderNode = (node, index) => {
        const isLocked = node.state === "locked";
        return (
            <div key={node.id} className="journey-node-wrapper">
                <div 
                    className={`j-node ${node.state}`} 
                    onClick={() => !isLocked && setActiveModalNode(node)}
                >
                    {/* Label inside circle */}
                    <div className="j-node-label-in">{node.label}</div>
                    
                    {/* Stars */}
                    {!isLocked && (
                        <div className="j-node-stars">
                            <i className={`ph-fill ph-star j-star ${node.stars >= 1 ? '' : 'empty'}`}></i>
                            <i className={`ph-fill ph-star j-star ${node.stars >= 2 ? '' : 'empty'}`}></i>
                            <i className={`ph-fill ph-star j-star ${node.stars >= 3 ? '' : 'empty'}`}></i>
                        </div>
                    )}
                </div>

                {node.state === "active" && (
                    <div className="j-action-bubble" onClick={(e) => { e.stopPropagation(); setActiveModalNode(node); }}>
                        <Play weight="fill" />
                    </div>
                )}
            </div>
        );
    };

    // We want to show all games separated by category, not just a static subset
    const vocabGames = GAMES.filter(g => !g.isGrammar);
    const grammarGames = GAMES.filter(g => g.isGrammar);

    const handleStartSpecificGame = (gameObj) => {
        onSelectGame(gameObj.id);
        setTimeout(() => {
            if (gameObj.isGrammar) {
                startGrammarGame(gameObj.id);
            } else {
                startQuiz();
            }
        }, 50);
    };

    const renderGameCardRow = (gameObj) => {
        let matchedKey = Object.keys(GAME_ICONS).find(k => gameObj.name.includes(k)) || "Quiz";
        const config = GAME_ICONS[matchedKey] || GAME_ICONS["Quiz"];
        const Icon = config.icon || BookOpen;
        const isDisabled = selectedUnits.length === 0;

        return (
            <div 
                key={gameObj.id} 
                className="gs-game-card" 
                style={{ opacity: isDisabled ? 0.5 : 1, pointerEvents: isDisabled ? 'none' : 'auto', marginBottom: '8px' }}
                onClick={() => handleStartSpecificGame(gameObj)}
            >
                <div className={`gs-game-icon ${config.color || 'gs-bg-blue'}`}><Icon weight="fill" /></div>
                <div className="gs-game-info">
                    <div className="gs-game-name">{gameObj.name}</div>
                    <div className="gs-game-tags">
                        {(config.tags || []).map(t => <span key={t} className="gs-tag">{t}</span>)}
                    </div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', background: '#3B82F6', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800}}>
                    Play <CaretRight weight="bold" />
                </div>
            </div>
        );
    };

    const allSelected = units.length > 0 && units.length === selectedUnits.length;
    const handleSelectAll = () => {
        if (allSelected) {
            setSelectedUnits([]);
        } else {
            setSelectedUnits([...units]);
        }
    };

    return (
        <div className="screen-mockup journey-mode" style={{ margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100vh', maxHeight: '100vh', padding: 0 }}>
            {/* Header */}
            <div className="journey-header-container">
                <div className="journey-header">
                    <button className="jh-user" onClick={onProfileClick}>
                        <div className="jh-avatar">{avatar?.emoji || '🐼'}</div>
                        <div className="jh-name-wrapper">
                            <div className="jh-name">{profile?.name || 'Explorer'}</div>
                            <div className="jh-edit" onClick={(e) => { e.stopPropagation(); onEditName(); }}>Switch / Edit <i className="ph-bold ph-caret-down"></i></div>
                        </div>
                    </button>
                    <div className="jh-actions">
                        <div className="jh-stats">
                            <div className="jh-stat-badge"><i className="ph-fill ph-fire"></i> 12</div>
                            <div className="jh-stat-badge"><i className="ph-fill ph-star"></i> 450</div>
                        </div>
                        <button className="jh-parent-panel" title="Parent Dashboard" onClick={onOpenParentReport}>
                            <UserGear weight="bold" />
                        </button>
                    </div>
                </div>

                <div className="recent-play-banner" onClick={() => setActiveModalNode(nodesWithProgress[1]) /* mock active node */}>
                    <div className="rp-info">
                        <div className="rp-icon"><i className="ph-bold ph-play-circle"></i></div>
                        <div className="rp-text">
                            <span className="rp-title">Resume Learning</span>
                            <span className="rp-game">{SUBJECTS[currentSubjectKey]?.label} • {nodesWithProgress[1]?.label}</span>
                        </div>
                    </div>
                    <div className="rp-action">Continue</div>
                </div>

                <div className="journey-subjects">
                    {wordlists.map(wl => {
                        const subj = SUBJECTS[wl];
                        if(!subj) return null;
                        const Icon = subj.icon;
                        const isActive = currentSubjectKey === wl;
                        return (
                            <div key={wl} className={`js-btn ${isActive ? 'active' : ''}`} onClick={() => handleWordlistChange(wl)}>
                                <Icon size={18} /> {subj.label}
                            </div>
                        )
                    })}
                </div>
                
                <div className="js-objective">
                    {subjectData.objective}
                </div>
            </div>

            {/* Scrollable Map */}
            <div className="journey-map-area" ref={mapAreaRef}>
                <svg className="journey-path-svg" viewBox={`0 0 ${mapAreaRef.current?.getBoundingClientRect().width || 375} ${svgHeight}`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: `${svgHeight}px`, pointerEvents: 'none', zIndex: 1 }}>
                    {/* Shadow/Outline for uncompleted path */}
                    <path d={pathD} fill="none" stroke="#CBD5E1" strokeWidth="20" strokeLinecap="round"/>
                    <path d={pathD} fill="none" stroke="#F1F5F9" strokeWidth="16" strokeLinecap="round"/>
                    
                    {/* Completed path with its own stroke outline */}
                    <path d={completedPathD} fill="none" stroke="#047857" strokeWidth="20" strokeLinecap="round"/>
                    <path d={completedPathD} fill="none" stroke="#10B981" strokeWidth="16" strokeLinecap="round"/>
                </svg>

                {nodesWithProgress.map((node, index) => renderNode(node, index))}
            </div>

            {/* Backdrop */}
            <div className={`modal-backdrop ${activeModalNode ? 'open' : ''}`} onClick={() => setActiveModalNode(null)}></div>

            {/* Bottom Sheet Modal */}
            <div className={`game-selection-modal ${activeModalNode ? 'open' : ''}`}>
                <div className="gs-drag-handle"></div>
                
                <div className="gs-header">
                    <div className="gs-title-area">
                        <div className="gs-title">{activeModalNode?.label}</div>
                        <div className="gs-desc">Select a game to practice: {activeModalNode?.sub}</div>
                    </div>
                </div>

                {/* Configuration Options Inside Modal */}
                {activeModalNode && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#F8FAFC', padding: '12px', borderRadius: '16px' }}>
                        {/* Units Selection */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Units</div>
                            <button onClick={handleSelectAll} style={{ fontSize: '0.75rem', fontWeight: 600, color: '#3B82F6', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                                {allSelected ? <Square size={12} /> : <CheckSquare size={12} />}
                                {allSelected ? 'Clear' : 'Select All'}
                            </button>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                            {units.map(unit => {
                                const isChecked = selectedUnits.includes(unit);
                                return (
                                    <button
                                        key={unit}
                                        onClick={() => {
                                            if (isChecked) setSelectedUnits(selectedUnits.filter(u => u !== unit));
                                            else setSelectedUnits([...selectedUnits, unit]);
                                        }}
                                        style={{
                                            padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap', border: '2px solid transparent', cursor: 'pointer', transition: '0.2s',
                                            background: isChecked ? '#3B82F6' : '#E2E8F0',
                                            color: isChecked ? 'white' : '#475569'
                                        }}
                                    >
                                        {unit}
                                    </button>
                                );
                            })}
                        </div>
                        
                        {/* Question Count Selection */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                           <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>Questions</div>
                           <div style={{ display: 'flex', gap: '4px' }}>
                               {[5, 10, 20].map(num => (
                                   <button
                                     key={num}
                                     onClick={() => setNumQuestions(num)}
                                     style={{
                                         padding: '4px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', border: 'none', transition: '0.2s',
                                         background: numQuestions === num ? '#1E293B' : '#E2E8F0',
                                         color: numQuestions === num ? 'white' : '#475569',
                                     }}
                                   >
                                       {num}
                                   </button>
                               ))}
                           </div>
                        </div>
                    </div>
                )}


                <div className="gs-game-list">
                    {currentSubjectKey === 'wordlist_esl' ? (
                        <>
                            {(!activeModalNode?.type || activeModalNode.type === 'vocab' || activeModalNode.type === 'both') && (
                                <>
                                    <div style={{ fontWeight: 800, color: '#1E293B', margin: '4px 0 8px', fontSize: '1.1rem' }}>Vocab Games</div>
                                    {vocabGames.map(g => renderGameCardRow(g))}
                                </>
                            )}

                            {(!activeModalNode?.type || activeModalNode.type === 'grammar' || activeModalNode.type === 'both') && (
                                <>
                                    <div style={{ fontWeight: 800, color: '#1E293B', margin: '16px 0 8px', fontSize: '1.1rem' }}>Grammar Games</div>
                                    {grammarGames.map(g => renderGameCardRow(g))}
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <div style={{ fontWeight: 800, color: '#1E293B', margin: '4px 0 8px', fontSize: '1.1rem' }}>{subjectData.label || "Available"} Games</div>
                            {(() => {
                                const parsedGames = activeModalNode?.sub.split(",").map(s => s.trim()).filter(s => s.toLowerCase() !== "coming soon") || [];
                                if (parsedGames.length === 0) {
                                    return <div style={{ textAlign: 'center', padding: '20px', color: '#94A3B8' }}>More games arriving in the next update!</div>;
                                }
                                return parsedGames.map(gameName => 
                                    renderGameCardRow({ id: gameName.toLowerCase().replace(" ", "_"), name: gameName, isGrammar: false })
                                );
                            })()}
                        </>
                    )}
                </div>
            </div>

            {/* Close Modal Global Float Button (easier to reach on mobile) */}
            {activeModalNode && (
                <button 
                    onClick={() => setActiveModalNode(null)}
                    style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 60, width: '40px', height: '40px', borderRadius: '50%', background: 'white', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                    <X weight="bold" size={20} color="#64748B" />
                </button>
            )}

        </div>
    );
};

export default GameJourney;
