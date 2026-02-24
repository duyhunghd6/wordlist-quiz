import React, { useMemo } from 'react';
import { Calendar, TrendingUp } from 'lucide-react';
import './ActivityHeatmap.css';

const SUBJECTS = [
  { id: 'wordlist_esl', name: 'ESL', color: '#22c55e' },
  { id: 'wordlist_math', name: 'Math', color: '#3b82f6' },
  { id: 'wordlist_science', name: 'Science', color: '#a855f7' }
];

const getWeekRanges = (numWeeks = 12) => {
  const weeks = [];
  const today = new Date();
  
  const currentDay = today.getDay();
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() + mondayOffset);
  thisMonday.setHours(0, 0, 0, 0);
  
  for (let i = numWeeks - 1; i >= 0; i--) {
    const weekStart = new Date(thisMonday);
    weekStart.setDate(thisMonday.getDate() - (i * 7));
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    weeks.push({
      start: weekStart,
      end: weekEnd,
      label: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    });
  }
  
  return weeks;
};

const getWeekDates = (weekStart) => {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

const getActivityLevel = (data) => {
  if (!data) return 0;
  const total = data.questions || 0;
  if (total === 0) return 0;
  if (total <= 5) return 1;
  if (total <= 15) return 2;
  if (total <= 30) return 3;
  return 4;
};

const getWeekStats = (activityLog, weekDates, subjectId) => {
  let totalQuestions = 0;
  let totalCorrect = 0;
  let totalPoints = 0;
  
  weekDates.forEach(date => {
    const dayData = activityLog[date]?.[subjectId];
    if (dayData) {
      totalQuestions += dayData.questions || 0;
      totalCorrect += dayData.correct || 0;
      totalPoints += dayData.points || 0;
    }
  });
  
  return { totalQuestions, totalCorrect, totalPoints };
};

const ActivityHeatmap = ({ activityLog = {} }) => {
  const weeks = useMemo(() => getWeekRanges(12), []);
  
  const cellData = useMemo(() => {
    const data = {};
    
    weeks.forEach((week, weekIndex) => {
      const weekDates = getWeekDates(week.start);
      
      SUBJECTS.forEach(subject => {
        const stats = getWeekStats(activityLog, weekDates, subject.id);
        const level = getActivityLevel(stats);
        
        data[`${weekIndex}-${subject.id}`] = {
          ...stats,
          level,
          weekLabel: week.label,
          subjectName: subject.name
        };
      });
    });
    
    return data;
  }, [weeks, activityLog]);
  
  const hasActivity = Object.values(cellData).some(cell => cell.level > 0);

  return (
    <div style={{ padding: 'var(--space-xl)', overflow: 'hidden', flexShrink: 0, width: '100%', boxSizing: 'border-box' }}>
      <h2 style={{ fontSize: '1.2rem', margin: '0 0 var(--space-md) 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-primary)' }}>
        <Calendar size={20} color="var(--color-info)" />
        Learning Activity
      </h2>
      
      <div className="heatmap-container" style={{ margin: '0 -var(--space-md)', padding: '0 var(--space-md)', background: 'transparent' }}>
        <div className="heatmap-weeks-header">
          <div className="heatmap-subject-label-spacer"></div>
          {weeks.map((week, i) => (
            <div key={i} className="heatmap-week-label" style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              {i % 2 === 0 ? week.label : ''}
            </div>
          ))}
        </div>
        
        {SUBJECTS.map(subject => (
          <div key={subject.id} className="heatmap-row">
            <div className="heatmap-subject-label" style={{ color: 'var(--color-text-secondary)' }}>{subject.name}</div>
            <div className="heatmap-cells">
              {weeks.map((week, weekIndex) => {
                const cell = cellData[`${weekIndex}-${subject.id}`];
                return (
                  <div
                    key={weekIndex}
                    className={`heatmap-cell level-${cell?.level || 0}`}
                    title={cell?.totalQuestions > 0 
                      ? `${cell.subjectName} - ${cell.weekLabel}\n${cell.totalQuestions} questions\n${cell.totalCorrect} correct\n${cell.totalPoints} points`
                      : `${subject.name} - ${week.label}\nNo activity`
                    }
                  />
                );
              })}
            </div>
          </div>
        ))}
        
        <div className="heatmap-legend" style={{ marginTop: 'var(--space-lg)' }}>
          <span className="legend-label" style={{ fontWeight: 600 }}>Less</span>
          <div className="legend-cells">
            <div className="heatmap-cell level-0"></div>
            <div className="heatmap-cell level-1"></div>
            <div className="heatmap-cell level-2"></div>
            <div className="heatmap-cell level-3"></div>
            <div className="heatmap-cell level-4"></div>
          </div>
          <span className="legend-label" style={{ fontWeight: 600 }}>More</span>
        </div>
      </div>
      
      {!hasActivity && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: 'var(--space-md)', marginTop: 'var(--space-md)', backgroundColor: '#EFF6FF', color: 'var(--color-info)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.9rem' }}>
          <TrendingUp size={18} />
          <span>Complete quizzes to see your activity here!</span>
        </div>
      )}
    </div>
  );
};

export default ActivityHeatmap;
