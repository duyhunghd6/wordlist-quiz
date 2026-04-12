import React, { useState } from 'react';
import '../GameUI.css';

const M4_DATA_CINEMA_MODULE = {
  "module_id": "M4",
  "title": "The Data Cinema",
  "levels": [
    {
      "level_id": "M4_L1",
      "type": "data_extraction",
      "instruction": "Look at the Cinema Pictogram. Enter the correct numbers.",
      "questions": [
        { "text": "How many tickets were sold on Day 2?", "answer": 90 },
        { "text": "Difference between Day 4 and Day 6?", "answer": 10 }
      ],
      "reward_points": 100
    },
    {
      "level_id": "M4_L2",
      "type": "matching",
      "instruction": "Select the correct Chart for the scenario.",
      "pairs": [
        { scenario: "Comparing similarities between cats and dogs", chart: "Venn Diagram", options: ["Bar Chart", "Venn Diagram", "Dot Plot"] },
        { scenario: "Most popular colours of students in a class", chart: "Bar Chart", options: ["Bar Chart", "Carroll Diagram", "Dot Plot"] },
      ],
      "reward_points": 100
    }
  ]
};

export default function MathDataCinema({ onComplete, onHome }) {
  const [levelIdx, setLevelIdx] = useState(0);
  const [score, setScore] = useState(0);

  const level = M4_DATA_CINEMA_MODULE.levels[levelIdx];
  
  // L1 State
  const [l1QuestionIdx, setL1QuestionIdx] = useState(0);
  const [keypadInput, setKeypadInput] = useState("");

  // L2 State
  const [l2QuestionIdx, setL2QuestionIdx] = useState(0);

  const [feedbackL1, setFeedbackL1] = useState(null);
  const [feedbackL2, setFeedbackL2] = useState(null);

  const handleKeypad = (num) => {
    setKeypadInput(prev => prev + num);
  };
  const handleClear = () => setKeypadInput("");

  const submitL1Answer = () => {
    if (feedbackL1) return;
    if (parseInt(keypadInput) === level.questions[l1QuestionIdx].answer) {
      setFeedbackL1('correct');
      setTimeout(() => {
          setScore(score + 50);
          setFeedbackL1(null);
          if (l1QuestionIdx + 1 < level.questions.length) {
            setL1QuestionIdx(l1QuestionIdx + 1);
            setKeypadInput("");
          } else {
            setLevelIdx(1);
          }
      }, 1500);
    } else {
      setFeedbackL1('wrong');
      setTimeout(() => {
          setFeedbackL1(null);
          setKeypadInput("");
      }, 1500);
    }
  };

  const submitL2Answer = (selectedChart) => {
    if (feedbackL2) return;
    const isCorrect = selectedChart === level.pairs[l2QuestionIdx].chart;
    
    let currentScore = score;
    if (isCorrect) currentScore += 50;
    setScore(currentScore);

    setFeedbackL2(isCorrect ? 'correct' : 'wrong');
    setTimeout(() => {
        setFeedbackL2(null);

        if (l2QuestionIdx + 1 < level.pairs.length) {
          setL2QuestionIdx(l2QuestionIdx + 1);
        } else {
          if (onComplete) onComplete({ score: currentScore });
        }
    }, 1500);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.backBtn} onClick={onHome}>← Back</div>
        <h1 style={{margin:0, fontSize:'24px'}}>{M4_DATA_CINEMA_MODULE.title}</h1>
        <div style={{fontWeight:'bold'}}>Score: {Math.round(score)}</div>
      </div>

      <p style={styles.instruction}>{level.instruction}</p>

      {level.type === 'data_extraction' && (
        <div style={styles.levelContainer}>
          <div style={styles.cinemaScreen}>
            <div style={styles.pictoTitle}>Tickets Sold This Week</div>
            <div style={styles.pictoRow}>
              <div style={styles.pictoDay}>Day 1</div>
              <div style={styles.pictoIcons}>
                <div style={styles.ticketIcon}></div><div style={styles.ticketIcon}></div><div style={styles.ticketIcon}></div><div style={{...styles.ticketIcon, width:'12px'}}></div>
              </div>
            </div>
            <div style={styles.pictoRow}>
              <div style={styles.pictoDay}>Day 2</div>
              <div style={styles.pictoIcons}>
                <div style={styles.ticketIcon}></div><div style={styles.ticketIcon}></div><div style={styles.ticketIcon}></div><div style={styles.ticketIcon}></div><div style={{...styles.ticketIcon, width:'12px'}}></div>
              </div>
            </div>
            <div style={styles.pictoRow}>
               <div style={styles.pictoDay}>Day 4</div>
               <div style={styles.pictoIcons}>
                 <div style={styles.ticketIcon}></div><div style={styles.ticketIcon}></div><div style={styles.ticketIcon}></div><div style={styles.ticketIcon}></div><div style={styles.ticketIcon}></div><div style={{...styles.ticketIcon, width:'12px'}}></div>
               </div>
            </div>
             <div style={styles.pictoRow}>
               <div style={styles.pictoDay}>Day 6</div>
               <div style={styles.pictoIcons}>
                 <div style={styles.ticketIcon}></div><div style={styles.ticketIcon}></div><div style={styles.ticketIcon}></div><div style={styles.ticketIcon}></div><div style={styles.ticketIcon}></div>
               </div>
            </div>
            
            <div style={styles.keyBox}>Key: [Full Ticket] = 20, [Half] = 10</div>
          </div>

          <div style={{...styles.questionCard, borderColor: feedbackL1 === 'correct' ? '#10B981' : (feedbackL1 === 'wrong' ? '#EF4444' : '#BBF7D0')}}>
            {level.questions[l1QuestionIdx].text}
            <div style={styles.answerSlot}>{keypadInput || '_'}</div>
          </div>

          <div style={styles.keypad}>
            {[1,2,3,4,5,6,7,8,9].map(n => (
              <button key={n} style={styles.keypadBtn} onClick={()=>handleKeypad(n)}>{n}</button>
            ))}
            <button style={styles.keypadBtn} onClick={handleClear}>C</button>
            <button style={styles.keypadBtn} onClick={()=>handleKeypad(0)}>0</button>
            <button style={{...styles.keypadBtn, backgroundColor:'#10B981', color:'white'}} onClick={submitL1Answer}>OK</button>
          </div>
        </div>
      )}

      {level.type === 'matching' && (
        <div style={styles.levelContainer}>
          <div style={{...styles.matchScenarioCard, borderColor: feedbackL2 === 'correct' ? '#10B981' : (feedbackL2 === 'wrong' ? '#EF4444' : '#E11D48')}}>
            {level.pairs[l2QuestionIdx].scenario}
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:'16px', padding:'24px', width:'100%', boxSizing:'border-box'}}>
            {level.pairs[l2QuestionIdx].options.map(opt => (
              <button 
                key={opt}
                style={{...styles.keypadBtn, backgroundColor:'#3B82F6', color:'white', width:'100%', padding:'16px'}}
                onClick={() => submitL2Answer(opt)}
                disabled={!!feedbackL2}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { backgroundColor: '#FFE4E6', height: '100vh', display: 'flex', flexDirection: 'column' },
  header: { backgroundColor: '#E11D48', color: 'white', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '0 0 24px 24px' },
  backBtn: { cursor: 'pointer', fontWeight: 'bold' },
  instruction: { padding: '0 24px', textAlign: 'center', fontSize: '18px', color: '#64748B', marginTop: '16px' },
  levelContainer: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' },
  cinemaScreen: { backgroundColor: '#0F172A', color: 'white', margin: '0 24px 16px', borderRadius: '16px', padding: '16px', border: '6px solid #475569', width: '90%', boxSizing: 'border-box' },
  pictoTitle: { textAlign: 'center', fontWeight: 'bold', color: '#FDE047', marginBottom: '8px' },
  pictoRow: { display: 'flex', alignItems: 'center', borderBottom: '1px solid #334155', padding: '8px 0' },
  pictoDay: { width: '60px', fontWeight: 'bold', fontSize: '14px' },
  pictoIcons: { display: 'flex', gap: '4px' },
  ticketIcon: { width: '24px', height: '16px', backgroundColor: '#F43F5E', borderRadius: '2px' },
  keyBox: { fontSize: '14px', color: '#94A3B8', textAlign: 'center', marginTop: '8px', borderTop: '2px dashed #334155', paddingTop: '8px' },
  questionCard: { backgroundColor: '#F0FDF4', border: '2px solid #BBF7D0', padding: '16px', margin: '0 24px 16px', borderRadius: '16px', color: '#166534', fontWeight: '600', width: '90%', boxSizing:'border-box', textAlign:'center', fontSize:'18px' },
  answerSlot: { display: 'inline-block', borderBottom: '2px solid #166534', width: '60px', textAlign: 'center', margin:'0 8px', minHeight:'24px' },
  keypad: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', margin: '0 24px', width: '90%' },
  keypadBtn: { backgroundColor: '#F1F5F9', border: '2px solid #CBD5E1', padding: '12px', fontSize: '24px', fontWeight: 'bold', borderRadius: '8px', color: '#334155', cursor: 'pointer' },
  matchScenarioCard: { backgroundColor: 'white', padding: '24px', border: '4px solid #E11D48', borderRadius: '24px', fontSize: '20px', fontWeight: 'bold', textAlign: 'center', color: '#334155', width: '80%', marginTop: '32px' }
};
