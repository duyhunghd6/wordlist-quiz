import React, { useState, useEffect, useRef, useCallback } from "react";
import { Home } from "lucide-react";
import Matter from "matter-js";
import "./AngryTenses.css";

const SAMPLE_SENTENCES = [
  {
    before: "I",
    after: "to the park yesterday.",
    options: ["go", "went", "gone", "going"],
    correct: "went",
  },
  {
    before: "She",
    after: "her homework every day.",
    options: ["do", "does", "did", "doing"],
    correct: "does",
  },
  {
    before: "They",
    after: "playing football right now.",
    options: ["is", "are", "was", "were"],
    correct: "are",
  },
  {
    before: "He",
    after: "a book last night.",
    options: ["read", "reads", "reading", "readed"],
    correct: "read",
  },
  {
    before: "We",
    after: "to school by bus.",
    options: ["go", "goes", "went", "going"],
    correct: "go",
  },
  {
    before: "The cat",
    after: "on the mat.",
    options: ["sit", "sits", "sat", "sitting"],
    correct: "sits",
  },
  {
    before: "I",
    after: "already eaten lunch.",
    options: ["have", "has", "had", "having"],
    correct: "have",
  },
  {
    before: "She",
    after: "to music every morning.",
    options: ["listen", "listens", "listened", "listening"],
    correct: "listens",
  },
];

