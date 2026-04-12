import React, { useState } from 'react';
import '../GameUI.css';

const VennCategories = [
  { name: "< 50", check: (n) => n < 50 },
  { name: "> 30", check: (n) => n > 30 },
  { name: "Even", check: (n) => n % 2 === 0 },
  { name: "Odd", check: (n) => n % 2 !== 0 },
  { name: "Multiples of 5", check: (n) => n % 5 === 0 },
  { name: "Multiples of 10", check: (n) => n % 10 === 0 },
  { name: "Multiples of 3", check: (n) => n % 3 === 0 },
];

const nodePositions = [
  { x: 40, y: 50 }, { x: 70, y: 130 }, { x: 100, y: 70 },
  { x: 140, y: 40 }, { x: 140, y: 140 }, 
  { x: 190, y: 50 }, { x: 230, y: 100 }, { x: 200, y: 140 },
  { x: 250, y: 60 }, { x: 260, y: 150 }
];

const generateL1Question = (levelIdx) => {
   const shuffledCats = [...VennCategories].sort(() => 0.5 - Math.random());
   const catLeft = shuffledCats[0];
   const catRight = shuffledCats[1];
   
   const numbers = [];
   while(numbers.length < 8) {
      const n = Math.floor(Math.random() * 99) + 1;
      if (!numbers.includes(n)) numbers.push(n);
   }
   
   const mapping = { left: [], right: [], intersection: [], none: [] };
   numbers.forEach(n => {
       const isLeft = catLeft.check(n);
       const isRight = catRight.check(n);
       if (isLeft && isRight) mapping.intersection.push(n);
       else if (isLeft) mapping.left.push(n);
       else if (isRight) mapping.right.push(n);
       else mapping.none.push(n); 
   });
   
   return {
      level_id: `M3_L${levelIdx}`,
      type: "venn_diagram_drag_drop",
      instruction: `Sort the numbers! Left Circle is '${catLeft.name}', Right Circle is '${catRight.name}'.`,
      items_to_sort: numbers,
      correct_mapping: mapping,
      catLeftName: catLeft.name,
      catRightName: catRight.name,
      reward_points: 50
   };
};

const generateL2Question = (levelIdx) => {
   const shuffledCats = [...VennCategories].sort(() => 0.5 - Math.random());
   const catLeft = shuffledCats[0];
   const catRight = shuffledCats[1];
   
   const numbersObj = [];
   const correct_imposters = [];
   
   nodePositions.forEach((pos) => {
      let n = Math.floor(Math.random() * 99) + 1;
      numbersObj.push({ val: n, x: pos.x, y: pos.y });
      
      const isGeometricallyLeft = pos.x < 120;
      const isGeometricallyIntersection = pos.x >= 120 && pos.x <= 220;
      const isGeometricallyRight = pos.x > 220;
      
      const isLogicallyLeft = catLeft.check(n) && !catRight.check(n);
      const isLogicallyIntersection = catLeft.check(n) && catRight.check(n);
      const isLogicallyRight = !catLeft.check(n) && catRight.check(n);
      
      const isCorrectPlace = 
         (isGeometricallyLeft && isLogicallyLeft) ||
         (isGeometricallyIntersection && isLogicallyIntersection) ||
         (isGeometricallyRight && isLogicallyRight);
         
      const isLogicallyNone = !catLeft.check(n) && !catRight.check(n);
      
      if (!isCorrectPlace || isLogicallyNone) {
          correct_imposters.push(n);
      }
   });
   
   return {
      level_id: `M3_L${levelIdx}`,
      type: "error_identification",
      instruction: `Find imposters (incorrect numbers)! Left is '${catLeft.name}', Right is '${catRight.name}'.`,
      displayed_numbers: numbersObj,
      correct_imposters_to_tap: correct_imposters,
      catLeftName: catLeft.name,
      catRightName: catRight.name,
      reward_points: 50
   };
};

