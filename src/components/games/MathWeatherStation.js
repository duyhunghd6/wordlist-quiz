import React, { useState } from 'react';
import '../GameUI.css';

const M1_WEATHER_STATION_MODULE = {
  "module_id": "M1",
  "title": "The Weather Station",
  "concept": "Negative Numbers & Inequalities",
  "levels": [
    {
      "level_id": "M1_L1",
      "type": "sorting",
      "instruction": "Drag the temperatures onto the number line from coldest to warmest.",
      "data_pool": [
        { "label": "Yakutsk", "value": -32 },
        { "label": "Ulaanbaatar", "value": -12 },
        { "label": "Toronto", "value": 2 },
        { "label": "New York", "value": 9 },
        { "label": "Bangkok", "value": 17 },
        { "label": "Jakarta", "value": 28 }
      ],
      "correct_order_values": [-32, -12, 2, 9, 17, 28],
      "reward_points": 50
    },
    {
      "level_id": "M1_L2",
      "type": "comparison_quickfire",
      "instruction": "Select the Hungry Crocodile (< or >) that eats the bigger number.",
      "questions": [
        { "left_value": -4, "right_value": -6, "correct_operator": ">" },
        { "left_value": -3, "right_value": 2, "correct_operator": "<" },
        { "left_value": -5, "right_value": -1, "correct_operator": "<" },
        { "left_value": -2, "right_value": -3, "correct_operator": ">" }
      ],
      "reward_points": 100
    }
  ]
};

export default function MathWeatherStation({ onComplete, onBack }) {
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [l2QuestionIdx, setL2QuestionIdx] = useState(0);
  const [score, setScore] = useState(0);

  const level = M1_WEATHER_STATION_MODULE.levels[currentLevelIdx];

  // Logic for L1 (Simplified: Click to select in order instead of drag to make it simple on mobile if Drag & Drop is too complex without a library, but let's do a simple array matching for now).
  // Actually, let's implement click-to-sort.
  const [sortedValues, setSortedValues] = useState([]);
  const [availableItems, setAvailableItems] = useState(level?.data_pool || []);

  const handleL1Click = (item) => {
    setSortedValues([...sortedValues, item]);
    setAvailableItems(availableItems.filter(i => i.value !== item.value));
  };

  const verifyL1 = () => {
    const isCorrect = sortedValues.map(v => v.value).join(',') === level.correct_order_values.join(',');
    if (isCorrect) {
      setScore(score + level.reward_points);
      setTimeout(() => setCurrentLevelIdx(1), 1000);
    } else {
      // Reset
      setSortedValues([]);
      setAvailableItems(level.data_pool);
    }
  };

  // Logic for L2
  const handleL2Answer = (operator) => {
    const q = level.questions[l2QuestionIdx];
    if (q.correct_operator === operator) {
      setScore(score + (level.reward_points / level.questions.length));
    }
    
    if (l2QuestionIdx + 1 < level.questions.length) {
      setL2QuestionIdx(l2QuestionIdx + 1);
    } else {
      if (onComplete) onComplete(score + (level.reward_points / level.questions.length));
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.backBtn} onClick={onBack}>← Back</div>
        <h1 style={{margin:0, fontSize:'24px'}}>{M1_WEATHER_STATION_MODULE.title}</h1>
        <div style={{fontWeight:'bold'}}>Score: {Math.round(score)}</div>
      </div>

      <p style={styles.instruction}>{level.instruction}</p>

      {level.type === 'sorting' && (
        <div style={styles.levelContainer}>
          <div style={styles.numberLine}>
            {level.data_pool.map((_, idx) => (
              <div key={idx} style={styles.slot}>
                {sortedValues[idx] ? `${sortedValues[idx].label} (${sortedValues[idx].value})` : ''}
              </div>
            ))}
          </div>

          <div style={styles.rack}>
            {availableItems.map((item, idx) => (
              <div key={idx} style={styles.dragItem} onClick={() => handleL1Click(item)}>
                {item.label} ({item.value})
              </div>
            ))}
          </div>
          
          {availableItems.length === 0 && (
            <button style={styles.verifyBtn} onClick={verifyL1}>Check Order</button>
          )}
        </div>
      )}

      {level.type === 'comparison_quickfire' && (
        <div style={styles.levelContainer}>
          <div style={styles.arena}>
            <div style={styles.numberCard}>{level.questions[l2QuestionIdx].left_value}</div>
            <div style={{fontSize:'48px', color:'#64748B'}}>?</div>
            <div style={styles.numberCard}>{level.questions[l2QuestionIdx].right_value}</div>
          </div>
          <div style={styles.crocBtns}>
            <button style={styles.crocBtn} onClick={() => handleL2Answer('<')}>&lt;</button>
            <button style={styles.crocBtn} onClick={() => handleL2Answer('>')}>&gt;</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#E0F2FE',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    backgroundColor: '#0284C7',
    color: 'white',
    padding: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: '0 0 24px 24px'
  },
  backBtn: {
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  instruction: {
    padding: '0 24px',
    textAlign: 'center',
    fontSize: '20px',
    color: '#64748B',
    marginTop: '24px'
  },
  levelContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  numberLine: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: '16px'
  },
  slot: {
    width: '80px',
    height: '80px',
    border: '3px dashed #64748B',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    fontSize: '12px',
    textAlign: 'center',
    padding: '4px'
  },
  rack: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    justifyContent: 'center',
    padding: '16px'
  },
  dragItem: {
    padding: '8px 16px',
    backgroundColor: '#EAB308',
    color: 'white',
    fontWeight: 'bold',
    borderRadius: '12px',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  verifyBtn: {
    marginTop: '24px',
    padding: '12px 24px',
    backgroundColor: '#10B981',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  arena: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    margin: '40px 0'
  },
  numberCard: {
    fontSize: '48px',
    fontWeight: '900',
    color: '#0284C7',
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '24px',
    border: '4px solid #0284C7',
    width: '60px',
    textAlign: 'center'
  },
  crocBtns: {
    display: 'flex',
    gap: '24px'
  },
  crocBtn: {
    fontSize: '36px',
    padding: '16px 24px',
    backgroundColor: '#10B981',
    color: 'white',
    border: 'none',
    borderRadius: '16px',
    borderBottom: '6px solid #059669',
    fontWeight: 'bold',
    cursor: 'pointer'
  }
};
