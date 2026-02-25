let physicsEngine = null;
let physicsRender = null;
let physicsRunner = null;
let gameTimerInterval = null;
let reloadTimeout = null;

function initAngryPhysics() {
  // Clean up previous instance if restarting
  cleanUpPhysics();

  const container = document.getElementById('physics-container');
  if(!container) return; // not on this page

  const canvas = document.createElement('canvas');
  canvas.id = 'physics-canvas';
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '10';
  container.appendChild(canvas);

  const Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Events = Matter.Events,
        Constraint = Matter.Constraint,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        Bodies = Matter.Bodies,
        Composite = Matter.Composite;

  physicsEngine = Engine.create();
  const world = physicsEngine.world;
  physicsEngine.gravity.y = 1;

  const width = 1000;
  const height = 600;

  physicsRender = Render.create({
    canvas: canvas,
    engine: physicsEngine,
    options: { width, height, wireframes: false, background: 'transparent' }
  });

  // --- Create Bodies ---

  const groundY = height - 105;
  const ground = Bodies.rectangle(width/2, groundY + 50, width, 100, { isStatic: true, label: 'ground', friction: 1 });

  // Sling configuration
  const slingX = 175;
  const slingY = height - 200; 
  const birdRadius = 22.5; 

  let birdsRemaining = 2; // q1 and q2
  let currentBird = Bodies.circle(slingX-15, slingY+10, birdRadius, {
    restitution: 0.5, density: 0.005, frictionAir: 0.01, label: 'bird'
  });

  // Elastic bands
  let elastic1 = Constraint.create({
    pointA: { x: slingX - 10, y: slingY }, bodyB: currentBird, stiffness: 0.02, damping: 0.1,
    render: { strokeStyle: '#301A0F', lineWidth: 8 }
  });
  let elastic2 = Constraint.create({
    pointA: { x: slingX + 10, y: slingY }, bodyB: currentBird, stiffness: 0.02, damping: 0.1,
    render: { strokeStyle: '#301A0F', lineWidth: 8 }
  });
  let currentElastics = [elastic1, elastic2];

  // Structure (House of Cards) with 4 Targets
  const tx = 700;
  const baseH = groundY;
  
  // Planks
  const p1 = Bodies.rectangle(tx - 60, baseH - 45, 15, 90, { label: 'plank-1', restitution: 0.2, density: 0.002, friction: 0.5 });
  const p2 = Bodies.rectangle(tx, baseH - 45, 15, 90, { label: 'plank-2', restitution: 0.2, density: 0.002, friction: 0.5 });
  const p3 = Bodies.rectangle(tx + 60, baseH - 45, 15, 90, { label: 'plank-3', restitution: 0.2, density: 0.002, friction: 0.5 });
  
  // Floors
  const f1 = Bodies.rectangle(tx - 30, baseH - 97, 80, 15, { label: 'floor-1', restitution: 0.2, density: 0.002, friction: 0.5 });
  const f2 = Bodies.rectangle(tx + 30, baseH - 97, 80, 15, { label: 'floor-2', restitution: 0.2, density: 0.002, friction: 0.5 });

  // Top floor
  const p4 = Bodies.rectangle(tx - 30, baseH - 150, 15, 90, { label: 'plank-4', restitution: 0.2, density: 0.002, friction: 0.5 });
  const p5 = Bodies.rectangle(tx + 30, baseH - 150, 15, 90, { label: 'plank-5', restitution: 0.2, density: 0.002, friction: 0.5 });
  const f3 = Bodies.rectangle(tx, baseH - 202, 120, 15, { label: 'floor-3', restitution: 0.2, density: 0.002, friction: 0.5 });

  const pigOpts = { restitution: 0.4, density: 0.001, friction: 0.5, isPig: true };
  
  // 4 Targets
  const pig1 = Bodies.circle(tx - 30, baseH - 30, 22.5, { ...pigOpts, label: 'pig-1', isCorrect: false, text: 'go' });
  const pig2 = Bodies.circle(tx + 30, baseH - 30, 22.5, { ...pigOpts, label: 'pig-2', isCorrect: true, text: 'went' });
  const pig3 = Bodies.circle(tx, baseH - 135, 22.5, { ...pigOpts, label: 'pig-3', isCorrect: false, text: 'gone' });
  const pig4 = Bodies.circle(tx, baseH - 240, 22.5, { ...pigOpts, label: 'pig-4', isCorrect: false, text: 'going' });

  Composite.add(world, [
    ground, currentBird, elastic1, elastic2, 
    p1, p2, p3, f1, f2, p4, p5, f3, 
    pig1, pig2, pig3, pig4
  ]);

  const mouse = Mouse.create(physicsRender.canvas);
  const mouseConstraint = MouseConstraint.create(physicsEngine, { mouse: mouse, constraint: { stiffness: 0.2, render: { visible: false } } });

  physicsRender.canvas.addEventListener('touchmove', (e) => e.preventDefault(), {passive:false});
  mouseConstraint.collisionFilter.mask = currentBird.collisionFilter.category;
  Composite.add(world, mouseConstraint);
  physicsRender.mouse = mouse;

  // --- Quiz Phase Logic (Scroll Picker) ---
  const overlay = document.getElementById('screen-grammar');
  const physContainer = document.getElementById('screen-physics');
  const activeSentence = document.getElementById('angry-sentence');
  let quizAnswered = false;

  const viewport = document.getElementById('picker-viewport');
  const track = document.getElementById('picker-track');
  const items = document.querySelectorAll('.picker-item');
  if(!viewport || !track) return;
  
  let isDragging = false;
  let startY;
  let scrollTop;
  let selectedVal = null;
  let selectedIsCorrect = false;
  let lastTap = 0;

  // Handle Dragging
  viewport.addEventListener('mousedown', (e) => {
    isDragging = true;
    startY = e.pageY - viewport.offsetTop;
    scrollTop = viewport.scrollTop;
  });
  viewport.addEventListener('mouseleave', () => { isDragging = false; updateActiveItem(); });
  viewport.addEventListener('mouseup', () => { isDragging = false; updateActiveItem(); });
  viewport.addEventListener('mousemove', (e) => {
    if(!isDragging) return;
    e.preventDefault();
    const y = e.pageY - viewport.offsetTop;
    const walk = (y - startY) * 2; // scroll speed multiplier
    viewport.scrollTop = scrollTop - walk;
  });

  // Touch Support
  viewport.addEventListener('touchstart', (e) => {
    isDragging = true;
    startY = e.touches[0].pageY - viewport.offsetTop;
    scrollTop = viewport.scrollTop;
  }, {passive:true});
  viewport.addEventListener('touchend', () => { isDragging = false; updateActiveItem(); });
  viewport.addEventListener('touchmove', (e) => {
    if(!isDragging) return;
    const y = e.touches[0].pageY - viewport.offsetTop;
    const walk = (y - startY) * 2;
    viewport.scrollTop = scrollTop - walk;
  });
  
  // Snap update on normal scroll
  viewport.addEventListener('scroll', () => {
    if(!isDragging) updateActiveItem();
  });

  function updateActiveItem() {
      // Find the item closest to the center of the viewport
      const viewportCenter = viewport.scrollTop + (viewport.clientHeight / 2);
      let closestItem = items[0];
      let minDistance = Infinity;

      items.forEach(item => {
          const itemCenter = item.offsetTop + (item.clientHeight / 2);
          const distance = Math.abs(viewportCenter - itemCenter);
          if (distance < minDistance) {
              minDistance = distance;
              closestItem = item;
          }
      });

      items.forEach(i => i.classList.remove('active'));
      closestItem.classList.add('active');
      selectedVal = closestItem.getAttribute('data-val');
      selectedIsCorrect = closestItem.getAttribute('data-correct') === 'true';
  }

  // Double Tap or Enter submission
  function confirmSelection() {
      if (quizAnswered || !selectedVal) return;
      
      const activeEl = document.querySelector('.picker-item.active');
      
      if (selectedIsCorrect) {
          quizAnswered = true;
          if(activeEl) {
              activeEl.style.color = '#4CD964';
              activeEl.style.transform = 'scale(1.2)';
          }
          
          // Hide overlay, enable physics
          setTimeout(() => {
              if(overlay) overlay.style.opacity = '0';
              setTimeout(() => {
                  if(overlay) overlay.style.display = 'none';
              }, 300);

              if(physContainer) {
                  physContainer.style.opacity = '1';
                  physContainer.style.pointerEvents = 'auto';
              }
              if(activeSentence) activeSentence.style.display = 'block';
              
              startTimer();
          }, 600);
      } else {
          if(activeEl) {
              activeEl.style.color = '#FF3B30';
              activeEl.style.transform = 'translate(-10px, 0)';
              setTimeout(() => activeEl.style.transform = 'translate(10px, 0)', 100);
              setTimeout(() => activeEl.style.transform = 'translate(-10px, 0)', 200);
              setTimeout(() => {
                  activeEl.style.transform = 'translate(0, 0)';
                  activeEl.style.color = '#D35400';
              }, 300);
          }
      }
  }

  // Bind double tap to the track
  track.addEventListener('click', function(e) {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      if (tapLength < 500 && tapLength > 0) {
          confirmSelection();
          e.preventDefault();
      }
      lastTap = currentTime;
  });

  // Keyboard Handler (Enter & Arrows)
  const keyHandler = (e) => {
      if (overlay && overlay.style.display !== 'none') {
          if (e.key === 'Enter') {
              e.preventDefault();
              confirmSelection();
          } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              viewport.scrollBy({ top: -60, behavior: 'smooth' });
          } else if (e.key === 'ArrowDown') {
              e.preventDefault();
              viewport.scrollBy({ top: 60, behavior: 'smooth' });
          }
      }
  };
  document.addEventListener('keydown', keyHandler);
  
  // Clean up handler eventually
  const oldCleanup = window.cleanUpPhysics;
  window.cleanUpPhysics = function() {
      document.removeEventListener('keydown', keyHandler);
      if (oldCleanup) oldCleanup();
  };

  // init state
  setTimeout(updateActiveItem, 100);

  // Timer & Scoring Logic
  let timeLeft = 30;
  let currentScore = 0;
  const timerBar = document.getElementById('timer-bar');
  const timerText = document.getElementById('timer-text');
  
  if (timerBar && timerText) {
      timerBar.style.width = '100%';
      timerBar.style.background = '#4CD964';
      timerText.innerText = '30s';
  }

  function addScore(points) {
      currentScore += points;
      document.getElementById('score').innerText = currentScore;
  }

  function playSfx(type) {
      // Placeholder for future audio hook
      // console.log("Playing sfx:", type);
  }

  function endGame(isWin) {
      clearInterval(gameTimerInterval);
      clearTimeout(reloadTimeout);
      const physContainer = document.getElementById('screen-physics');
      if(physContainer) physContainer.style.pointerEvents = 'none';

      setTimeout(() => {
          const endOverlay = document.getElementById('screen-end');
          if (endOverlay) {
             endOverlay.style.display = 'flex';
             document.getElementById('end-title').innerText = isWin ? 'Level Complete!' : 'Game Over!';
             document.getElementById('end-title').style.color = isWin ? '#4CD964' : '#FF3B30';
             document.getElementById('end-score').innerHTML = 'Final Score: <span style="color:#4CD964">' + currentScore + '</span>';
          }
      }, 1500); // Wait for things to settle
  }

  function startTimer() {
    if(timerBar && timerText) {
      gameTimerInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft >= 0) {
          timerBar.style.width = (timeLeft / 30 * 100) + '%';
          timerText.innerText = timeLeft + 's';
          if (timeLeft <= 10) timerBar.style.background = '#FF3B30';
        } else {
          clearInterval(gameTimerInterval);
          document.getElementById('angry-sentence').innerHTML = 'Time is up! The correct answer was <span style="color:#5E9B30">went</span>.';
          const physContainer = document.getElementById('screen-physics');
          if(physContainer) physContainer.style.pointerEvents = 'none';
          endGame(false);
        }
      }, 1000);
    }
  }

  // Restore DOM elements if they were hidden in previous playthroughs
  ['bird', 'bird-q1', 'bird-q2'].forEach(id => {
      const el = document.getElementById(id);
      if(el) { el.style.opacity = '1'; el.style.transition = 'none'; el.style.zIndex = '4'; }
  });

  // Reset overlay
  if(overlay) {
      overlay.style.display = 'flex';
      overlay.style.opacity = '1';
  }
  const endOverlay = document.getElementById('screen-end');
  if(endOverlay) endOverlay.style.display = 'none';
  document.getElementById('score').innerText = '0';
  document.getElementById('angry-sentence').innerHTML = 'I <span class="angry-blank">_______</span> to the park yesterday.';

  if(physContainer) {
      physContainer.style.opacity = '0';
      physContainer.style.pointerEvents = 'none';
  }

  // --- Reloading Logic ---
  let isFired = false;
  let hasScored = false;

  function loadNextBird() {
      if (birdsRemaining <= 0 || hasScored) return;

      // Make old bird static or remove it to save calculation
      Composite.remove(world, currentBird);
      const oldBirdEl = document.getElementById(currentBird.label);
      if (oldBirdEl) {
          oldBirdEl.style.transition = 'opacity 0.5s';
          oldBirdEl.style.opacity = '0'; 
      }

      // Next bird config
      const qLabel = birdsRemaining === 2 ? 'bird-q1' : 'bird-q2';
      birdsRemaining--;
      
      currentBird = Bodies.circle(slingX-15, slingY+10, birdRadius, {
        restitution: 0.5, density: 0.005, frictionAir: 0.01, label: qLabel
      });

      elastic1 = Constraint.create({
        pointA: { x: slingX - 10, y: slingY }, bodyB: currentBird, stiffness: 0.02, damping: 0.1, render: { strokeStyle: '#301A0F', lineWidth: 8 }
      });
      elastic2 = Constraint.create({
        pointA: { x: slingX + 10, y: slingY }, bodyB: currentBird, stiffness: 0.02, damping: 0.1, render: { strokeStyle: '#301A0F', lineWidth: 8 }
      });
      currentElastics = [elastic1, elastic2];

      Composite.add(world, [currentBird, elastic1, elastic2]);
      mouseConstraint.collisionFilter.mask = currentBird.collisionFilter.category;
      
      const qEl = document.getElementById(qLabel);
      if(qEl) qEl.style.zIndex = '5'; // Bring active bird forward
      
      isFired = false;
  }

  // --- Slingshot constraints ---
  Events.on(physicsEngine, 'beforeUpdate', function() {
      if (!isFired && quizAnswered && mouseConstraint.body === currentBird) {
          const maxDist = 120;
          const dx = currentBird.position.x - slingX;
          const dy = currentBird.position.y - slingY;
          const dist = Math.sqrt(dx*dx + dy*dy);
          
          // Strict circular constraint
          if (dist > maxDist) {
              const angle = Math.atan2(dy, dx);
              Matter.Body.setPosition(currentBird, {
                  x: slingX + Math.cos(angle) * maxDist,
                  y: slingY + Math.sin(angle) * maxDist
              });
          }
      }
  });

  // --- Firing Event ---
  Events.on(physicsEngine, 'afterUpdate', function() {
    if (!isFired && quizAnswered) { // Only allow firing if quiz is answered
      if (mouseConstraint.mouse.button === -1 && currentBird.position.x > slingX && currentBird.speed > 5) {
        // Fire! Remove the elastic bands completely so Render doesnt draw empty lines
        Composite.remove(world, currentElastics);
        isFired = true;
        mouseConstraint.collisionFilter.mask = 0;
        
        // Reload after 3.5 seconds
        clearTimeout(reloadTimeout);
        reloadTimeout = setTimeout(() => {
            if (birdsRemaining > 0 && !hasScored) {
                loadNextBird();
            } else if (!hasScored) {
                endGame(false);
            }
        }, 3500);
      }
    }

    syncDOM(currentBird, 45, 45);
    // Synching all 4 pigs and 8 wood structures
    [pig1, pig2, pig3, pig4].forEach(p => syncDOM(p, 45, 45));
    [p1, p2, p3, p4, p5].forEach(p => syncDOM(p, 15, 90));
    [f1, f2].forEach(p => syncDOM(p, 80, 15));
    syncDOM(f3, 120, 15);
  });

  // Collision Logic
  Events.on(physicsEngine, 'collisionStart', function(event) {
    if (!isFired || !quizAnswered) return; // Prevent early collisions if any
    const pairs = event.pairs;
    
    for (let i = 0; i < pairs.length; i++) {
        const bodyA = pairs[i].bodyA;
        const bodyB = pairs[i].bodyB;
        
        // Destructible check: high impact velocity
        const maxSpeed = Math.max(bodyA.speed, bodyB.speed);
        if (maxSpeed > 4) {
            handleHit(bodyA);
            handleHit(bodyB);
        }
    }
  });

  function handleHit(body) {
      if (body.isDestroyed || body.label === 'bird' || body.label.startsWith('bird-q')) return;
      
      const el = document.getElementById(body.label);
      if (!el) return;

      if (body.isPig) {
          body.isDestroyed = true;
          el.innerHTML = '<div style="font-size:30px">💥</div>';
          el.style.background = 'transparent';
          el.style.border = 'none';
          el.style.boxShadow = 'none';
          el.classList.add('poof-anim');
          playSfx('pig-pop');

          if (body.isCorrect) {
              if(!hasScored) {
                 hasScored = true;
                 addScore(1000);
                 document.getElementById('angry-sentence').innerHTML = `I <span style="color:#5E9B30; font-weight:800; text-transform:uppercase;">${body.text}</span> to the park yesterday.`;
                 
                 // Show bonus text
                 const bonus = document.createElement('div');
                 bonus.innerText = '+1000 BONUS TARGET';
                 bonus.style.position = 'absolute';
                 bonus.style.top = '100px';
                 bonus.style.left = '50%';
                 bonus.style.transform = 'translateX(-50%)';
                 bonus.style.color = '#F1C40F';
                 bonus.style.fontSize = '2rem';
                 bonus.style.fontWeight = 'bold';
                 bonus.style.textShadow = '2px 2px 0 #000';
                 bonus.style.zIndex = '50';
                 bonus.style.animation = 'popIn 0.5s ease-out';
                 document.getElementById('angry-game').appendChild(bonus);
                 
                 endGame(true);
              }
          } else {
              addScore(100);
              if(!hasScored) {
                 document.getElementById('angry-sentence').innerHTML = `I <span style="color:#D35400; text-decoration:line-through;">${body.text}</span> to the park yesterday. <span style="color:#FF3B30">WRONG TARGET!</span>`;
                 const lives = document.querySelector('.angry-lives');
                 if(lives) {
                    const text = lives.innerHTML;
                    if(text.includes('❤️❤️❤️')) lives.innerHTML = '❤️❤️<span style="filter: grayscale(1)">❤️</span>';
                    else if(text.includes('❤️❤️')) lives.innerHTML = '❤️<span style="filter: grayscale(1)">❤️❤️</span>';
                    else lives.innerHTML = '<span style="filter: grayscale(1)">❤️❤️❤️</span>';
                 }
                 
                 if (birdsRemaining > 0) {
                     hasScored = false; 
                     clearTimeout(reloadTimeout);
                     reloadTimeout = setTimeout(() => {
                        loadNextBird();
                     }, 2000);
                 } else {
                     endGame(false);
                 }
              }
          }
          setTimeout(() => Composite.remove(world, body), 400);

      } else if (body.label.startsWith('plank') || body.label.startsWith('floor')) {
          body.isDestroyed = true;
          el.classList.add('poof-anim');
          playSfx('wood-break');
          addScore(50);
          setTimeout(() => Composite.remove(world, body), 300);
      }
  }

  function syncDOM(body, w, h) {
    const el = document.getElementById(body.label);
    if (el) {
      el.style.setProperty('--w', w + 'px');
      el.style.setProperty('--h', h + 'px');
      el.style.width = w + 'px';
      el.style.height = h + 'px';
      el.style.transform = `translate3d(${body.position.x}px, ${body.position.y}px, 0) rotate(${body.angle}rad)`;
    }
  }

  Render.run(physicsRender);
  physicsRunner = Runner.create();
  Runner.run(physicsRunner, physicsEngine);
  
  Composite.allBodies(world).forEach(b => { b.render.visible = false; });
}

window.initAngryPhysics = initAngryPhysics;

window.cleanUpPhysics = function() {
    if (physicsEngine) {
        clearInterval(gameTimerInterval);
        clearTimeout(reloadTimeout);
        Matter.Render.stop(physicsRender);
        Matter.Runner.stop(physicsRunner);
        Matter.World.clear(physicsEngine.world);
        Matter.Engine.clear(physicsEngine);
        if(physicsRender && physicsRender.canvas) {
            physicsRender.canvas.remove();
        }
        physicsEngine = null;
    }
};
