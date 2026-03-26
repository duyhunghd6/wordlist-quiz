import React, { useState, useEffect } from "react";
import "./App.css";
import ProfileSetup from "./components/ProfileSetup";
import StartScreen from "./components/StartScreen";
import Quiz from "./components/Quiz";
import TypingQuiz from "./components/TypingQuiz";
import WordScramble from "./components/WordScramble";
import SwipeCards from "./components/SwipeCards";
import BubblePop from "./components/BubblePop";
import WordSearch from "./components/WordSearch";
import Results from "./components/Results";
import ParentReport from "./components/ParentReport";
import PhotobombGame from "./components/games/PhotobombGame";
import ShapeBuilderGame from "./components/games/ShapeBuilderGame";
import TimelineDetectiveGame from "./components/games/TimelineDetectiveGame";
import MarioTenseRunner from "./components/games/MarioTenseRunner";
import TenseSignalGame from "./components/games/TenseSignalGame";
import EndlessRunner from "./components/games/EndlessRunner/EndlessRunner";
import AngryTensesGame from "./components/games/AngryTenses/AngryTenses";
import ScienceThinkQuiz from "./components/games/ScienceThinkQuiz";
import ScienceMatchGame from "./components/games/ScienceMatchGame";
import ProfileSwitcher from "./components/ProfileSwitcher";
import ErrorBoundary from "./components/ErrorBoundary";
import OfflineBanner from "./components/OfflineBanner";
import ErrorToast from "./components/ErrorToast";
import {
  updateWordLearning,
  getWordsForReview,
  migrateLegacyWeights,
  createDefaultLearning,
} from "./learningAlgorithm";
import {
  useKidProfile,
  usePreferences,
  useGameStats,
  useLocalStorage,
  useProfiles,
  useActivityLog,
} from "./hooks/useLocalStorage";
import { getAvatarById } from "./constants/gameConfig";

