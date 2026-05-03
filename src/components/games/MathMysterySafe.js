import React, { useState } from 'react';
import '../GameUI.css'; // Optional generic styles

const M2_MYSTERY_SAFE_MODULE = {
  "module_id": "M2",
  "title": "The Mystery Safe",
  "concept": "Number Logic & Place Value",
  "levels": [
    {
      "level_id": "M2_L1",
      "type": "logic_puzzle",
      "instruction": "Level 1: Crack the safe based on Mr. Edward's clues.",
      "available_digits": [4, 5, 6],
      "clues": [
        "The number is even.",
        "The hundreds digit is more than 4.",
        "The tens digit is greater than the ones digit."
      ],
      "accepted_answers": [564, 654],
      "reward_points": 50
    },
    {
      "level_id": "M2_L2",
      "type": "logic_puzzle",
      "instruction": "Level 2: A tricky 3-digit combination!",
      "available_digits": [2, 4, 8, 9],
      "clues": [
        "The complete number is an odd number.",
        "It is larger than 800.",
        "The tens digit is exactly half of the hundreds digit."
      ],
      "accepted_answers": [849],
      "reward_points": 100
    },
    {
      "level_id": "M2_L3",
      "type": "logic_puzzle",
      "instruction": "Level 3: Mathematical lockbox.",
      "available_digits": [0, 3, 5, 7],
      "clues": [
        "The 3-digit number is divisible by 5.",
        "The hundreds digit is the largest digit available.",
        "The sum of the tens and ones digits is 5."
      ],
      "accepted_answers": [750, 705],
      "reward_points": 100
    },
    {
      "level_id": "M2_L4",
      "type": "logic_puzzle",
      "instruction": "Level 4: Master Safe-Cracker.",
      "available_digits": [1, 3, 6, 9],
      "clues": [
        "All 3 digits used are multiples of 3.",
        "The number is smaller than 400.",
        "The ones digit is larger than the tens digit."
      ],
      "accepted_answers": [369],
      "reward_points": 100
    }
  ]
};

