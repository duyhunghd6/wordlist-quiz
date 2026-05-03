import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import './MarioTenseRunner.css';

// ═══════════════════════════════════════════════════════════
// TENSE DATA — 12 English Tenses with sentence templates
// ═══════════════════════════════════════════════════════════

const TENSE_WORLDS = [
  {
    id: 'present_simple', name: 'Present Simple', emoji: '🌲', category: 'present',
    templates: [
      { sentence: 'She ___ to school every day.', answer: 'goes', distractors: ['go', 'going'] },
      { sentence: 'They ___ breakfast at 7 AM.', answer: 'eat', distractors: ['eats', 'eating'] },
      { sentence: 'He ___ English very well.', answer: 'speaks', distractors: ['speak', 'speaking'] },
      { sentence: 'The cat ___ on the sofa.', answer: 'sleeps', distractors: ['sleep', 'sleeping'] },
      { sentence: 'We ___ soccer after school.', answer: 'play', distractors: ['plays', 'playing'] },
      { sentence: 'She ___ her teeth every morning.', answer: 'brushes', distractors: ['brush', 'brushing'] },
      { sentence: 'Birds ___ in the sky.', answer: 'fly', distractors: ['flies', 'flying'] },
      { sentence: 'He ___ math homework daily.', answer: 'does', distractors: ['do', 'doing'] },
      { sentence: 'The sun ___ in the east.', answer: 'rises', distractors: ['rise', 'rising'] },
      { sentence: 'I ___ water every morning.', answer: 'drink', distractors: ['drinks', 'drinking'] },
    ]
  },
  {
    id: 'present_continuous', name: 'Present Continuous', emoji: '🏖️', category: 'present',
    templates: [
      { sentence: 'She ___ a book right now.', answer: 'is reading', distractors: ['reads', 'read'] },
      { sentence: 'They ___ in the park now.', answer: 'are playing', distractors: ['plays', 'played'] },
      { sentence: 'He ___ his lunch at the moment.', answer: 'is eating', distractors: ['eats', 'ate'] },
      { sentence: 'We ___ to music right now.', answer: 'are listening', distractors: ['listen', 'listened'] },
      { sentence: 'The dog ___ in the garden now.', answer: 'is running', distractors: ['runs', 'ran'] },
      { sentence: 'I ___ for the test today.', answer: 'am studying', distractors: ['study', 'studied'] },
      { sentence: 'Look! It ___ outside.', answer: 'is raining', distractors: ['rains', 'rained'] },
      { sentence: 'Mom ___ dinner now.', answer: 'is cooking', distractors: ['cooks', 'cooked'] },
      { sentence: 'The children ___ TV now.', answer: 'are watching', distractors: ['watch', 'watched'] },
      { sentence: 'Dad ___ the car right now.', answer: 'is washing', distractors: ['washes', 'washed'] },
    ]
  },
  {
    id: 'past_simple', name: 'Past Simple', emoji: '🏛️', category: 'past',
    templates: [
      { sentence: 'Yesterday, she ___ to school.', answer: 'walked', distractors: ['walks', 'walking'] },
      { sentence: 'He ___ a big fish last week.', answer: 'caught', distractors: ['catches', 'catching'] },
      { sentence: 'They ___ soccer yesterday.', answer: 'played', distractors: ['play', 'playing'] },
      { sentence: 'I ___ a letter last night.', answer: 'wrote', distractors: ['write', 'writing'] },
      { sentence: 'She ___ a cake for the party.', answer: 'baked', distractors: ['bakes', 'baking'] },
      { sentence: 'We ___ to the zoo last Sunday.', answer: 'went', distractors: ['go', 'going'] },
      { sentence: 'He ___ the door behind him.', answer: 'closed', distractors: ['closes', 'closing'] },
      { sentence: 'The bird ___ away quickly.', answer: 'flew', distractors: ['fly', 'flying'] },
      { sentence: 'I ___ my homework after school.', answer: 'finished', distractors: ['finish', 'finishing'] },
      { sentence: 'She ___ a new dress yesterday.', answer: 'bought', distractors: ['buys', 'buying'] },
    ]
  },
  {
    id: 'past_continuous', name: 'Past Continuous', emoji: '🏰', category: 'past',
    templates: [
      { sentence: 'She ___ when I called her.', answer: 'was sleeping', distractors: ['sleeps', 'slept'] },
      { sentence: 'They ___ dinner when it rained.', answer: 'were eating', distractors: ['eat', 'ate'] },
      { sentence: 'He ___ TV at 8 PM last night.', answer: 'was watching', distractors: ['watches', 'watched'] },
      { sentence: 'We ___ when the bell rang.', answer: 'were studying', distractors: ['study', 'studied'] },
      { sentence: 'I ___ to school when I saw him.', answer: 'was walking', distractors: ['walk', 'walked'] },
      { sentence: 'The dog ___ in the yard all day.', answer: 'was playing', distractors: ['plays', 'played'] },
      { sentence: 'She ___ a song at that time.', answer: 'was singing', distractors: ['sings', 'sang'] },
      { sentence: 'They ___ together all morning.', answer: 'were working', distractors: ['work', 'worked'] },
      { sentence: 'It ___ all night yesterday.', answer: 'was raining', distractors: ['rains', 'rained'] },
      { sentence: 'He ___ a picture when Mom came.', answer: 'was drawing', distractors: ['draws', 'drew'] },
    ]
  },
  {
    id: 'future_simple', name: 'Future Simple', emoji: '🚀', category: 'future',
    templates: [
      { sentence: 'Tomorrow, I ___ my friend.', answer: 'will visit', distractors: ['visit', 'visited'] },
      { sentence: 'She ___ a doctor one day.', answer: 'will become', distractors: ['becomes', 'became'] },
      { sentence: 'They ___ the game next week.', answer: 'will play', distractors: ['play', 'played'] },
      { sentence: 'We ___ home after the movie.', answer: 'will go', distractors: ['go', 'went'] },
      { sentence: 'He ___ the book tomorrow.', answer: 'will read', distractors: ['reads', 'read'] },
      { sentence: 'It ___ sunny this weekend.', answer: 'will be', distractors: ['is', 'was'] },
      { sentence: 'I ___ you with your homework.', answer: 'will help', distractors: ['help', 'helped'] },
      { sentence: 'She ___ a cake for us.', answer: 'will bake', distractors: ['bakes', 'baked'] },
      { sentence: 'The train ___ at 9 AM.', answer: 'will arrive', distractors: ['arrives', 'arrived'] },
      { sentence: 'We ___ you next time!', answer: 'will beat', distractors: ['beat', 'beating'] },
    ]
  },
  {
    id: 'future_continuous', name: 'Future Continuous', emoji: '☁️', category: 'future',
    templates: [
      { sentence: 'At 3 PM, I ___ in class.', answer: 'will be sitting', distractors: ['sit', 'sat'] },
      { sentence: 'This time tomorrow, she ___.', answer: 'will be flying', distractors: ['flies', 'flew'] },
      { sentence: 'They ___ all day Saturday.', answer: 'will be studying', distractors: ['study', 'studied'] },
      { sentence: 'He ___ dinner at 7 PM.', answer: 'will be cooking', distractors: ['cooks', 'cooked'] },
      { sentence: 'We ___ when you arrive.', answer: 'will be waiting', distractors: ['wait', 'waited'] },
      { sentence: 'At noon, she ___ lunch.', answer: 'will be eating', distractors: ['eats', 'ate'] },
      { sentence: 'I ___ the house tomorrow.', answer: 'will be cleaning', distractors: ['clean', 'cleaned'] },
      { sentence: 'They ___ at this time next week.', answer: 'will be traveling', distractors: ['travel', 'traveled'] },
      { sentence: 'He ___ homework tonight.', answer: 'will be doing', distractors: ['does', 'did'] },
      { sentence: 'She ___ her friends later.', answer: 'will be meeting', distractors: ['meets', 'met'] },
    ]
  },
  {
    id: 'present_perfect', name: 'Present Perfect', emoji: '💎', category: 'present',
    templates: [
      { sentence: 'I ___ this movie before.', answer: 'have seen', distractors: ['see', 'saw'] },
      { sentence: 'She ___ her homework already.', answer: 'has finished', distractors: ['finish', 'finished'] },
      { sentence: 'They ___ to Paris twice.', answer: 'have been', distractors: ['are', 'were'] },
      { sentence: 'He ___ three books this month.', answer: 'has read', distractors: ['reads', 'read'] },
      { sentence: 'We ___ that song many times.', answer: 'have sung', distractors: ['sing', 'sang'] },
      { sentence: 'She ___ a new phone.', answer: 'has bought', distractors: ['buys', 'bought'] },
      { sentence: 'I ___ my keys. Help me!', answer: 'have lost', distractors: ['lose', 'lost'] },
      { sentence: 'He ___ for two companies.', answer: 'has worked', distractors: ['works', 'worked'] },
      { sentence: 'They ___ arrive yet.', answer: "haven't", distractors: ["didn't", "don't"] },
      { sentence: 'She ___ since morning.', answer: 'has eaten', distractors: ['eats', 'ate'] },
    ]
  },
  {
    id: 'present_perfect_cont', name: 'Present Perfect Continuous', emoji: '🌊', category: 'present',
    templates: [
      { sentence: 'I ___ for 2 hours.', answer: 'have been studying', distractors: ['study', 'studied'] },
      { sentence: 'She ___ all morning.', answer: 'has been cooking', distractors: ['cooks', 'cooked'] },
      { sentence: 'They ___ since 8 AM.', answer: 'have been working', distractors: ['work', 'worked'] },
      { sentence: 'He ___ for an hour.', answer: 'has been running', distractors: ['runs', 'ran'] },
      { sentence: 'It ___ since yesterday.', answer: 'has been raining', distractors: ['rains', 'rained'] },
      { sentence: 'We ___ here for years.', answer: 'have been living', distractors: ['live', 'lived'] },
      { sentence: 'She ___ piano all day.', answer: 'has been playing', distractors: ['plays', 'played'] },
      { sentence: 'I ___ for this test all week.', answer: 'have been preparing', distractors: ['prepare', 'prepared'] },
      { sentence: 'He ___ English for 3 years.', answer: 'has been learning', distractors: ['learns', 'learned'] },
      { sentence: 'They ___ TV for too long.', answer: 'have been watching', distractors: ['watch', 'watched'] },
    ]
  },
  {
    id: 'past_perfect', name: 'Past Perfect', emoji: '⏰', category: 'past',
    templates: [
      { sentence: 'She ___ before he arrived.', answer: 'had left', distractors: ['leaves', 'left'] },
      { sentence: 'They ___ dinner before 7 PM.', answer: 'had eaten', distractors: ['eat', 'ate'] },
      { sentence: 'I ___ the movie before you.', answer: 'had seen', distractors: ['see', 'saw'] },
      { sentence: 'He ___ all his homework first.', answer: 'had finished', distractors: ['finish', 'finished'] },
      { sentence: 'We ___ there many times before.', answer: 'had been', distractors: ['are', 'were'] },
      { sentence: 'She ___ the book before class.', answer: 'had read', distractors: ['reads', 'read'] },
      { sentence: 'They ___ home before it rained.', answer: 'had gone', distractors: ['go', 'went'] },
      { sentence: 'I ___ tired because I ran.', answer: 'had felt', distractors: ['feel', 'felt'] },
      { sentence: 'He ___ the door before leaving.', answer: 'had locked', distractors: ['locks', 'locked'] },
      { sentence: 'We ___ lunch before the trip.', answer: 'had packed', distractors: ['pack', 'packed'] },
    ]
  },
  {
    id: 'past_perfect_cont', name: 'Past Perfect Continuous', emoji: '🌋', category: 'past',
    templates: [
      { sentence: 'I ___ for 2 hours when she called.', answer: 'had been studying', distractors: ['study', 'studied'] },
      { sentence: 'She ___ all day before the party.', answer: 'had been cooking', distractors: ['cooks', 'cooked'] },
      { sentence: 'They ___ since morning.', answer: 'had been working', distractors: ['work', 'worked'] },
      { sentence: 'He ___ for an hour before it stopped.', answer: 'had been running', distractors: ['runs', 'ran'] },
      { sentence: 'We ___ there for years before we left.', answer: 'had been living', distractors: ['live', 'lived'] },
      { sentence: 'It ___ for days before the flood.', answer: 'had been raining', distractors: ['rains', 'rained'] },
      { sentence: 'She ___ piano before dinner.', answer: 'had been playing', distractors: ['plays', 'played'] },
      { sentence: 'I ___ so long I was tired.', answer: 'had been walking', distractors: ['walk', 'walked'] },
      { sentence: 'He ___ English before going abroad.', answer: 'had been learning', distractors: ['learns', 'learned'] },
      { sentence: 'They ___ TV all evening.', answer: 'had been watching', distractors: ['watch', 'watched'] },
    ]
  },
  {
    id: 'future_perfect', name: 'Future Perfect', emoji: '🌈', category: 'future',
    templates: [
      { sentence: 'By tomorrow, I ___ the work.', answer: 'will have finished', distractors: ['finish', 'finished'] },
      { sentence: 'She ___ home by 6 PM.', answer: 'will have arrived', distractors: ['arrives', 'arrived'] },
      { sentence: 'They ___ all the food by then.', answer: 'will have eaten', distractors: ['eat', 'ate'] },
      { sentence: 'He ___ the book by next week.', answer: 'will have read', distractors: ['reads', 'read'] },
      { sentence: 'We ___ 100 words by Friday.', answer: 'will have learned', distractors: ['learn', 'learned'] },
      { sentence: 'She ___ the cake by noon.', answer: 'will have baked', distractors: ['bakes', 'baked'] },
      { sentence: 'I ___ my room before you come.', answer: 'will have cleaned', distractors: ['clean', 'cleaned'] },
      { sentence: 'They ___ the project by Monday.', answer: 'will have completed', distractors: ['complete', 'completed'] },
      { sentence: 'He ___ to 10 countries by 2030.', answer: 'will have traveled', distractors: ['travels', 'traveled'] },
      { sentence: 'We ___ ready by the time you arrive.', answer: 'will have gotten', distractors: ['get', 'got'] },
    ]
  },
  {
    id: 'future_perfect_cont', name: 'Future Perfect Continuous', emoji: '⭐', category: 'future',
    templates: [
      { sentence: 'By 2030, I ___ for 10 years.', answer: 'will have been working', distractors: ['work', 'worked'] },
      { sentence: 'She ___ for 5 hours by then.', answer: 'will have been studying', distractors: ['study', 'studied'] },
      { sentence: 'They ___ here for a decade.', answer: 'will have been living', distractors: ['live', 'lived'] },
      { sentence: 'He ___ for 3 hours by noon.', answer: 'will have been running', distractors: ['run', 'ran'] },
      { sentence: 'We ___ English for 6 years.', answer: 'will have been learning', distractors: ['learn', 'learned'] },
      { sentence: 'She ___ for 2 hours by dinner.', answer: 'will have been cooking', distractors: ['cook', 'cooked'] },
      { sentence: 'I ___ TV for 4 hours by bedtime.', answer: 'will have been watching', distractors: ['watch', 'watched'] },
      { sentence: 'They ___ since morning by then.', answer: 'will have been playing', distractors: ['play', 'played'] },
      { sentence: 'He ___ piano for 8 years next month.', answer: 'will have been playing', distractors: ['plays', 'played'] },
      { sentence: 'We ___ for hours by arrival.', answer: 'will have been driving', distractors: ['drive', 'drove'] },
    ]
  },
];

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Platform layout: 3 platforms at different heights and x offsets
const PLATFORM_CONFIGS = [
  { heightPx: 130, leftPct: '30%' },   // low, leftmost
  { heightPx: 210, leftPct: '48%' },   // mid
  { heightPx: 290, leftPct: '66%' },   // high, rightmost
];

