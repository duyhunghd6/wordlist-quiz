import React, { useState, useEffect } from "react";
import "./App.css";
import ProfileSetup from "./components/ProfileSetup";
import StartScreen from "./components/StartScreen";
import Quiz from "./components/Quiz";
import SwipeCards from "./components/SwipeCards";
import BubblePop from "./components/BubblePop";
import WordSearch from "./components/WordSearch";
import Results from "./components/Results";
import ParentReport from "./components/ParentReport";
import ProfileSwitcher from "./components/ProfileSwitcher";
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
  const { stats: gameStats, recordGameResult } = useGameStats();

  // Profile switcher modal state
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

  // Use active profile or legacy profile
  const profile = activeProfile || legacyProfile;
  const isProfileComplete = activeProfile ? true : legacyProfileComplete;

  // Game state
  const [wordlist, setWordlist] = useState(null);
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

  // Restore preferences when available
  useEffect(() => {
    if (preferences.lastSubject && !selectedWordlist) {
      handleWordlistChange(preferences.lastSubject);
    }
    if (preferences.lastQuestionCount) {
      setNumQuestions(preferences.lastQuestionCount);
    }
    if (preferences.lastGame) {
      setSelectedGame(preferences.lastGame);
    }
  }, [preferences]);

  // Restore selected units when wordlist loads
  useEffect(() => {
    if (units.length > 0 && preferences.lastUnits?.length > 0) {
      const validUnits = preferences.lastUnits.filter(u => units.includes(u));
      if (validUnits.length > 0) {
        setSelectedUnits(validUnits);
      }
    }
  }, [units, preferences.lastUnits]);

  const handleWordlistChange = async (selected) => {
    setSelectedWordlist(selected);
    updatePreference('lastSubject', selected);
    
    if (selected) {
      const response = await fetch(`db/${selected}.json`);
      const data = await response.json();
      setWordlist(data);
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
      setSelectedUnits(uniqueUnits);
    } else {
      setWordlist(null);
      setUnits([]);
      setSelectedUnits([]);
    }
  };

  const handleUnitChange = (e) => {
    const unit = e.target.value;
    const newUnits = e.target.checked 
      ? [...selectedUnits, unit] 
      : selectedUnits.filter((u) => u !== unit);
    setSelectedUnits(newUnits);
    updatePreference('lastUnits', newUnits);
  };

  const handleNumQuestionsChange = (num) => {
    setNumQuestions(num);
    updatePreference('lastQuestionCount', num);
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
    const questionObj = questions.find(q => q.word === word) || { word, definition: '' };
    
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

  // Go back to home/start screen
  const goHome = () => {
    setQuizStarted(false);
    setShowResults(false);
  };

  const saveResult = (name) => {
    const finalName = name || profile.name || "Anonymous Panda";
    
    // Record game result for stats
    const finalScore = Math.round((score / questions.length) * 100);
    recordGameResult(selectedGame, finalScore);

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
        onAnswer: handleGameAnswer,
        onComplete: (results) => {
          // Game complete - trigger results screen
          setShowResults(true);
          setQuizStarted(false);
        },
        onHome: goHome,
        gameId: selectedGame,
      };

      switch (selectedGame) {
        case 'swipe':
          return <SwipeCards {...gameProps} />;
        case 'bubble':
          return <BubblePop {...gameProps} />;
        case 'wordSearch':
          return <WordSearch {...gameProps} />;
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
      {renderContent()}
      {showParentReport && (
        <ParentReport
          profile={profile}
          avatar={currentAvatar}
          learningData={learningData}
          gameStats={gameStats}
          gameHistory={gameHistory}
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