export default function MathMysterySafe({ words, numQuestions, isAllQuestions = false, onComplete, onHome }) {
  const levelsToPlay = React.useMemo(() => {
    const allLevels = M2_MYSTERY_SAFE_MODULE.levels;
    const count = isAllQuestions ? allLevels.length : Math.min(numQuestions || words?.length || 10, allLevels.length);
    return allLevels.slice(0, count);
  }, [words, numQuestions, isAllQuestions]);

  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [score, setScore] = useState(0);
  const level = levelsToPlay[currentLevelIdx];
  
  const [safeInput, setSafeInput] = useState([null, null, null]);
  const [availableDigits, setAvailableDigits] = useState(level.available_digits);
  const [feedback, setFeedback] = useState(null);

  // Reset state when level changes
  React.useEffect(() => {
    setSafeInput([null, null, null]);
    setAvailableDigits(level.available_digits);
    setFeedback(null);
  }, [currentLevelIdx, level.available_digits]);

  const handleSelectDigit = (digit) => {
    if (feedback !== null) return;
    const emptySlotIdx = safeInput.indexOf(null);
    if (emptySlotIdx !== -1) {
      const newSafe = [...safeInput];
      newSafe[emptySlotIdx] = digit;
      setSafeInput(newSafe);
      setAvailableDigits(availableDigits.filter(d => d !== digit));
    }
  };

  const handleClear = () => {
    setSafeInput([null, null, null]);
    setAvailableDigits(level.available_digits);
    setFeedback(null);
  };

  const verifySafe = () => {
    const attemptedValue = parseInt(safeInput.join(''), 10);
    if (level.accepted_answers.includes(attemptedValue)) {
      setFeedback('correct');
      setScore(score + level.reward_points);
      setTimeout(() => {
          setFeedback(null);
          if (currentLevelIdx + 1 < levelsToPlay.length) {
            setCurrentLevelIdx(currentLevelIdx + 1);
          } else {
            if (onComplete) onComplete({ score: score + level.reward_points });
          }
      }, 1500);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.backBtn} onClick={onHome}>← Back</div>
        <h1 style={{margin:0, fontSize:'24px'}}>{M2_MYSTERY_SAFE_MODULE.title}</h1>
        <div style={{fontWeight:'bold'}}>Score: {Math.round(score)}</div>
      </div>

      <p style={styles.instruction}>{level.instruction}</p>

      <div style={styles.cluesPanel}>
        <h3 style={{margin: '0 0 8px 0', color: '#B45309'}}>🕵️ Mr. Edward's Clues:</h3>
        <ul style={styles.cluesList}>
          {level.clues.map((clue, i) => (
            <li key={i} style={{marginBottom: '4px'}}>{clue}</li>
          ))}
        </ul>
      </div>

      <div style={styles.safeContainer}>
        <div style={{...styles.safeDisplay, borderColor: feedback === 'correct' ? '#10B981' : (feedback === 'wrong' ? '#EF4444' : '#1e293b')}}>
          <div style={{...styles.digitSlot, color: feedback === 'wrong' ? '#EF4444' : '#10B981'}}>{safeInput[0] !== null ? safeInput[0] : '_'}</div>
          <div style={{...styles.digitSlot, color: feedback === 'wrong' ? '#EF4444' : '#10B981'}}>{safeInput[1] !== null ? safeInput[1] : '_'}</div>
          <div style={{...styles.digitSlot, color: feedback === 'wrong' ? '#EF4444' : '#10B981'}}>{safeInput[2] !== null ? safeInput[2] : '_'}</div>
        </div>
        
        <div style={styles.digitBank}>
          {availableDigits.map(digit => (
            <div key={digit} style={styles.digitCoin} onClick={() => handleSelectDigit(digit)}>
              {digit}
            </div>
          ))}
        </div>

        {safeInput.indexOf(null) === -1 && (
          <div style={{display:'flex', gap:'16px', marginTop:'32px'}}>
            <button style={{...styles.verifyBtn, marginTop:0, backgroundColor:'#EF4444'}} onClick={handleClear} disabled={!!feedback}>CLEAR</button>
            <button style={{...styles.verifyBtn, marginTop:0}} onClick={verifySafe} disabled={!!feedback}>OPEN SAFE</button>
          </div>
        )}
        {feedback === 'wrong' && <div style={{color:'#EF4444', fontWeight:'bold', marginTop:'16px', fontSize:'24px'}}>Access Denied!</div>}
        {feedback === 'correct' && <div style={{color:'#10B981', fontWeight:'bold', marginTop:'16px', fontSize:'24px'}}>Safe Unlocked!</div>}
      </div>

    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#F3E8FF',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    backgroundColor: '#7E22CE',
    color: 'white',
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: '0 0 24px 24px'
  },
  backBtn: { cursor: 'pointer', fontWeight: 'bold' },
  instruction: {
    padding: '0 24px', textAlign: 'center', fontSize: '20px', color: '#64748B', marginTop: '16px'
  },
  cluesPanel: {
    backgroundColor: '#FFFBEB',
    border: '2px solid #FDE68A',
    borderRadius: '16px',
    padding: '16px',
    margin: '16px 24px'
  },
  cluesList: {
    margin: 0, paddingLeft: '24px', color: '#92400E', fontSize: '16px', fontWeight: '600'
  },
  safeContainer: {
    backgroundColor: '#334155',
    padding: '32px',
    borderRadius: '24px',
    margin: '0 24px',
    textAlign: 'center',
    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
    border: '8px solid #cbd5e1',
    flex: 1
  },
  safeDisplay: {
    backgroundColor: '#020617',
    border: '4px solid #1e293b',
    padding: '16px',
    borderRadius: '16px',
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    marginBottom: '32px'
  },
  digitSlot: {
    width: '60px', height: '80px',
    backgroundColor: '#0f172a',
    border: '2px dashed #475569',
    color: '#10B981',
    fontFamily: 'monospace', fontSize: '48px',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    borderRadius: '8px'
  },
  digitBank: {
    display: 'flex', justifyContent: 'center', gap: '16px'
  },
  digitCoin: {
    width: '60px', height: '60px',
    backgroundColor: '#F59E0B',
    color: 'white',
    borderRadius: '50%',
    fontSize: '32px', fontWeight: 'bold',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    boxShadow: '0 4px 0 #D97706',
    cursor: 'pointer'
  },
  verifyBtn: {
    marginTop: '32px',
    padding: '12px 32px',
    backgroundColor: '#10B981',
    color: 'white', border: 'none', borderRadius: '12px',
    fontSize: '20px', fontWeight: 'bold', cursor: 'pointer',
    width: '100%'
  }
};
