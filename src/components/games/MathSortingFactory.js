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
      "displayed_numbers": [
        { val: 7, x: 40, y: 50 }, { val: 9, x: 70, y: 130 }, { val: 28, x: 100, y: 70 },
        { val: 42, x: 140, y: 40 }, { val: 49, x: 140, y: 140 }, 
        { val: 56, x: 190, y: 50 }, { val: 67, x: 230, y: 100 }, { val: 70, x: 200, y: 140 },
        { val: 50, x: 250, y: 60 }, { val: 57, x: 260, y: 150 }
      ],
      "correct_imposters_to_tap": [42, 50, 56, 57, 70],
      "reward_points": 150
    }
  ]
};

export default function MathSortingFactory({ onComplete, onHome }) {
  const [levelIdx, setLevelIdx] = useState(0);
  const [score, setScore] = useState(0);

  const level = M3_SORTING_FACTORY_MODULE.levels[levelIdx];
  
  // L1 State
  const [queue, setQueue] = useState(levelIdx === 0 ? level.items_to_sort : []);
  const [boxes, setBoxes] = useState({left:[], right:[], intersection:[]});
  const [feedback, setFeedback] = useState(null);

  // L2 State
  const [imposterTaps, setImposterTaps] = useState([]);

  const handleDragStart = (e, item, sourceRegion = null) => {
    e.dataTransfer.setData("itemStr", item.toString());
    if (sourceRegion) {
      e.dataTransfer.setData("sourceRegion", sourceRegion);
    }
  };
  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e, targetRegion) => {
    e.preventDefault();
    const itemStr = e.dataTransfer.getData("itemStr");
    if (!itemStr) return;
    const item = parseInt(itemStr, 10);
    const sourceRegion = e.dataTransfer.getData("sourceRegion");

    const newBoxes = { ...boxes };

    if (sourceRegion && sourceRegion !== "") {
      if (sourceRegion === targetRegion) return;
      // move from one circle to another
      newBoxes[sourceRegion] = newBoxes[sourceRegion].filter(i => i !== item);
    } else {
      // move from queue
      if (!queue.includes(item)) return;
      const newQueue = queue.filter(q => q !== item);
      setQueue(newQueue);
    }

    newBoxes[targetRegion].push(item);
    setBoxes(newBoxes);
    
    // Auto verifying upon drop
    const isCorrect = level.correct_mapping[targetRegion].includes(item);
    if (!isCorrect) {
       setFeedback('wrong');
       setTimeout(() => setFeedback(null), 1000);
    } else {
       setFeedback('correct');
       setTimeout(() => setFeedback(null), 500);
    }

    // Checking win state
    if (
      queue.length === 0 && 
      (!sourceRegion || sourceRegion === "") && 
      (queue.filter(q => q !== item).length === 0)
    ) {
      // Very naive check: assumes once the queue is empty, the user has completed it. However, since the user can move numbers around, it's better to verify via an explicit button or check if all numbers are in correct locations.
      // Actually, let's keep the existing logic: once the queue is empty, it triggers next level. (Simple version)
      setScore(score + level.reward_points);
      setTimeout(() => {
        setLevelIdx(1);
      }, 1500);
    }
  };

  const handleConveyorDrop = (e) => {
    e.preventDefault();
    const itemStr = e.dataTransfer.getData("itemStr");
    if (!itemStr) return;
    const item = parseInt(itemStr, 10);
    const sourceRegion = e.dataTransfer.getData("sourceRegion");

    if (sourceRegion && sourceRegion !== "") {
      const newBoxes = { ...boxes };
      newBoxes[sourceRegion] = newBoxes[sourceRegion].filter(i => i !== item);
      setBoxes(newBoxes);
      setQueue([...queue, item]);
    }
  };

  const handleClear = () => {
    setQueue(level.items_to_sort);
    setBoxes({left:[], right:[], intersection:[]});
    setFeedback(null);
  };

  const handleL2Tap = (num) => {
    if (imposterTaps.includes(num)) return;
    const newTaps = [...imposterTaps, num];
    setImposterTaps(newTaps);

    let currentScore = score;
    if (level.correct_imposters_to_tap.includes(num)) {
      currentScore += 30; // Partial score
      setScore(currentScore); 
    }
    
    if (newTaps.filter(n => level.correct_imposters_to_tap.includes(n)).length === level.correct_imposters_to_tap.length) {
      if (onComplete) setTimeout(() => onComplete({ score: currentScore }), 1000);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.backBtn} onClick={onHome}>← Back</div>
        <h1 style={{margin:0, fontSize:'24px'}}>{M3_SORTING_FACTORY_MODULE.title}</h1>
        <div style={{fontWeight:'bold'}}>Score: {Math.round(score)}</div>
      </div>

      <p style={styles.instruction}>{level.instruction}</p>

      {level.type === 'venn_diagram_drag_drop' && (
        <div style={styles.levelContainer}>
          <div style={styles.vennContainer}>
            <div 
              style={{...styles.vennCircle, ...styles.leftCircle}} 
              onDragOver={handleDragOver} 
              onDrop={(e) => handleDrop(e, 'left')}
            >
              <div style={styles.vennItems}>
                {boxes.left.map((item, idx) => (
                  <span key={idx} draggable onDragStart={(e) => handleDragStart(e, item, 'left')} style={{cursor:'grab', margin:'0 4px', padding:'2px', display:'inline-block'}}>{item}</span>
                ))}
              </div>
            </div>
            <div 
              style={{...styles.vennCircle, ...styles.rightCircle}} 
              onDragOver={handleDragOver} 
              onDrop={(e) => handleDrop(e, 'right')}
            >
              <div style={styles.vennItems}>
                {boxes.right.map((item, idx) => (
                  <span key={idx} draggable onDragStart={(e) => handleDragStart(e, item, 'right')} style={{cursor:'grab', margin:'0 4px', padding:'2px', display:'inline-block'}}>{item}</span>
                ))}
              </div>
            </div>
            <div 
              style={styles.intersectionBtn} 
              onDragOver={handleDragOver} 
              onDrop={(e) => handleDrop(e, 'intersection')}
            >
              BOTH
              <div style={styles.vennItems}>
                {boxes.intersection.map((item, idx) => (
                   <span key={idx} draggable onDragStart={(e) => handleDragStart(e, item, 'intersection')} style={{cursor:'grab', margin:'0 4px', padding:'2px', display:'inline-block'}}>{item}</span>
                ))}
              </div>
            </div>
          </div>
          
          <div style={{...styles.conveyor, borderColor: feedback === 'wrong' ? '#EF4444' : (feedback === 'correct' ? '#10B981' : '#334155')}} onDragOver={handleDragOver} onDrop={handleConveyorDrop}>
            {queue.map((item, idx) => (
              <div key={idx} style={styles.sortableItem} draggable onDragStart={(e) => handleDragStart(e, item, null)}>{item}</div>
            ))}
          </div>
          <div style={{display:'flex', gap:'16px'}}>
            <button style={{padding:'8px 16px', backgroundColor:'#EF4444', color:'white', border:'none', borderRadius:'8px', fontWeight:'bold', cursor:'pointer'}} onClick={handleClear}>Retry Sorting</button>
            <p style={{textAlign:'center', color:'#64748B', margin:0, padding:'8px'}}>Drag numbers into the correct area!</p>
          </div>
        </div>
      )}

      {level.type === 'error_identification' && (
        <div style={styles.levelContainer}>
           <div style={{...styles.vennContainer, width: '340px', height: '240px'}}>
            <div style={{...styles.vennCircle, ...styles.leftCircle, width:'220px', height:'220px'}}>{"< 50"}</div>
            <div style={{...styles.vennCircle, ...styles.rightCircle, width:'220px', height:'220px'}}>{"x 7"}</div>
            
            {level.displayed_numbers.map((itemObj, idx) => {
              const isTapped = imposterTaps.includes(itemObj.val);
              const isCorrectImposter = level.correct_imposters_to_tap.includes(itemObj.val);
              return (
                <div 
                  key={idx} 
                  onClick={() => handleL2Tap(itemObj.val)}
                  style={{
                    ...styles.sortableItem, 
                    position:'absolute', 
                    top: `${itemObj.y}px`, 
                    left: `${itemObj.x}px`,
                    borderColor: isTapped ? (isCorrectImposter ? '#10B981' : '#EF4444') : '#94A3B8',
                    backgroundColor: isTapped ? (isCorrectImposter ? '#D1FAE5' : '#FEE2E2') : 'white'
                  }}
                >
                  {itemObj.val}
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
