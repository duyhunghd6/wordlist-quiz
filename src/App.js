import React, { useState, useEffect } from 'react';
import './App.css';
import StartScreen from './components/StartScreen';
import Quiz from './components/Quiz';
import Results from './components/Results';

function App() {
  const [wordlist, setWordlist] = useState(null);
  const [selectedWordlist, setSelectedWordlist] = useState('');
  const [units, setUnits] = useState([]);
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [numQuestions, setNumQuestions] = useState(10);
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [history, setHistory] = useState({});
  const [userAnswers, setUserAnswers] = useState([]);
  const [wordWeights, setWordWeights] = useState({});
  const [playerName, setPlayerName] = useState('');

  const wordlists = ['wordlist_esl', 'wordlist_math', 'wordlist_science'];

  useEffect(() => {
    const loadedHistory = JSON.parse(localStorage.getItem('quizHistory')) || {};
    setHistory(loadedHistory);
    const loadedWeights = JSON.parse(localStorage.getItem('wordWeights')) || {};
    setWordWeights(loadedWeights);
    const loadedName = localStorage.getItem('playerName') || '';
    setPlayerName(loadedName);
  }, []);

  const handleWordlistChange = async selected => {
    setSelectedWordlist(selected);
    if (selected) {
      const response = await fetch(`db/${selected}.json`);
      const data = await response.json();
      setWordlist(data);
      const uniqueUnits = [...new Set(data.map(item => item.unit.split('.')[0]))];
      setUnits(uniqueUnits);
      setSelectedUnits(uniqueUnits);
    } else {
      setWordlist(null);
      setUnits([]);
      setSelectedUnits([]);
    }
  };

  const handleUnitChange = e => {
    const unit = e.target.value;
    setSelectedUnits(prev =>
      e.target.checked ? [...prev, unit] : prev.filter(u => u !== unit)
    );
  };

  const startQuiz = () => {
    const filteredWords = wordlist.filter(word =>
      selectedUnits.includes(word.unit.split('.')[0])
    );

    const weightedShuffle = () => {
      const shuffled = [];
      const weightedList = [];

      filteredWords.forEach(word => {
        const weight = wordWeights[word.word] || 1;
        for (let i = 0; i < weight; i++) {
          weightedList.push(word);
        }
      });

      while (shuffled.length < numQuestions && weightedList.length > 0) {
        const randomIndex = Math.floor(Math.random() * weightedList.length);
        const selectedWord = weightedList[randomIndex];
        if (!shuffled.find(q => q.word === selectedWord.word)) {
          shuffled.push(selectedWord);
        }
        // Remove all instances of the selected word to avoid duplicates
        for (let i = weightedList.length - 1; i >= 0; i--) {
          if (weightedList[i].word === selectedWord.word) {
            weightedList.splice(i, 1);
          }
        }
      }
      return shuffled;
    };

    const selectedQuestions = weightedShuffle().map(correctWord => {
      const options = filteredWords
        .filter(w => w.word !== correctWord.word)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(w => w.word);
      options.push(correctWord.word);
      return {
        ...correctWord,
        options: options.sort(() => 0.5 - Math.random()),
      };
    });

    setQuestions(selectedQuestions);
    setQuizStarted(true);
    setShowResults(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setUserAnswers([]);
  };

  const handleAnswer = selectedOption => {
    const correctAnswer = questions[currentQuestionIndex].word;
    const isCorrect = selectedOption === correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 1);
    } else {
      const updatedWeights = { ...wordWeights };
      const currentWeight = updatedWeights[correctAnswer] || 1;
      updatedWeights[correctAnswer] = currentWeight * 2;
      setWordWeights(updatedWeights);
      localStorage.setItem('wordWeights', JSON.stringify(updatedWeights));
    }
    setUserAnswers(prev => [
      ...prev,
      { question: questions[currentQuestionIndex], selected: selectedOption, isCorrect },
    ]);

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setShowResults(true);
        setQuizStarted(false);
      }
    }, 3000);
  };

  const saveResult = (name) => {
    const finalName = name || 'Anonymous Panda';
    setPlayerName(finalName);
    localStorage.setItem('playerName', finalName);

    const newResult = {
      name: finalName,
      score: (score / questions.length) * 100,
      date: new Date().toISOString(),
    };
    const updatedHistory = { ...history };
    if (!updatedHistory[selectedWordlist]) {
      updatedHistory[selectedWordlist] = [];
    }
    updatedHistory[selectedWordlist].unshift(newResult);
    updatedHistory[selectedWordlist] = updatedHistory[selectedWordlist].slice(0, 3);
    setHistory(updatedHistory);
    localStorage.setItem('quizHistory', JSON.stringify(updatedHistory));
  };

  const playAgain = () => {
    setQuizStarted(false);
    setShowResults(false);
    setSelectedWordlist('');
    setWordlist(null);
  };

  const renderContent = () => {
    if (showResults) {
      return (
        <Results
          score={score}
          questions={questions}
          userAnswers={userAnswers}
          playAgain={playAgain}
          saveResult={saveResult}
          playerName={playerName}
        />
      );
    }

    if (quizStarted) {
      return (
        <Quiz
          selectedWordlist={selectedWordlist}
          questions={questions}
          currentQuestionIndex={currentQuestionIndex}
          handleAnswer={handleAnswer}
        />
      );
    }

    return (
      <StartScreen
        wordlists={wordlists}
        selectedWordlist={selectedWordlist}
        handleWordlistChange={handleWordlistChange}
        history={history}
        wordlist={wordlist}
        units={units}
        selectedUnits={selectedUnits}
        handleUnitChange={handleUnitChange}
        numQuestions={numQuestions}
        setNumQuestions={setNumQuestions}
        startQuiz={startQuiz}
      />
    );
  };

  return <div className="App">{renderContent()}</div>;
}

export default App;
