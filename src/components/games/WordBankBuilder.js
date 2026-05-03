import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { makeReviewResultQuestion } from '../../utils/eslReviewNormalizer';
import './EslReviewGames.css';

const PICKER_ITEM_HEIGHT = 50;
const BLANK_PATTERN = /____________________|_{3,}(?:\s*\(\d+\))?/;

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

const uniqueClean = (items) => [
  ...new Set(
    items
      .filter((item) => item !== null && item !== undefined)
      .map((item) => String(item).trim())
      .filter(Boolean),
  ),
];

const sentenceWindow = (text, startIndex, endIndex) => {
  const before = text.slice(0, startIndex);
  const after = text.slice(endIndex);
  const boundaryStart = Math.max(
    before.lastIndexOf('. '),
    before.lastIndexOf('? '),
    before.lastIndexOf('! '),
  );
  const boundaryEndCandidates = ['. ', '? ', '! ']
    .map((boundary) => after.indexOf(boundary))
    .filter((index) => index >= 0);
  const windowStart = boundaryStart >= 0 ? boundaryStart + 2 : 0;
  const windowEnd = boundaryEndCandidates.length
    ? endIndex + Math.min(...boundaryEndCandidates) + 1
    : text.length;

  return text.slice(windowStart, windowEnd).trim();
};

const splitPromptAroundBlank = (question) => {
  const source = question.passage || question.sentence || question.prompt || question.question || '';

  if (question.passage && question.question_number) {
    const targetPattern = new RegExp(`_{3,}\\s*\\(${question.question_number}\\)`);
    const passageMatch = targetPattern.exec(source);

    if (passageMatch) {
      const focusedText = sentenceWindow(
        source,
        passageMatch.index,
        passageMatch.index + passageMatch[0].length,
      );
      const focusedMatch = targetPattern.exec(focusedText);

      if (focusedMatch) {
        return {
          before: focusedText.slice(0, focusedMatch.index),
          after: focusedText.slice(focusedMatch.index + focusedMatch[0].length),
        };
      }
    }
  }

  const match = BLANK_PATTERN.exec(source);
  if (!match) {
    return { before: source ? `${source} ` : '', after: '' };
  }

  return {
    before: source.slice(0, match.index),
    after: source.slice(match.index + match[0].length),
  };
};

const buildOptions = (question, pool) => {
  const correct = question.correctAnswer;
  const directBank = uniqueClean(question.wordBank || question.word_bank || []);
  const sameCategoryAnswers = pool
    .filter((item) => item.id !== question.id && item.category === question.category)
    .map((item) => item.correctAnswer);
  const fallbackAnswers = pool
    .filter((item) => item.id !== question.id)
    .map((item) => item.correctAnswer);
  const sourceOptions = directBank.length ? directBank : [...sameCategoryAnswers, ...fallbackAnswers];
  const limit = directBank.length ? Math.max(directBank.length, 4) : 4;
  const distractors = shuffle(uniqueClean(sourceOptions).filter((option) => option !== correct))
    .slice(0, Math.max(0, limit - 1));

  return shuffle(uniqueClean([correct, ...distractors]));
};

