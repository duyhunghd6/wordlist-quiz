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

export default function MathWeatherStation({ onComplete, onHome }) {
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [l2QuestionIdx, setL2QuestionIdx] = useState(0);
  const [score, setScore] = useState(0);

  const level = M1_WEATHER_STATION_MODULE.levels[currentLevelIdx];

  const [sortedValues, setSortedValues] = useState(new Array(6).fill(null));
  const [availableItems, setAvailableItems] = useState(level?.data_pool || []);
  const [feedback, setFeedback] = useState(null);

  const handleDragStart = (e, item, sourceSlotIdx = null) => {
    e.dataTransfer.setData("itemValue", item.value);
    if (sourceSlotIdx !== null) {
      e.dataTransfer.setData("sourceSlotIdx", sourceSlotIdx.toString());
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleRackDrop = (e) => {
    e.preventDefault();
    const sourceSlotIdx = e.dataTransfer.getData("sourceSlotIdx");
    if (sourceSlotIdx !== "") {
      const idx = parseInt(sourceSlotIdx, 10);
      const item = sortedValues[idx];
      if (item) {
        const newSorted = [...sortedValues];
        newSorted[idx] = null;
        setSortedValues(newSorted);
        setAvailableItems([...availableItems, item]);
      }
    }
  };

  const handleDrop = (e, targetSlotIdx) => {
    e.preventDefault();
    const itemValue = e.dataTransfer.getData("itemValue");
    if (!itemValue) return;

    const sourceSlotIdx = e.dataTransfer.getData("sourceSlotIdx");
    if (sourceSlotIdx !== "") {
      // Dragging from one slot to another
      const srcIdx = parseInt(sourceSlotIdx, 10);
      if (srcIdx === targetSlotIdx) return;
      
      const newSorted = [...sortedValues];
      const itemToMove = newSorted[srcIdx];
      const targetItem = newSorted[targetSlotIdx];
      
      newSorted[targetSlotIdx] = itemToMove;
      newSorted[srcIdx] = targetItem; // allow swapping
      setSortedValues(newSorted);
      return;
    }
    
    // Dragging from rack to slot
    const itemFromRack = availableItems.find(i => i.value.toString() === itemValue.toString());
    if (itemFromRack) {
      const newSorted = [...sortedValues];
      let newAvailable = availableItems.filter(i => i.value.toString() !== itemValue.toString());
      
      // Swap out the existing item back to rack
      if (newSorted[targetSlotIdx]) {
        newAvailable.push(newSorted[targetSlotIdx]);
      }
      
      newSorted[targetSlotIdx] = itemFromRack;
      setSortedValues(newSorted);
      setAvailableItems(newAvailable);
    }
  };

  const handleClear = () => {
    setSortedValues(new Array(6).fill(null));
    setAvailableItems(level.data_pool);
    setFeedback(null);
  };

  const verifyL1 = () => {
    if (sortedValues.includes(null)) {
      setFeedback('incomplete');
      setTimeout(() => setFeedback(null), 1500);
      return;
    }

    const isCorrect = sortedValues.map(v => v.value).join(',') === level.correct_order_values.join(',');
    if (isCorrect) {
      setFeedback('correct');
      setScore(score + level.reward_points);
      setTimeout(() => {
          setFeedback(null);
          setCurrentLevelIdx(1);
      }, 1500);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  // Logic for L2
  const handleL2Answer = (operator) => {
    const q = level.questions[l2QuestionIdx];
    const isCorrect = q.correct_operator === operator;
    
    setFeedback(isCorrect ? 'correct' : 'wrong');
    setTimeout(() => {
        setFeedback(null);
        if (isCorrect) {
          setScore(score + (level.reward_points / level.questions.length));
        }
        
        if (l2QuestionIdx + 1 < level.questions.length) {
          setL2QuestionIdx(l2QuestionIdx + 1);
        } else {
          const finalScore = score + (isCorrect ? (level.reward_points / level.questions.length) : 0);
          if (onComplete) onComplete({ score: finalScore });
        }
    }, 1000);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.backBtn} onClick={onHome}>← Back</div>
        <h1 style={{margin:0, fontSize:'24px'}}>{M1_WEATHER_STATION_MODULE.title}</h1>
        <div style={{fontWeight:'bold'}}>Score: {Math.round(score)}</div>
      </div>

      <p style={styles.instruction}>{level.instruction}</p>

      {level.type === 'sorting' && (
        <div style={styles.levelContainer}>
          <div style={styles.numberLine}>
            {sortedValues.map((val, idx) => (
              <div 
                key={idx} 
                style={{
                  ...styles.slot, 
                  backgroundColor: feedback === 'correct' ? '#10B981' : (feedback === 'wrong' ? '#EF4444' : (val ? '#EAB308' : 'white')),
                  color: (feedback === 'correct' || feedback === 'wrong' || val) ? 'white' : '#334155',
                  borderColor: val ? '#CA8A04' : '#64748B',
                  fontWeight: val ? 'bold' : 'normal',
                  cursor: val ? 'grab' : 'default'
                }}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, idx)}
                draggable={!!val}
                onDragStart={(e) => { if (val) handleDragStart(e, val, idx) }}
              >
                {val ? `${val.label} (${val.value})` : 'Drop Here'}
              </div>
            ))}
          </div>

          <div style={styles.rack} onDragOver={handleDragOver} onDrop={handleRackDrop}>
            {availableItems.map((item, idx) => (
              <div 
                key={idx} 
                style={styles.dragItem} 
                draggable 
                onDragStart={(e) => handleDragStart(e, item, null)}
              >
                {item.label} ({item.value})
              </div>
            ))}
          </div>
          
          <div style={{display:'flex', gap:'16px'}}>
            <button style={{...styles.verifyBtn, backgroundColor:'#EF4444'}} onClick={handleClear}>Clear</button>
            <button style={styles.verifyBtn} onClick={verifyL1}>Check Order</button>
          </div>
          {feedback === 'incomplete' && <div style={{color:'#EF4444', fontWeight:'bold', marginTop:'16px'}}>Please fill all slots!</div>}
        </div>
      )}

      {level.type === 'comparison_quickfire' && (
        <div style={styles.levelContainer}>
          <div style={{...styles.arena, backgroundColor: feedback === 'correct' ? '#D1FAE5' : (feedback === 'wrong' ? '#FEE2E2' : 'transparent'), padding:'24px', borderRadius:'16px' }}>
            <div style={styles.numberCard}>{level.questions[l2QuestionIdx].left_value}</div>
            <div style={{fontSize:'48px', color:'#64748B'}}>?</div>
            <div style={styles.numberCard}>{level.questions[l2QuestionIdx].right_value}</div>
          </div>
          <div style={styles.crocBtns}>
            <button style={styles.crocBtn} onClick={() => handleL2Answer('<')} disabled={!!feedback}>&lt;</button>
            <button style={styles.crocBtn} onClick={() => handleL2Answer('>')} disabled={!!feedback}>&gt;</button>
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
    gap: '32px',
    margin: '40px 0',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  numberCard: {
    fontSize: '64px',
    fontWeight: '900',
    color: '#0284C7',
    backgroundColor: 'white',
    padding: '32px',
    borderRadius: '32px',
    border: '6px solid #0284C7',
    minWidth: '100px',
    textAlign: 'center',
    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
  },
  crocBtns: {
    display: 'flex',
    gap: '32px',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  crocBtn: {
    fontSize: '64px',
    padding: '16px 40px',
    backgroundColor: '#10B981',
    color: 'white',
    border: 'none',
    borderRadius: '24px',
    borderBottom: '8px solid #059669',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
  }
};