// Pre-placed scenery elements for the scrolling layer (repeats every 50% of width)
const SCENERY_ITEMS = [
  { type: 'bush', left: 60 },
  { type: 'pipe', left: 180 },
  { type: 'qblock', left: 300 },
  { type: 'bush', left: 420 },
  { type: 'pipe short', left: 560 },
  { type: 'bush', left: 700 },
  { type: 'qblock', left: 850 },
  { type: 'pipe', left: 950 },
];

const DARK_WORLDS = ['past_continuous', 'future_simple', 'future_perfect_cont', 'past_perfect'];

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════

const MarioTenseRunner = ({ words, numQuestions = 10, isAllQuestions = false, onAnswer, onComplete, onHome }) => {
  // ─── Game phase: worldSelect → running → questioning → jumping → feedback → (running | worldComplete | gameOver)
  const [phase, setPhase] = useState('worldSelect');
  const [selectedWorld, setSelectedWorld] = useState(null);

  // Question state
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [platforms, setPlatforms] = useState([]); // [{text, height, left, isCorrect}]

  // Score / lives
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [hearts, setHearts] = useState(3);

  // Player animation state
  const [playerState, setPlayerState] = useState('idle');
  const [playerBottom, setPlayerBottom] = useState(85); // px from container bottom
  const [playerLeft, setPlayerLeft] = useState('12%');

  // Feedback
  const [tappedIdx, setTappedIdx] = useState(null); // which platform was tapped
  const [isCorrect, setIsCorrect] = useState(null);
  const [showCoinEffect, setShowCoinEffect] = useState(false);
  const [coinEffectPos, setCoinEffectPos] = useState({ x: 0, y: 0 });
  const [platformAnim, setPlatformAnim] = useState(''); // 'entering' | 'visible' | 'exiting' | ''
  const [showBanner, setShowBanner] = useState(false);

  // Timing
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  // Persistence
  const [worldsCompleted, setWorldsCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mtr_worlds_completed') || '[]'); }
    catch { return []; }
  });

  // Scroll speed class
  const scrollClass = phase === 'running' ? '' :
    phase === 'questioning' ? 'scroll-slow' :
    (phase === 'jumping' || phase === 'feedback') ? 'scroll-paused' :
    'scroll-paused';

  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  // ─── Start a world (or Mix All) ───
  const startWorld = useCallback((world) => {
    let qs;
    if (world.id === 'mix_all') {
      const allQs = TENSE_WORLDS.flatMap(w =>
        w.templates.map(t => ({
          sentence: t.sentence,
          answer: t.answer,
          options: shuffle([t.answer, ...t.distractors]),
          category: w.category,
          tenseName: w.name,
        }))
      );
      const count = isAllQuestions ? allQs.length : Math.min(numQuestions || words?.length || 10, allQs.length);
      qs = shuffle(allQs).slice(0, count);
    } else {
      const numQ = isAllQuestions ? world.templates.length : Math.min(numQuestions || words?.length || 10, world.templates.length);
      const picked = shuffle(world.templates).slice(0, numQ);
      qs = picked.map(t => ({
        sentence: t.sentence,
        answer: t.answer,
        options: shuffle([t.answer, ...t.distractors]),
        category: world.category,
        tenseName: world.name,
      }));
    }
    setQuestions(qs);
    setSelectedWorld(world);
    setCurrentQ(0);
    setScore(0);
    setCoins(0);
    setHearts(3);
    setPlayerState('running');
    setPlayerBottom(85);
    setPlayerLeft('12%');
    setTappedIdx(null);
    setIsCorrect(null);
    setPlatformAnim('');
    setShowBanner(false);
    setPhase('running');
  }, [isAllQuestions, numQuestions, words]);

  // ─── Running phase timer → transition to questioning ───
  useEffect(() => {
    if (phase !== 'running') return;
    const delay = currentQ === 0 ? 2000 : 2500; // first question comes sooner
    const timer = setTimeout(() => {
      if (phaseRef.current !== 'running') return;
      // Build platforms for this question
      const q = questions[currentQ];
      if (!q) return;
      const shuffledHeights = shuffle([...PLATFORM_CONFIGS]);
      const plats = q.options.map((opt, i) => ({
        text: opt,
        heightPx: shuffledHeights[i].heightPx,
        leftPct: shuffledHeights[i].leftPct,
        isCorrect: opt === q.answer,
      }));
      setPlatforms(plats);
      setPlatformAnim('entering');
      setShowBanner(true);
      setQuestionStartTime(Date.now());
      // After platforms slide in, enable tapping
      setTimeout(() => {
        if (phaseRef.current === 'running') {
          setPlatformAnim('visible');
          setPhase('questioning');
        }
      }, 550);
    }, delay);
    return () => clearTimeout(timer);
  }, [phase, currentQ, questions]);

  // ─── Handle platform tap ───
  const handlePlatformTap = useCallback((platform, idx) => {
    if (phase !== 'questioning') return;
    const responseTime = Date.now() - questionStartTime;
    const correct = platform.isCorrect;

    setTappedIdx(idx);
    setIsCorrect(correct);
    setPhase('jumping');

    // Jump player to the tapped platform
    setPlayerState('jumping');
    setPlayerBottom(platform.heightPx);
    setPlayerLeft(platform.leftPct);

    // Haptic feedback
    if (window.navigator?.vibrate) {
      window.navigator.vibrate(correct ? [40, 30, 40] : [200]);
    }

    // Report to learning algorithm
    if (onAnswer && words?.length > 0) {
      const wordIndex = currentQ % words.length;
      onAnswer(words[wordIndex]?.word || `tense_q${currentQ}`, correct, responseTime);
    }

    // After jump lands → show feedback
    setTimeout(() => {
      if (correct) {
        setPlayerState('celebrating');
        setScore(prev => prev + 1);
        setCoins(prev => prev + 1);
        setShowCoinEffect(true);
        setCoinEffectPos({
          x: parseInt(platform.leftPct) + '%',
          y: platform.heightPx,
        });
        setTimeout(() => setShowCoinEffect(false), 700);
      } else {
        setPlayerState('falling');
        setPlayerBottom(85);
      }
      setPhase('feedback');

      // After feedback → advance
      const nextDelay = correct ? 1200 : 1600;
      const newHearts = correct ? hearts : hearts - 1;
      if (!correct) setHearts(newHearts);

      setTimeout(() => {
        // Slide platforms out
        setPlatformAnim('exiting');
        setShowBanner(false);

        setTimeout(() => {
          // Reset player to ground
          setPlayerState('recovering');
          setPlayerBottom(85);
          setPlayerLeft('12%');

          setTimeout(() => {
            setPlatformAnim('');
            setTappedIdx(null);
            setIsCorrect(null);

            if (newHearts <= 0) {
              setPhase('gameOver');
              setPlayerState('idle');
              return;
            }
            if (currentQ + 1 >= questions.length) {
              // World complete!
              const wid = selectedWorld.id;
              setWorldsCompleted(prev => {
                const upd = prev.includes(wid) ? prev : [...prev, wid];
                localStorage.setItem('mtr_worlds_completed', JSON.stringify(upd));
                return upd;
              });
              setPhase('worldComplete');
              setPlayerState('idle');
              return;
            }
            // Continue running
            setCurrentQ(prev => prev + 1);
            setPlayerState('running');
            setPhase('running');
          }, 350);
        }, 400);
      }, nextDelay);
    }, 500); // jump duration
  }, [phase, questionStartTime, hearts, currentQ, questions, words, onAnswer, selectedWorld]);

  // ─── Finish game (go to results) ───
  const handleFinish = useCallback(() => {
    if (onComplete) {
      onComplete({
        gameId: 'marioTense',
        totalQuestions: questions.length,
        correctAnswers: score,
        wrongAnswers: [],
        averageResponseTime: 3000,
      });
    }
  }, [onComplete, questions.length, score]);

  // ═══════════════════════════════════════════════════════════
  // RENDER HELPERS
  // ═══════════════════════════════════════════════════════════

  const renderClouds = () => (
    <div className="mtr-cloud-layer">
      <span className="mtr-cl-cloud" style={{ top: '8%', left: '5%' }}>☁️</span>
      <span className="mtr-cl-cloud" style={{ top: '15%', left: '25%', fontSize: '3rem' }}>☁️</span>
      <span className="mtr-cl-cloud" style={{ top: '5%', left: '45%', fontSize: '2rem', opacity: 0.5 }}>☁️</span>
      <span className="mtr-cl-cloud" style={{ top: '20%', left: '65%' }}>☁️</span>
      <span className="mtr-cl-cloud" style={{ top: '10%', left: '85%', fontSize: '3.5rem', opacity: 0.6 }}>☁️</span>
      {/* Duplicate at offset for seamless scroll */}
      <span className="mtr-cl-cloud" style={{ top: '12%', left: '110%', fontSize: '2.8rem' }}>☁️</span>
      <span className="mtr-cl-cloud" style={{ top: '6%', left: '135%' }}>☁️</span>
      <span className="mtr-cl-cloud" style={{ top: '18%', left: '160%', fontSize: '2rem' }}>☁️</span>
    </div>
  );

  const renderScenery = () => (
    <div className="mtr-scenery-layer">
      {SCENERY_ITEMS.map((item, i) => {
        const classes = item.type.split(' ').map(t => `mtr-${t}`).join(' ');
        return <div key={i} className={classes} style={{ left: `${item.left}px` }} />;
      })}
      {/* Duplicate for second half (seamless loop) */}
      {SCENERY_ITEMS.map((item, i) => {
        const classes = item.type.split(' ').map(t => `mtr-${t}`).join(' ');
        const halfWidth = typeof window !== 'undefined' ? window.innerWidth : 500;
        return <div key={`d${i}`} className={classes} style={{ left: `${item.left + halfWidth}px` }} />;
      })}
    </div>
  );

  const renderStars = () => (
    <div className="mtr-stars-bg">
      {Array.from({ length: 25 }).map((_, i) => (
        <div
          key={i}
          className="mtr-star-dot"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 55}%`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );

  // ═══════════════════════════════════════════════════════════
  // RENDER: WORLD SELECTOR
  // ═══════════════════════════════════════════════════════════

  if (phase === 'worldSelect') {
    const bgColors = {
      present: 'linear-gradient(135deg, #22c55e, #16a34a)',
      past: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      future: 'linear-gradient(135deg, #f59e0b, #d97706)',
    };
    return (
      <div className="mtr-game">
        <div className="mtr-world-select">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', maxWidth: '400px', marginBottom: '10px' }}>
            <button className="mtr-back-btn" onClick={onHome} aria-label="Go back">
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="mtr-ws-title">🏃 Tense Runner</h1>
              <p className="mtr-ws-sub">Choose a world to practice!</p>
            </div>
          </div>
          <div className="mtr-ws-grid">
            {/* Mix All — special card spanning full row */}
            <button
              className="mtr-ws-card"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #ec4899, #8b5cf6, #3b82f6, #22c55e)',
                gridColumn: '1 / -1',
                aspectRatio: 'auto',
                padding: '14px',
                flexDirection: 'row',
                gap: '10px',
              }}
              onClick={() => startWorld({ id: 'mix_all', name: 'Mix All Tenses', emoji: '🔥', category: 'present', templates: [] })}
            >
              <span style={{ fontSize: '1.8rem' }}>🔥</span>
              <div style={{ textAlign: 'left' }}>
                <span className="ws-num" style={{ fontSize: '1.1rem' }}>Mix All Tenses!</span>
                <span className="ws-label" style={{ fontSize: '0.65rem', opacity: 0.85 }}>12 random questions from all tenses</span>
              </div>
            </button>
            {TENSE_WORLDS.map((world, i) => {
              const done = worldsCompleted.includes(world.id);
              return (
                <button key={world.id} className="mtr-ws-card" style={{ background: bgColors[world.category] }} onClick={() => startWorld(world)}>
                  <span className="ws-emoji">{world.emoji}</span>
                  <span className="ws-num">{i + 1}</span>
                  <span className="ws-label">{world.name}</span>
                  {done && <span className="ws-star">⭐</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER: GAME OVER
  // ═══════════════════════════════════════════════════════════

  if (phase === 'gameOver') {
    return (
      <div className={`mtr-game world-${selectedWorld?.id}`}>
        <div className="mtr-overlay">
          <div className="mtr-overlay-icon">💔</div>
          <h2>Game Over!</h2>
          <p>Score: {score}/{questions.length}<br/>🪙 {coins} coins earned</p>
          <div className="mtr-overlay-actions">
            <button className="mtr-o-btn primary" onClick={() => startWorld(selectedWorld)}>Try Again</button>
            <button className="mtr-o-btn secondary" onClick={() => setPhase('worldSelect')}>World Map</button>
            <button className="mtr-o-btn secondary" onClick={onHome}>Home</button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER: WORLD COMPLETE
  // ═══════════════════════════════════════════════════════════

  if (phase === 'worldComplete') {
    const pct = Math.round((score / questions.length) * 100);
    const starCount = pct >= 90 ? 3 : pct >= 70 ? 2 : 1;
    return (
      <div className={`mtr-game world-${selectedWorld?.id}`}>
        <div className="mtr-overlay">
          <div className="mtr-overlay-icon">{'⭐'.repeat(starCount)}</div>
          <h2>World Complete!</h2>
          <p>{selectedWorld?.name}<br/>Score: {score}/{questions.length} ({pct}%)<br/>🪙 {coins} coins</p>
          <div className="mtr-overlay-actions">
            <button className="mtr-o-btn primary" onClick={() => setPhase('worldSelect')}>Next World</button>
            <button className="mtr-o-btn secondary" onClick={() => startWorld(selectedWorld)}>Replay</button>
            <button className="mtr-o-btn secondary" onClick={handleFinish}>Finish</button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER: PLAYING (running / questioning / jumping / feedback)
  // ═══════════════════════════════════════════════════════════

  const q = questions[currentQ];
  const isDark = DARK_WORLDS.includes(selectedWorld?.id);
  const parts = q?.sentence?.split(/_{3,}/) || ['', ''];

  return (
    <div className={`mtr-game world-${selectedWorld?.id} ${scrollClass}`}>
      {/* Stars for dark worlds */}
      {isDark && renderStars()}

      {/* Parallax clouds */}
      {!isDark && renderClouds()}

      {/* Hills */}
      <div className="mtr-hills-layer" />

      {/* Ground-level scenery (pipes, bushes, blocks) */}
      {renderScenery()}

      {/* Ground bricks */}
      <div className="mtr-ground-layer">
        <div className="mtr-ground-stone" />
        <div className="mtr-ground-dirt" />
      </div>

      {/* Player character — CSS-drawn Mario-style */}
      <div
        className={`mtr-runner state-${playerState}`}
        style={{ bottom: `${playerBottom}px`, left: playerLeft }}
      >
        <div className="mtr-character">
          <div className="mtr-char-cap" />
          <div className="mtr-char-head" />
          <div className="mtr-char-body" />
          <div className="mtr-char-arm-l" />
          <div className="mtr-char-arm-r" />
          <div className="mtr-char-leg-l" />
          <div className="mtr-char-leg-r" />
        </div>
      </div>

      {/* Answer platforms */}
      {platformAnim && (
        <div className={`mtr-platforms-container ${platformAnim}`}>
          {platforms.map((p, i) => {
            let extraClass = `cat-${q?.category || 'present'}`;
            if (tappedIdx !== null) {
              if (i === tappedIdx && !isCorrect) extraClass += ' wrong-platform';
              else if (p.isCorrect && tappedIdx !== null) extraClass += ' correct-platform';
              else if (tappedIdx !== null) extraClass += ' dimmed';
            }
            return (
              <button
                key={i}
                className={`mtr-platform ${extraClass}`}
                style={{ bottom: `${p.heightPx}px`, left: p.leftPct }}
                onClick={() => handlePlatformTap(p, i)}
                disabled={phase !== 'questioning'}
              >
                {p.text}
              </button>
            );
          })}
        </div>
      )}

      {/* Question banner */}
      {showBanner && q && (
        <div className="mtr-q-banner">
          <p className="mtr-q-sentence">
            {parts[0]}<span className="mtr-blank">{tappedIdx !== null ? platforms[tappedIdx]?.text : '???'}</span>{parts[1]}
          </p>
          <span className="mtr-tense-tag">{q.tenseName}</span>
        </div>
      )}

      {/* Coin burst */}
      {showCoinEffect && (
        <div className="mtr-coin-burst" style={{ left: coinEffectPos.x, bottom: `${coinEffectPos.y + 30}px` }}>
          {[0,1,2,3,4].map(i => <div key={i} className="mtr-coin-p">🪙</div>)}
        </div>
      )}
      {showCoinEffect && (
        <div className="mtr-plus-one" style={{ left: coinEffectPos.x, bottom: `${coinEffectPos.y + 60}px` }}>+1</div>
      )}

      {/* HUD */}
      <div className="mtr-hud">
        <div className="mtr-hud-left">
          <button className="mtr-back-btn" onClick={() => { setPhase('worldSelect'); setPlayerState('idle'); }} aria-label="Back">
            <ArrowLeft size={15} />
          </button>
          <div className="mtr-coins-display">🪙 {coins}</div>
          <div className="mtr-hearts-display">
            {[0,1,2].map(i => (
              <span key={i} className={`mtr-heart ${i >= hearts ? 'lost' : ''}`}>❤️</span>
            ))}
          </div>
        </div>
        <div className="mtr-hud-right">
          <div className="mtr-level-pill">{selectedWorld?.name}</div>
          <div className="mtr-progress-text">{currentQ + 1}/{questions.length}</div>
        </div>
      </div>
    </div>
  );
};

export default MarioTenseRunner;