const WordBankBuilder = ({
  eslReviewQuestions,
  onAnswer,
  onComplete,
  onHome,
  words = [],
  numQuestions,
  isAllQuestions = false,
}) => {
  const questions = useMemo(() => {
    const banks = eslReviewQuestions?.banks || {};
    const items = [
      ...(banks.fill_given_words || []),
      ...(banks.fill_passage || []),
      ...(banks.grammar_completion || []).filter(
        (question) => question.wordBank?.length > 0 || !question.correctAnswer.includes(';'),
      ),
    ].filter((question) => question.correctAnswer);

    const count = isAllQuestions
      ? items.length
      : Math.min(numQuestions || words?.length || 10, items.length);

    return shuffle(items)
      .slice(0, count)
      .map((question) => ({
        ...question,
        promptParts: splitPromptAroundBlank(question),
        options: buildOptions(question, items),
      }));
  }, [eslReviewQuestions, isAllQuestions, numQuestions, words?.length]);

  const [index, setIndex] = useState(0);
  const [activeOption, setActiveOption] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(null);
  const [score, setScore] = useState(0);

  const viewportRef = useRef(null);
  const lastTapRef = useRef(0);
  const advanceTimerRef = useRef(null);

  const current = questions[index];

  useEffect(() => () => {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
  }, []);

  useEffect(() => {
    setActiveOption(0);
    setSelectedAnswer(null);
    setConfirmed(false);
    setIsCorrectAnswer(null);
  }, [index]);

  useEffect(() => {
    if (viewportRef.current && !viewportRef.current._userScrolling) {
      viewportRef.current.scrollTo({
        top: activeOption * PICKER_ITEM_HEIGHT,
        behavior: 'smooth',
      });
    }
  }, [activeOption]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || confirmed) return undefined;

    let scrollTimer = null;
    const handleScroll = () => {
      viewport._userScrolling = true;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        viewport._userScrolling = false;
        const centered = Math.round(viewport.scrollTop / PICKER_ITEM_HEIGHT);
        if (current && centered >= 0 && centered < current.options.length) {
          setActiveOption(centered);
        }
      }, 80);
    };

    viewport.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      viewport.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimer);
    };
  }, [confirmed, current, index]);

  const finish = useCallback((finalScore) => {
    onComplete({
      score: Math.round((finalScore / questions.length) * 100),
      totalQuestions: questions.length,
      correctCount: finalScore,
    });
  }, [onComplete, questions.length]);

  const advanceQuestion = useCallback((nextScore, correct) => {
    advanceTimerRef.current = setTimeout(() => {
      if (index < questions.length - 1) {
        setIndex((currentIndex) => currentIndex + 1);
      } else {
        finish(nextScore);
      }
    }, correct ? 900 : 1700);
  }, [finish, index, questions.length]);

  const confirmSelection = useCallback(() => {
    if (confirmed || !current) return;

    const selected = current.options[activeOption] || current.options[0];
    const correct = selected === current.correctAnswer;
    const nextScore = correct ? score + 1 : score;

    setSelectedAnswer(selected);
    setConfirmed(true);
    setIsCorrectAnswer(correct);
    setScore(nextScore);
    onAnswer(current.correctAnswer, correct, 3000, makeReviewResultQuestion(current), selected);
    advanceQuestion(nextScore, correct);
  }, [activeOption, advanceQuestion, confirmed, current, onAnswer, score]);

  useEffect(() => {
    const handler = (event) => {
      if (confirmed || !current) return;

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveOption((option) => Math.max(0, option - 1));
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveOption((option) => Math.min(current.options.length - 1, option + 1));
      } else if (event.key === 'Enter') {
        event.preventDefault();
        confirmSelection();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [confirmSelection, confirmed, current]);

  const handleOptionTap = (optionIndex) => {
    if (confirmed) return;

    const now = Date.now();
    if (optionIndex === activeOption && now - lastTapRef.current < 400) {
      confirmSelection();
    } else {
      setActiveOption(optionIndex);
    }
    lastTapRef.current = now;
  };

  if (!current) {
    return (
      <div className="esl-review-game">
        <div className="esl-review-card">
          <p className="esl-review-prompt">Word bank questions are still loading.</p>
          <button className="esl-review-action" onClick={onHome}>Back home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="esl-review-game word-bank-builder">
      <header className="esl-review-header">
        <button className="esl-review-back" onClick={onHome}>←</button>
        <div className="esl-review-title">
          <h1>Word Bank Builder</h1>
          <p>Complete the sentence with the word bank.</p>
        </div>
      </header>

      <main className="esl-review-card wbb-card">
        <div className="esl-review-progress">
          <span>Blank {index + 1} of {questions.length}</span>
          <span>{score} correct</span>
        </div>

        <span className="esl-review-category">
          {current.passage && current.question_number
            ? `${current.category} · Blank ${current.question_number}`
            : current.category}
        </span>

        <div className={`wbb-sentence-display ${current.passage ? 'wbb-passage-display' : ''}`}>
          <span>{current.promptParts.before}</span>

          <span className="wbb-scroll-picker">
            <span className="wbb-scroll-arrow wbb-arrow-up">▲</span>
            <span className="wbb-picker-viewport" ref={viewportRef}>
              <span className="wbb-picker-track">
                {current.options.map((option, optionIndex) => {
                  let className = 'wbb-picker-item';
                  if (optionIndex === activeOption) className += ' wbb-picker-active';
                  if (confirmed && optionIndex === activeOption) {
                    className += isCorrectAnswer ? ' wbb-picker-correct' : ' wbb-picker-wrong';
                  }
                  if (confirmed && option === current.correctAnswer) {
                    className += ' wbb-picker-answer';
                  }

                  return (
                    <span
                      key={`${current.id}-${option}`}
                      className={className}
                      onClick={() => handleOptionTap(optionIndex)}
                    >
                      {option}
                    </span>
                  );
                })}
              </span>
            </span>
            <span className="wbb-picker-highlight"></span>
            <span className="wbb-scroll-arrow wbb-arrow-down">▼</span>
          </span>

          <span>{current.promptParts.after}</span>
        </div>

        {confirmed && (
          <div className={`esl-review-feedback ${isCorrectAnswer ? 'correct' : 'wrong'}`}>
            {isCorrectAnswer ? 'Great choice!' : `Good try. Correct answer: ${current.correctAnswer}`}
          </div>
        )}

        {!confirmed && (
          <button className="esl-review-action wbb-confirm" onClick={confirmSelection}>
            Choose {current.options[activeOption]}
          </button>
        )}

        {selectedAnswer && (
          <div className="wbb-selected-answer" aria-live="polite">
            {selectedAnswer}
          </div>
        )}
      </main>
    </div>
  );
};

export default WordBankBuilder;