function App() {
  // Multi-profile hooks
  const {
    profiles,
    activeProfile,
    activeId,
    createProfile,
    updateProfile: updateProfileInList,
    deleteProfile,
    switchProfile,
  } = useProfiles();

  // Legacy profile hook (for migration)
  const { profile: legacyProfile, updateProfile, isProfileComplete: legacyProfileComplete } = useKidProfile();
  const { preferences, updatePreference } = usePreferences();
  const { activityLog, recordActivity } = useActivityLog();
  const { stats: gameStats, recordGameResult } = useGameStats();

  // Profile switcher modal state
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

  // Use active profile or legacy profile
  const profile = activeProfile || legacyProfile;
  const isProfileComplete = activeProfile ? true : legacyProfileComplete;

  // Game state
  const [wordlist, setWordlist] = useState(null);
  const [tenseSentences, setTenseSentences] = useState(null); // High-quality grammar DB
  const [selectedWordlist, setSelectedWordlist] = useState("");
  const [units, setUnits] = useState([]);
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [numQuestions, setNumQuestions] = useState(10);
  const [selectedGame, setSelectedGame] = useState("quiz");
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [history, setHistory] = useState({});
  const [userAnswers, setUserAnswers] = useState([]);
  const [learningData, setLearningData] = useState({});
  const [showParentReport, setShowParentReport] = useState(false);
  const [errorToast, setErrorToast] = useState(null);
  const [gameHistory] = useLocalStorage('gameHistory', []);

  const wordlists = ["wordlist_esl", "wordlist_math", "wordlist_science"];

  // Load saved data on mount
  useEffect(() => {
    const loadedHistory = JSON.parse(localStorage.getItem("quizHistory")) || {};
    setHistory(loadedHistory);
    
    // Load learning data with migration from legacy format
    const storedData = JSON.parse(localStorage.getItem("learningData"));
    const legacyWeights = JSON.parse(localStorage.getItem("wordWeights"));
    
    if (storedData && storedData.version) {
      setLearningData(storedData);
    } else if (legacyWeights) {
      const migrated = migrateLegacyWeights(legacyWeights);
      setLearningData(migrated);
      localStorage.setItem("learningData", JSON.stringify(migrated));
      localStorage.removeItem("wordWeights");
    } else {
      setLearningData({ version: 1 });
    }
  }, []);

  // Restore preferences ONLY for last subject, everything else is in handleWordlistChange
  useEffect(() => {
    if (preferences.lastSubject && !selectedWordlist) {
      handleWordlistChange(preferences.lastSubject);
    }
    if (preferences.lastGame) {
      setSelectedGame(preferences.lastGame);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferences]);

  const handleWordlistChange = async (selected) => {
    setSelectedWordlist(selected);
    updatePreference('lastSubject', selected);
    
    if (selected) {
      try {
        const response = await fetch(`db/${selected}.json`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setWordlist(data);

        // Load Enterprise Sentence Database if ESL is chosen
        if (selected === 'wordlist_esl') {
            try {
                const tsResponse = await fetch(`db/tense_sentences_esl.toon`);
                if (tsResponse.ok) {
                    const tsText = await tsResponse.text();
                    
                    // Parse official TOON tabular format
                    const lines = tsText.trim().split('\n');
                    // Extract headers from: [250]{id,tense,level,correct_sentence,...}:
                    const headerMatch = lines[0].match(/\{([^}]+)\}/);
                    
                    if (headerMatch) {
                        const headers = headerMatch[1].split(',').map(h => h.trim());
                        const tsData = [];
                        for (let i = 1; i < lines.length; i++) {
                            const line = lines[i].trim();
                            if (!line) continue;
                            // Split by comma for TOON CSV format
                            const values = line.split(',').map(v => v.trim());
                            const obj = {};
                            headers.forEach((header, index) => {
                                obj[header] = values[index];
                            });
                            tsData.push(obj);
                        }
                        setTenseSentences(tsData);
                    }
                }
            } catch (err) {
                console.warn("Could not load tense sentences: ", err);
            }
        } else {
            setTenseSentences(null);
        }

        const uniqueUnits = [
          ...new Set(data.map((item) => item.unit.split(".")[0])),
        ];
        uniqueUnits.sort((a, b) => {
          const numA = parseInt(a, 10);
          const numB = parseInt(b, 10);
          const isNumA = !isNaN(numA);
          const isNumB = !isNaN(numB);

          if (isNumA && isNumB) {
            return numA - numB;
          } else if (isNumA) {
            return -1;
          } else if (isNumB) {
            return 1;
          } else {
            return a.localeCompare(b);
          }
        });
        setUnits(uniqueUnits);

        const currentPrefs = JSON.parse(localStorage.getItem('userPreferences')) || {};
        const savedUnits = currentPrefs[`lastUnits_${selected}`];
        if (savedUnits && Array.isArray(savedUnits) && savedUnits.length > 0) {
            const validUnits = savedUnits.filter(u => uniqueUnits.includes(u));
            if (validUnits.length > 0) {
                setSelectedUnits(validUnits);
            } else {
                setSelectedUnits(uniqueUnits);
            }
        } else {
            setSelectedUnits(uniqueUnits);
        }

        const savedCount = currentPrefs[`lastQuestionCount_${selected}`];
        if (savedCount) {
            setNumQuestions(savedCount);
        } else {
            setNumQuestions(10);
        }
      } catch (err) {
        console.error("Failed to load wordlist:", err);
        setErrorToast({
          message: "Failed to load wordlist data.",
          subtitle: "Please check your network connection or try again later."
        });
      }
    } else {
      setWordlist(null);
      setTenseSentences(null);
      setUnits([]);
      setSelectedUnits([]);
    }
  };

  const handleUnitChange = (eOrUnits) => {
    let newUnits;
    if (eOrUnits && eOrUnits.target) {
      const unit = eOrUnits.target.value;
      newUnits = eOrUnits.target.checked 
        ? [...selectedUnits, unit] 
        : selectedUnits.filter((u) => u !== unit);
    } else {
      newUnits = Array.isArray(eOrUnits) ? eOrUnits : [];
    }
    setSelectedUnits(newUnits);
    updatePreference(`lastUnits_${selectedWordlist}`, newUnits);
  };

  const handleNumQuestionsChange = (num) => {
    setNumQuestions(num);
    updatePreference(`lastQuestionCount_${selectedWordlist}`, num);
  };

  const handleGameChange = (gameId) => {
    setSelectedGame(gameId);
    updatePreference('lastGame', gameId);
  };

  const startQuiz = () => {
    const filteredWords = wordlist.filter((word) =>
      selectedUnits.includes(word.unit.split(".")[0]),
    );

    const selectedWords = getWordsForReview(filteredWords, learningData, numQuestions);

    const selectedQuestions = selectedWords.map((correctWord) => {
      const options = filteredWords
        .filter((w) => w.word !== correctWord.word)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map((w) => w.word);
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

  const startGrammarGame = (gameId) => {
    setSelectedGame(gameId);
    
    // Pick words for the grammar game (we still use words array for scoring context)
    const filteredWords = wordlist ? wordlist.filter((word) =>
      selectedUnits.length > 0 ? selectedUnits.includes(word.unit.split(".")[0]) : true
    ) : [];
    
    const selectedWords = getWordsForReview(filteredWords.length > 0 ? filteredWords : [{word: 'example'}], learningData, numQuestions);
    const grammarQuestions = selectedWords.map(w => ({ ...w }));

    setQuestions(grammarQuestions);
    setQuizStarted(true);
    setShowResults(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setUserAnswers([]);
  };

  const handleAnswer = (selectedOption, responseTimeMs = 5000) => {
    const correctAnswer = questions[currentQuestionIndex].word;
    const isCorrect = selectedOption === correctAnswer;
    
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    
    const currentWordData = learningData[correctAnswer] || createDefaultLearning(correctAnswer);
    const updatedWordData = updateWordLearning(currentWordData, isCorrect, responseTimeMs);
    
    const updatedLearningData = {
      ...learningData,
      [correctAnswer]: updatedWordData,
    };
    setLearningData(updatedLearningData);
    localStorage.setItem("learningData", JSON.stringify(updatedLearningData));
    
    setUserAnswers((prev) => [
      ...prev,
      {
        question: questions[currentQuestionIndex],
        selected: selectedOption,
        isCorrect,
        responseTimeMs,
      },
    ]);

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        setShowResults(true);
        setQuizStarted(false);
      }
    }, isCorrect ? 1500 : 6000); // 1.5s for correct, 6s for wrong (time to learn)
  };

  // Handler for new games (Swipe, Bubble, WordSearch) - they manage their own state
  const handleGameAnswer = (word, isCorrect, responseTimeMs) => {
    // Update learning algorithm
    const currentWordData = learningData[word] || createDefaultLearning(word);
    const updatedWordData = updateWordLearning(currentWordData, isCorrect, responseTimeMs);
    
    const updatedLearningData = {
      ...learningData,
      [word]: updatedWordData,
    };
    setLearningData(updatedLearningData);
    localStorage.setItem("learningData", JSON.stringify(updatedLearningData));
    
    // Find the question object by word
    let questionObj = questions.find(q => q.word === word || q.targetWord === word);
    
    // If not found in primary list, check TenseSentences DB for TOON sentences!
    if (!questionObj && tenseSentences) {
        const ts = tenseSentences.find(t => t.id === word || t.word === word);
        if (ts) {
            questionObj = {
                word: word,
                definition: ts.correct_sentence || ts.sentence || ts.verb_choices || '',
                example: ts.wrong_sentence || '',
                vietnamese: ts.translation || ''
            };
        }
    }
    
    if (!questionObj) {
        questionObj = { word, definition: '' };
    }
    
    // Add to userAnswers for Results display
    setUserAnswers((prev) => [
      ...prev,
      {
        question: questionObj,
        selected: isCorrect ? word : null,
        isCorrect,
        responseTimeMs,
      },
    ]);

    // Update score counter
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  // Go back to home/start screen — unanswered questions count as wrong (quit penalty)
  const goHome = () => {
    if (quizStarted && questions.length > 0) {
      // Count how many questions were answered
      const answeredCount = userAnswers.length;
      const unansweredCount = questions.length - answeredCount;
      
      if (answeredCount > 0 || unansweredCount > 0) {
        // Score = only correct answers out of ALL questions (unanswered = wrong)
        const correctCount = userAnswers.filter(a => a.isCorrect).length;
        const finalScore = Math.round((correctCount / questions.length) * 100);
        
        // Record the partial game result with penalty
        recordGameResult(selectedGame, finalScore);
        recordActivity(selectedWordlist, finalScore, questions.length, correctCount);
      }
    }
    setQuizStarted(false);
    setShowResults(false);
  };

  const saveResult = (name, runnerData = null) => {
    const finalName = name || profile.name || "Anonymous Panda";
    
    let finalScore = 0;
    
    // Handle standard quizzes vs custom game analytics 
    if (runnerData) {
        finalScore = runnerData.score;
        recordGameResult(selectedGame, finalScore);
        // The Heatmap counts total questions & correct answers
        const totalQ = runnerData.totalQuestions || questions.length || 10;
        const correctQ = runnerData.correctCount ?? runnerData.correctAnswers ?? runnerData.totalCorrect ?? 0;
        recordActivity(selectedWordlist, finalScore, totalQ, correctQ);
    } else {
        // Legacy Game / Quiz logic
        const correctCount = userAnswers.filter(a => a.isCorrect).length;
        const wrongCount = userAnswers.filter(a => !a.isCorrect).length;
        const totalAnswered = Math.max(1, correctCount + wrongCount);

        finalScore = Math.round((correctCount / totalAnswered) * 100);
        recordGameResult(selectedGame, finalScore);
        
        recordActivity(selectedWordlist, finalScore, totalAnswered, correctCount);
    }

    const newResult = {
      name: finalName,
      score: finalScore,
      date: new Date().toISOString(),
      game: selectedGame,
    };
    const updatedHistory = { ...history };
    if (!updatedHistory[selectedWordlist]) {
      updatedHistory[selectedWordlist] = [];
    }
    updatedHistory[selectedWordlist].unshift(newResult);
    updatedHistory[selectedWordlist] = updatedHistory[selectedWordlist].slice(0, 5);
    setHistory(updatedHistory);
    localStorage.setItem("quizHistory", JSON.stringify(updatedHistory));
  };

  const playAgain = () => {
    setQuizStarted(false);
    setShowResults(false);
  };

  const handleProfileComplete = (newProfile) => {
    // Create new profile in multi-profile system
    createProfile(newProfile.name, newProfile.avatar);
    // Also update legacy for backwards compatibility
    updateProfile(newProfile);
  };

  const handleProfileClick = () => {
    setShowProfileSwitcher(true);
  };

  const handleEditName = () => {
    setShowProfileSwitcher(true);
    setIsEditingName(true);
  };

  const handleProfileSwitch = (id) => {
    switchProfile(id);
  };

  const handleProfileCreate = (name, avatar) => {
    createProfile(name, avatar);
  };

  const handleProfileUpdate = (id, updates) => {
    updateProfileInList(id, updates);
    // If updating active profile, also update legacy
    if (id === activeId) {
      updateProfile(updates);
    }
  };

  // Get avatar for display
  const currentAvatar = getAvatarById(profile.avatar);

  const renderContent = () => {
    // Show profile setup for new users
    if (!isProfileComplete) {
      return (
        <ProfileSetup
          onComplete={handleProfileComplete}
          initialProfile={profile}
        />
      );
    }

    if (showResults) {
      return (
        <Results
          score={score}
          questions={questions}
          userAnswers={userAnswers}
          playAgain={playAgain}
          saveResult={saveResult}
          playerName={profile.name}
        />
      );
    }

    if (quizStarted) {
      // Render the appropriate game based on selection
      const gameProps = {
        words: questions,
        tenseSentences: tenseSentences, // Pass down the grammar DB for Boss Levels!
        onAnswer: handleGameAnswer,
        onComplete: (results) => {
          if (results && typeof results.score !== 'undefined') {
            setScore(results.score);
          }
          saveResult(profile.name, results || null);
          setShowResults(true);
          setQuizStarted(false);
        },
        onHome: goHome,
        gameId: selectedGame,
      };

      switch (selectedGame) {
        case 'typing':
          return <TypingQuiz {...gameProps} learningData={learningData} />;
        case 'scramble':
          return <WordScramble {...gameProps} />;
        case 'swipe':
          return <SwipeCards {...gameProps} />;
        case 'bubble':
          return <BubblePop {...gameProps} />;
        case 'wordSearch':
          return <WordSearch {...gameProps} />;
        case 'shapeBuilder':
          return <ShapeBuilderGame {...gameProps} />;
        case 'timelineDetective':
          return <TimelineDetectiveGame {...gameProps} />;
        case 'photobomb':
          return <PhotobombGame {...gameProps} />;
        case 'marioTense':
          return <MarioTenseRunner {...gameProps} />;
        case 'tenseSignal':
          return <TenseSignalGame {...gameProps} />;
        case 'angryTenses':
          return <AngryTensesGame {...gameProps} />;
        case 'scienceThinkQuiz':
          return <ScienceThinkQuiz {...gameProps} />;
        case 'scienceMatchGame':
          return <ScienceMatchGame {...gameProps} />;
        case 'endlessRunner':
          return <EndlessRunner {...gameProps} />;
        case 'quiz':
        default:
          return (
            <Quiz
              selectedWordlist={selectedWordlist}
              questions={questions}
              currentQuestionIndex={currentQuestionIndex}
              handleAnswer={handleAnswer}
              answerHistory={userAnswers}
              onHome={goHome}
            />
          );
      }
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
        setSelectedUnits={setSelectedUnits}
        handleUnitChange={handleUnitChange}
        numQuestions={numQuestions}
        setNumQuestions={handleNumQuestionsChange}
        startQuiz={startQuiz}
        // New props for profile & game
        profile={profile}
        avatar={currentAvatar}
        selectedGame={selectedGame}
        onSelectGame={handleGameChange}
        startGrammarGame={startGrammarGame}
        gameStats={gameStats}
        hasPreferences={!!preferences.lastSubject}
        onOpenParentReport={() => setShowParentReport(true)}
        onProfileClick={handleProfileClick}
        onEditName={handleEditName}
      />
    );
  };

  return (
    <div className="App">
      <OfflineBanner />
      {errorToast && (
        <ErrorToast 
          message={errorToast.message}
          subtitle={errorToast.subtitle}
          onClose={() => setErrorToast(null)}
        />
      )}
      <ErrorBoundary>
        {renderContent()}
      </ErrorBoundary>
      {showParentReport && (
        <ParentReport
          profile={profile}
          avatar={currentAvatar}
          learningData={learningData}
          gameStats={gameStats}
          gameHistory={gameHistory}
          activityLog={activityLog}
          onClose={() => setShowParentReport(false)}
        />
      )}
      {showProfileSwitcher && (
        <ProfileSwitcher
          isOpen={showProfileSwitcher}
          onClose={() => { setShowProfileSwitcher(false); setIsEditingName(false); }}
          profiles={profiles.length > 0 ? profiles : (profile?.name ? [{ id: 'legacy', name: profile.name, avatar: profile.avatar }] : [])}
          activeId={activeId || 'legacy'}
          onSwitch={handleProfileSwitch}
          onCreate={handleProfileCreate}
          onUpdate={handleProfileUpdate}
          onDelete={deleteProfile}
        />
      )}
    </div>
  );
}

export default App;