export default function MathSortingFactory({ onComplete, onHome }) {
  const { levels } = React.useMemo(() => {
     const genLevels = [];
     for(let i=0; i<5; i++) {
        if (i % 2 === 0) genLevels.push(generateL1Question(i+1));
        else genLevels.push(generateL2Question(i+1));
     }
     return { levels: genLevels };
  }, []);

  const [levelIdx, setLevelIdx] = useState(0);
  const [score, setScore] = useState(0);

  const level = levels[levelIdx];
  
  // L1 State
  const [queue, setQueue] = useState(level.items_to_sort || []);
  const [boxes, setBoxes] = useState({left:[], right:[], intersection:[]});
  const [feedback, setFeedback] = useState(null);

  // L2 State
  const [imposterTaps, setImposterTaps] = useState([]);

  // Mount reset
  React.useEffect(() => {
    if (level.type === 'venn_diagram_drag_drop') {
      setQueue(level.items_to_sort);
      setBoxes({left: [], right: [], intersection: []});
    } else {
      setImposterTaps([]);
    }
    setFeedback(null);
  }, [level]);

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
  };

  const verifySortingSubmit = () => {
    let allCorrect = true;
    const { correct_mapping } = level;
    
    // Check missing items that were supposed to be placed correctly
    if (boxes.left.length !== correct_mapping.left.length) allCorrect = false;
    if (boxes.right.length !== correct_mapping.right.length) allCorrect = false;
    if (boxes.intersection.length !== correct_mapping.intersection.length) allCorrect = false;

    // Check validity of placed items
    if (allCorrect) {
       for(let n of boxes.left) if (!correct_mapping.left.includes(n)) allCorrect = false;
       for(let n of boxes.right) if (!correct_mapping.right.includes(n)) allCorrect = false;
       for(let n of boxes.intersection) if (!correct_mapping.intersection.includes(n)) allCorrect = false;
    }

    if (allCorrect) {
       setFeedback('level_correct');
       setScore(score + level.reward_points);
       setTimeout(() => {
         setFeedback(null);
         if (levelIdx + 1 < levels.length) {
            setLevelIdx(levelIdx + 1);
         } else {
            if (onComplete) onComplete({ score: score + level.reward_points });
         }
       }, 2000);
    } else {
       setFeedback('level_wrong');
       setTimeout(() => setFeedback(null), 2500);
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

    if (newTaps.length === level.correct_imposters_to_tap.length) {
       // auto-verify imposter when maximum count reached? No, wait for explicit submit!
    }
  };

  const verifyImposterSubmit = () => {
    let allCorrect = true;
    if (imposterTaps.length !== level.correct_imposters_to_tap.length) {
        allCorrect = false;
    } else {
        for(let n of imposterTaps) {
            if (!level.correct_imposters_to_tap.includes(n)) allCorrect = false;
        }
    }
    
    if (allCorrect) {
       setFeedback('level_correct');
       setScore(score + level.reward_points);
       setTimeout(() => {
         setFeedback(null);
         if (levelIdx + 1 < levels.length) {
            setLevelIdx(levelIdx + 1);
         } else {
            if (onComplete) onComplete({ score: score + level.reward_points });
         }
       }, 2000);
    } else {
       setFeedback('level_wrong');
       setTimeout(() => {
         setFeedback(null);
         setImposterTaps([]); // Clear to try again
       }, 2500);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.backBtn} onClick={onHome}>← Back</div>
        <h1 style={{margin:0, fontSize:'24px'}}>The Sorting Factory</h1>
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
              <div style={styles.catLabel}>{level.catLeftName}</div>
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
              <div style={styles.catLabel}>{level.catRightName}</div>
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
          
          {feedback === 'level_wrong' && <div style={{color:'#EF4444', fontWeight:'bold', fontSize:'20px', textAlign:'center', marginTop:'10px'}}>Hmm, some aren't quite right. Keep trying!</div>}
          {feedback === 'level_correct' && <div style={{color:'#10B981', fontWeight:'bold', fontSize:'24px', textAlign:'center', marginTop:'10px'}}>Perfect Sorting!</div>}

          <div style={{display:'flex', gap:'16px', justifyContent:'center', marginTop:'16px'}}>
            <button style={{padding:'12px 24px', backgroundColor:'#EF4444', color:'white', border:'none', borderRadius:'8px', fontWeight:'bold', cursor:'pointer'}} onClick={handleClear}>Retry Sorting</button>
            <button style={{padding:'12px 24px', backgroundColor:'#3B82F6', color:'white', border:'none', borderRadius:'8px', fontWeight:'bold', cursor:'pointer'}} onClick={verifySortingSubmit}>Submit Answers</button>
          </div>
        </div>
      )}

      {level.type === 'error_identification' && (
        <div style={styles.levelContainer}>
           <div style={{...styles.vennContainer, width: '340px', height: '240px'}}>
            <div style={{...styles.vennCircle, ...styles.leftCircle, width:'220px', height:'220px'}}>
               <div style={styles.catLabel}>{level.catLeftName}</div>
            </div>
            <div style={{...styles.vennCircle, ...styles.rightCircle, width:'220px', height:'220px'}}>
               <div style={styles.catLabel}>{level.catRightName}</div>
            </div>
            
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
          
          <div style={{marginTop: '24px', textAlign: 'center'}}>
            <p style={{fontWeight:'bold', fontSize:'18px'}}>You have found {imposterTaps.length} / {level.correct_imposters_to_tap.length} imposters!</p>
            {feedback === 'level_wrong' && <div style={{color:'#EF4444', fontWeight:'bold', fontSize:'20px'}}>Not quite! Try finding the correct imposters.</div>}
            {feedback === 'level_correct' && <div style={{color:'#10B981', fontWeight:'bold', fontSize:'24px'}}>Great Detective Work!</div>}
            
            <div style={{display:'flex', gap:'16px', justifyContent:'center', marginTop:'16px'}}>
               <button style={{padding:'12px 24px', backgroundColor:'#EF4444', color:'white', border:'none', borderRadius:'8px', fontWeight:'bold', cursor:'pointer'}} onClick={() => setImposterTaps([])}>Clear Taps</button>
               <button style={{padding:'12px 24px', backgroundColor:'#3B82F6', color:'white', border:'none', borderRadius:'8px', fontWeight:'bold', cursor:'pointer'}} onClick={verifyImposterSubmit}>Submit Found Imposters</button>
            </div>
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
  vennItems: { marginTop: '8px', fontSize: '14px', fontWeight: 'normal', whiteSpace: 'pre-wrap', textAlign:'center', padding:'0 16px' },
  catLabel: {
    position: 'absolute',
    top: '10px',
    width: '100%',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '18px',
    color: '#333'
  }
};