const AngryTensesGame = ({
  words,
  tenseSentences,
  onAnswer,
  onComplete,
  onHome,
}) => {
  const [phase, setPhase] = useState("grammar");
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeOption, setActiveOption] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [physicsReady, setPhysicsReady] = useState(false);

  const canvasContainerRef = useRef(null);
  const engineRef = useRef(null);
  const renderRef = useRef(null);
  const runnerRef = useRef(null);
  const timerRef = useRef(null);
  const viewportRef = useRef(null);
  const lastTapRef = useRef(0);

  const numQuestions = Math.min(words?.length || 5, 10);

  useEffect(() => {
    const generated = [];
    for (let i = 0; i < numQuestions; i++) {
      const template = SAMPLE_SENTENCES[i % SAMPLE_SENTENCES.length];
      generated.push({
        ...template,
        targetWord: words?.[i]?.word || `q${i}`,
        options: [...template.options].sort(() => Math.random() - 0.5),
      });
    }
    setQuestions(generated);
  }, [words, numQuestions]);

  // Keyboard handler for scroll picker
  useEffect(() => {
    const handler = (e) => {
      if (phase !== "grammar" || confirmed) return;
      const q = questions[currentIndex];
      if (!q) return;

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveOption((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveOption((prev) => Math.min(q.options.length - 1, prev + 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        confirmSelection();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  // Scroll viewport to active item (when activeOption changes programmatically)
  useEffect(() => {
    if (viewportRef.current && !viewportRef.current._userScrolling) {
      const itemH = 50;
      viewportRef.current.scrollTo({
        top: activeOption * itemH,
        behavior: "smooth",
      });
    }
  }, [activeOption]);

  // Auto-detect which item is centered when user scrolls
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    let scrollTimer = null;

    const handleScroll = () => {
      if (confirmed) return;
      vp._userScrolling = true;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        vp._userScrolling = false;
        const itemH = 50;
        const centered = Math.round(vp.scrollTop / itemH);
        const q = questions[currentIndex];
        if (q && centered >= 0 && centered < q.options.length) {
          setActiveOption(centered);
        }
      }, 80);
    };

    vp.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      vp.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimer);
    };
  }, [currentIndex, questions, confirmed]);

  useEffect(() => {
    return () => cleanupPhysics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cleanupPhysics = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (engineRef.current) {
      try {
        if (renderRef.current) Matter.Render.stop(renderRef.current);
        if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
        Matter.World.clear(engineRef.current.world);
        Matter.Engine.clear(engineRef.current);
        if (renderRef.current?.canvas) renderRef.current.canvas.remove();
      } catch (e) {
        /* ignore */
      }
      engineRef.current = null;
      renderRef.current = null;
      runnerRef.current = null;
    }
  }, []);

  const confirmSelection = () => {
    if (confirmed || !questions[currentIndex]) return;
    const q = questions[currentIndex];
    const selectedWord = q.options[activeOption];
    const correct = selectedWord === q.correct;

    setConfirmed(true);
    setIsCorrectAnswer(correct);

    if (correct) {
      setCorrectCount((prev) => prev + 1);
      setScore((prev) => prev + 100);
    }

    if (onAnswer && q.targetWord) {
      onAnswer(q.targetWord, correct, 0);
    }

    setTimeout(
      () => {
        if (correct) {
          setPhase("physics");
          initPhysics(q);
        } else {
          advanceQuestion();
        }
      },
      correct ? 800 : 1500,
    );
  };

  const handleItemTap = (index) => {
    if (confirmed) return;
    const now = Date.now();
    // If tapping the already-active item within 400ms → confirm
    if (index === activeOption && now - lastTapRef.current < 400) {
      confirmSelection();
    } else {
      setActiveOption(index);
    }
    lastTapRef.current = now;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const advanceQuestion = () => {
    setConfirmed(false);
    setIsCorrectAnswer(null);
    setActiveOption(0);
    setPhysicsReady(false);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setPhase("grammar");
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    setGameOver(true);
    cleanupPhysics();
    if (onComplete) {
      onComplete({
        gameId: "angryTenses",
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        wrongAnswers: [],
        averageResponseTime: 0,
      });
    }
  };

  const initPhysics = (questionData) => {
    cleanupPhysics();
    setPhysicsReady(false);

    setTimeout(() => {
      const container = canvasContainerRef.current;
      if (!container) return;

      // Clear any leftover DOM sprites
      container.querySelectorAll(".at-sprite").forEach((el) => el.remove());

      const { Engine, Render, Runner, Bodies, Composite, Constraint, Events } =
        Matter;

      const engine = Engine.create();
      engineRef.current = engine;
      const world = engine.world;
      engine.gravity.y = 1;

      const width = container.clientWidth || 800;
      const height = container.clientHeight || 500;

      const render = Render.create({
        element: container,
        engine,
        options: {
          width,
          height,
          wireframes: false,
          background: "transparent",
        },
      });
      renderRef.current = render;

      // Make canvas bodies nearly invisible — we'll overlay DOM sprites
      const groundY = height - 40;
      const ground = Bodies.rectangle(width / 2, groundY + 25, width, 50, {
        isStatic: true,
        render: { fillStyle: "#8B4513" },
      });

      const slingX = width * 0.18;
      const slingY = groundY - 80;
      const birdSize = 45;
      const pigSize = 45;

      // Bird body — extra-large hitbox (60px radius) for very easy grabbing
      let currentBird = Bodies.circle(slingX, slingY, 60, {
        restitution: 0.5,
        density: 0.004,
        label: "bird",
        render: { opacity: 0 },
      });

      const elastic = Constraint.create({
        pointA: { x: slingX, y: slingY },
        bodyB: currentBird,
        stiffness: 0.08,
        damping: 0.01,
        render: { strokeStyle: "#5C2E0A", lineWidth: 6 },
      });

      // Targets (pigs) — invisible in canvas
      const targetX = width * 0.72;
      const opts = questionData.options;
      const targets = opts.map((word, i) => {
        const isCorrectTarget = word === questionData.correct;
        const tx = targetX + (i % 2 === 0 ? -35 : 35);
        const ty = groundY - 40 - Math.floor(i / 2) * 70;
        return Bodies.circle(tx, ty, pigSize / 2, {
          restitution: 0.3,
          density: 0.004,
          friction: 1.0,
          frictionStatic: 0.8,
          label: `pig-${i}`,
          render: { opacity: 0 },
          isTarget: true,
          isCorrectTarget,
          text: word,
        });
      });

      // Wooden planks (static structure that holds pigs)
      const plankStyle = {
        fillStyle: "#D2A679",
        strokeStyle: "#6b3e12",
        lineWidth: 2,
      };
      const floorStyle = {
        fillStyle: "#CD853F",
        strokeStyle: "#6b3e12",
        lineWidth: 2,
      };
      const planks = [
        Bodies.rectangle(targetX - 35, groundY - 20, 12, 60, {
          isStatic: true,
          render: plankStyle,
          label: "plank-0",
        }),
        Bodies.rectangle(targetX + 35, groundY - 20, 12, 60, {
          isStatic: true,
          render: plankStyle,
          label: "plank-1",
        }),
        Bodies.rectangle(targetX, groundY - 55, 90, 10, {
          isStatic: true,
          render: floorStyle,
          label: "floor-0",
        }),
        Bodies.rectangle(targetX - 15, groundY - 90, 12, 50, {
          isStatic: true,
          render: plankStyle,
          label: "plank-2",
        }),
        Bodies.rectangle(targetX + 15, groundY - 90, 12, 50, {
          isStatic: true,
          render: plankStyle,
          label: "plank-3",
        }),
        Bodies.rectangle(targetX, groundY - 120, 80, 10, {
          isStatic: true,
          render: floorStyle,
          label: "floor-1",
        }),
      ];

      Composite.add(world, [
        ground,
        currentBird,
        elastic,
        ...targets,
        ...planks,
      ]);

      // === Create DOM Sprite Overlays ===
      const createSprite = (className, size, extraHTML = "") => {
        const el = document.createElement("div");
        el.className = `at-sprite ${className}`;
        el.style.cssText = `position:absolute;top:0;left:0;width:${size}px;height:${size}px;pointer-events:none;will-change:transform;z-index:15;`;
        if (extraHTML) el.innerHTML = extraHTML;
        container.appendChild(el);
        return el;
      };

      // Bird sprite — with pulsing glow hint
      const birdEl = createSprite("at-bird-sprite at-bird-pulse", birdSize);

      // Pig sprites with word labels
      const pigEls = targets.map((t) => {
        const wordBg = t.isCorrectTarget ? "#defade" : "#fff";
        return {
          el: createSprite(
            "at-pig-sprite",
            pigSize,
            `<div class="at-word-label" style="background:${wordBg}">${t.text}</div>`,
          ),
          body: t,
        };
      });

      // Slingshot post (visual)
      const slingPost = document.createElement("div");
      slingPost.className = "at-sprite at-sling-post";
      slingPost.style.cssText = `position:absolute;left:${slingX - 8}px;top:${slingY - 20}px;width:16px;height:80px;z-index:4;`;
      container.appendChild(slingPost);

      // === Sync DOM positions every frame ===
      // Canvas renders at (width x height) and sits directly in the container,
      // so physics coords map 1:1 to the container's absolute positioning.
      const syncDOM = (body, el, size) => {
        if (!body || !el) return;
        const x = body.position.x - size / 2;
        const y = body.position.y - size / 2;
        const angle = body.angle * (180 / Math.PI);
        el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${angle}deg)`;
      };

      // === Direct DOM-based drag for the bird (bypasses Matter.js mouse issues) ===
      let isDragging = false;

      const getPointerPos = (e) => {
        const rect = container.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
      };

      const onDragStart = (e) => {
        e.preventDefault();
        isDragging = true;
        // Freeze bird so elastic constraint can't interfere during drag
        Matter.Body.setStatic(currentBird, true);
        birdEl.classList.remove("at-bird-pulse");
        birdEl.style.cursor = "grabbing";
      };

      const onDragMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const pos = getPointerPos(e);
        const maxDist = 60;
        const dx = pos.x - slingX;
        const dy = pos.y - slingY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > maxDist) {
          const angle = Math.atan2(dy, dx);
          pos.x = slingX + Math.cos(angle) * maxDist;
          pos.y = slingY + Math.sin(angle) * maxDist;
        }
        Matter.Body.setPosition(currentBird, pos);
      };

      const onDragEnd = (e) => {
        if (!isDragging) return;
        isDragging = false;
        birdEl.style.cursor = "";
        // Un-freeze bird — elastic constraint will now launch it
        Matter.Body.setStatic(currentBird, false);
      };

      // Bird sprite is the drag handle — make it interactive
      birdEl.style.pointerEvents = "auto";
      birdEl.style.cursor = "grab";
      birdEl.addEventListener("mousedown", onDragStart);
      birdEl.addEventListener("touchstart", onDragStart, { passive: false });
      container.addEventListener("mousemove", onDragMove);
      container.addEventListener("touchmove", onDragMove, { passive: false });
      window.addEventListener("mouseup", onDragEnd);
      window.addEventListener("touchend", onDragEnd);
      // Auto-release if pointer leaves the game area
      container.addEventListener("mouseleave", onDragEnd);
      window.addEventListener("touchcancel", onDragEnd);

      let isFired = false;
      let hasHit = false;

      Events.on(engine, "afterUpdate", () => {
        // Sync bird sprite
        syncDOM(currentBird, birdEl, birdSize);

        // Sync pig sprites
        pigEls.forEach(({ el, body }) => {
          if (body.isDestroyed) {
            el.style.display = "none";
          } else {
            syncDOM(body, el, pigSize);
          }
        });

        // Firing detection — bird released from drag and moving fast
        if (!isFired && !isDragging && currentBird.speed > 1.5) {
          Composite.remove(world, elastic);
          isFired = true;
          birdEl.classList.remove("at-bird-pulse");
          birdEl.style.pointerEvents = "none"; // Disable drag after launch

          setTimeout(() => {
            if (!hasHit) {
              cleanupPhysics();
              advanceQuestion();
            }
          }, 4000);
        }
      });

      Events.on(engine, "collisionStart", (event) => {
        if (!isFired || hasHit) return;
        for (const pair of event.pairs) {
          const a = pair.bodyA;
          const b = pair.bodyB;
          const target = a.isTarget ? a : b.isTarget ? b : null;
          if (target && !target.isDestroyed && Math.max(a.speed, b.speed) > 3) {
            target.isDestroyed = true;
            hasHit = true;

            // Show hit effect on the pig sprite
            const pigData = pigEls.find((p) => p.body === target);
            if (pigData) {
              pigData.el.innerHTML = '<div style="font-size:30px">💥</div>';
              pigData.el.style.background = "transparent";
            }

            if (target.isCorrectTarget) {
              setScore((prev) => prev + 1000);
            } else {
              setScore((prev) => prev + 100);
            }

            setTimeout(() => {
              try {
                Composite.remove(world, target);
              } catch (e) {
                /* */
              }
            }, 300);

            setTimeout(() => {
              cleanupPhysics();
              advanceQuestion();
            }, 2000);
            return;
          }
        }
      });

      Render.run(render);
      const runner = Runner.create();
      runnerRef.current = runner;
      Runner.run(runner, engine);
      setPhysicsReady(true);

      let tl = 30;
      setTimeLeft(30);
      timerRef.current = setInterval(() => {
        tl--;
        setTimeLeft(tl);
        if (tl <= 0) {
          clearInterval(timerRef.current);
          cleanupPhysics();
          advanceQuestion();
        }
      }, 1000);
    }, 200);
  };

  if (questions.length === 0) return null;
  const currentQ = questions[currentIndex];

  if (gameOver) {
    return (
      <div className="at-wrapper">
        <div className="at-end-screen">
          <h1 className="at-end-title">🎉 Game Complete!</h1>
          <h2 className="at-end-score">
            Score: <span>{score}</span>
          </h2>
          <p className="at-end-sub">
            {correctCount} / {questions.length} correct
          </p>
          <button className="at-btn-primary" onClick={onHome}>
            <Home size={20} /> Back to Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="at-wrapper">
      {/* Background */}
      <div className="at-sky">
        <div className="at-clouds"></div>
      </div>
      <div className="at-ground"></div>

      {/* HUD */}
      <div className="at-hud">
        <button className="at-hud-btn" onClick={onHome}>
          <Home size={20} />
        </button>
        <div className="at-hud-score">⭐ {score}</div>
        <div className="at-hud-progress">
          {currentIndex + 1}/{questions.length}
        </div>
        {phase === "physics" && (
          <div className="at-hud-timer">⏱️ {timeLeft}s</div>
        )}
      </div>

      {/* ===== GRAMMAR PHASE: Inline Scroll Picker ===== */}
      {phase === "grammar" && (
        <div className="at-grammar-overlay">
          <div className="at-question-box">
            <h2>Complete the sentence to get a bird!</h2>

            <div className="at-sentence-display">
              <span>{currentQ.before}</span>

              <div className="at-scroll-picker">
                <div className="at-scroll-arrow at-arrow-up">▲</div>
                <div className="at-picker-viewport" ref={viewportRef}>
                  <div className="at-picker-track">
                    {currentQ.options.map((opt, i) => {
                      let cls = "at-picker-item";
                      if (i === activeOption) cls += " at-picker-active";
                      if (confirmed && i === activeOption) {
                        cls += isCorrectAnswer
                          ? " at-picker-correct"
                          : " at-picker-wrong";
                      }
                      return (
                        <div
                          key={opt}
                          className={cls}
                          onClick={() => handleItemTap(i)}
                        >
                          {opt}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="at-picker-highlight"></div>
                <div className="at-scroll-arrow at-arrow-down">▼</div>
              </div>

              <span>{currentQ.after}</span>
            </div>

            <div className="at-picker-instructions">
              Scroll or tap a word to select. <br /> <b>Double-Tap</b> the word or press <b>Enter</b> to
              confirm.
            </div>
          </div>
        </div>
      )}

      {/* ===== PHYSICS PHASE ===== */}
      {phase === "physics" && (
        <div className="at-physics-phase">
          <div className="at-sentence-board">
            {currentQ.before}{" "}
            <span className="at-correct-word">{currentQ.correct}</span>{" "}
            {currentQ.after}
          </div>

          <div className="at-physics-canvas" ref={canvasContainerRef}></div>

          {!physicsReady && (
            <div className="at-physics-loading">
              <div className="at-bird-icon"></div>
              <p>Loading physics...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AngryTensesGame;
