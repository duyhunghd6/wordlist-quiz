import React, { useState } from 'react';
import '../GameUI.css';

const M3_SORTING_FACTORY_MODULE = {
  "module_id": "M3",
  "title": "The Sorting Factory",
  "levels": [
    {
      "level_id": "M3_L1",
      "type": "venn_diagram_drag_drop",
      "instruction": "Sort the numbers! Factor of 60 (Left) vs Multiple of 6 (Right)",
      "items_to_sort": [2, 12, 15, 18, 20, 30, 36],
      "correct_mapping": {
        "left": [2, 15, 20],
        "right": [18, 36],
        "intersection": [12, 30]
      },
      "reward_points": 100
    },
    {
      "level_id": "M3_L2",
      "type": "error_identification",
      "instruction": "Find the imposters! Tap the numbers that are in the wrong place.",
      "displayed_numbers": [7, 9, 28, 42, 49, 50, 56, 57, 67, 70],
      "correct_imposters_to_tap": [42, 50, 56, 57, 70],
      "reward_points": 150
    }
  ]
};

export default function MathSortingFactory({ onComplete, onBack }) {
  const [levelIdx, setLevelIdx] = useState(0);
  const [score, setScore] = useState(0);

  const level = M3_SORTING_FACTORY_MODULE.levels[levelIdx];
  
  // L1 State
  const [queue, setQueue] = useState(levelIdx === 0 ? level.items_to_sort : []);
  const [boxes, setBoxes] = useState({left:[], right:[], intersection:[]});
  
  // L2 State
  const [imposterTaps, setImposterTaps] = useState([]);

  const handleL1Sort = (region) => {
    if (queue.length === 0) return;
    const item = queue[0];
    const newBoxes = { ...boxes };
    newBoxes[region].push(item);
    setBoxes(newBoxes);
    
    // Check if correct
    const isCorrect = level.correct_mapping[region].includes(item);
    if (!isCorrect) {
      // Simplification: bounce it back or lose points
    }

    setQueue(queue.slice(1));
    if (queue.length === 1) { // After pushing the last one
      setScore(score + level.reward_points);
      setTimeout(() => {
        setLevelIdx(1);
      }, 1000);
    }
  };

  const handleL2Tap = (num) => {
    if (imposterTaps.includes(num)) return;
    const newTaps = [...imposterTaps, num];
    setImposterTaps(newTaps);

    if (level.correct_imposters_to_tap.includes(num)) {
      setScore(score + 30); // Partial score
    }
    
    if (newTaps.filter(n => level.correct_imposters_to_tap.includes(n)).length === level.correct_imposters_to_tap.length) {
      if (onComplete) onComplete(score + level.reward_points);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.backBtn} onClick={onBack}>← Back</div>
        <h1 style={{margin:0, fontSize:'24px'}}>{M3_SORTING_FACTORY_MODULE.title}</h1>
        <div style={{fontWeight:'bold'}}>Score: {Math.round(score)}</div>
      </div>

      <p style={styles.instruction}>{level.instruction}</p>

      {level.type === 'venn_diagram_drag_drop' && (
        <div style={styles.levelContainer}>
          <div style={styles.vennContainer}>
            <div style={{...styles.vennCircle, ...styles.leftCircle}} onClick={() => handleL1Sort('left')}>
              <div style={styles.vennItems}>{boxes.left.join(', ')}</div>
            </div>
            <div style={{...styles.vennCircle, ...styles.rightCircle}} onClick={() => handleL1Sort('right')}>
              <div style={styles.vennItems}>{boxes.right.join(', ')}</div>
            </div>
            <div style={styles.intersectionBtn} onClick={() => handleL1Sort('intersection')}>
              BOTH
              <div style={styles.vennItems}>{boxes.intersection.join(', ')}</div>
            </div>
          </div>
          
          <div style={styles.conveyor}>
            {queue.map((item, idx) => (
              <div key={idx} style={styles.sortableItem}>{item}</div>
            ))}
          </div>
          <p style={{textAlign:'center', color:'#64748B'}}>Tap a circle to place the first number!</p>
        </div>
      )}

      {level.type === 'error_identification' && (
        <div style={styles.levelContainer}>
           <div style={styles.vennContainer}>
            <div style={{...styles.vennCircle, ...styles.leftCircle}}>{"< 50"}</div>
            <div style={{...styles.vennCircle, ...styles.rightCircle}}>{"x 7"}</div>
            
            {level.displayed_numbers.map((item, idx) => {
              const isTapped = imposterTaps.includes(item);
              const isCorrectImposter = level.correct_imposters_to_tap.includes(item);
              return (
                <div 
                  key={idx} 
                  onClick={() => handleL2Tap(item)}
                  style={{
                    ...styles.sortableItem, 
                    position:'absolute', 
                    top: `${100 + (idx * 23) % 80}px`, 
                    left: `${20 + (idx * 30) % 200}px`,
                    borderColor: isTapped ? (isCorrectImposter ? '#10B981' : '#EF4444') : '#94A3B8',
                    backgroundColor: isTapped ? (isCorrectImposter ? '#D1FAE5' : '#FEE2E2') : 'white'
                  }}
                >
                  {item}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#FEF3C7',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    backgroundColor: '#D97706',
    color: 'white', padding: '16px', display: 'flex',
    justifyContent: 'space-between', alignItems: 'center',
    borderRadius: '0 0 24px 24px'
  },
  backBtn: { cursor: 'pointer', fontWeight: 'bold' },
  instruction: { padding: '0 24px', textAlign: 'center', fontSize: '18px', color: '#64748B', marginTop: '16px' },
  levelContainer: {
    flex: 1, display: 'flex', flexDirection: 'column'
  },
  vennContainer: {
    position: 'relative', width: '320px', height: '220px', margin: '20px auto'
  },
  vennCircle: {
    position: 'absolute', width: '200px', height: '200px', borderRadius: '50%',
    display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '24px', boxSizing: 'border-box',
    border: '3px solid white', fontWeight: 'bold', mixBlendMode: 'multiply', cursor: 'pointer'
  },
  leftCircle: { left: 0, backgroundColor: 'rgba(59, 130, 246, 0.4)' },
  rightCircle: { right: 0, backgroundColor: 'rgba(239, 68, 68, 0.4)' },
  intersectionBtn: {
    position: 'absolute', top: '70px', left: '130px', zIndex: 3, width: '60px', height: '80px',
    textAlign: 'center', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px'
  },
  conveyor: {
    backgroundColor: '#475569', padding: '16px', margin: '24px', borderRadius: '16px',
    display: 'flex', gap: '8px', overflowX: 'auto', borderBottom: '8px solid #334155'
  },
  sortableItem: {
    backgroundColor: 'white', border: '2px solid #94A3B8', width: '44px', height: '44px',
    borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center',
    fontWeight: 'bold', fontSize: '18px', color: '#334155', flexShrink: 0,
    cursor: 'pointer'
  },
  vennItems: { marginTop: '8px', fontSize: '14px', fontWeight: 'normal', whiteSpace: 'pre-wrap', textAlign:'center', padding:'0 16px' }
};
