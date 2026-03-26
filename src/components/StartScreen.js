import React from 'react';
import GameJourney from './GameJourney';

const StartScreen = ({
  wordlists,
  selectedWordlist,
  handleWordlistChange,
  history,
  wordlist,
  units,
  selectedUnits,
  setSelectedUnits,
  handleUnitChange,
  numQuestions,
  setNumQuestions,
  startQuiz,
  profile,
  avatar,
  selectedGame,
  onSelectGame,
  gameStats,
  hasPreferences,
  onOpenParentReport,
  onProfileClick,
  onEditName,
  startGrammarGame,
}) => {
  
  return (
    <GameJourney 
      wordlists={wordlists}
      selectedWordlist={selectedWordlist}
      handleWordlistChange={handleWordlistChange}
      profile={profile}
      avatar={avatar}
      onProfileClick={onProfileClick}
      onEditName={onEditName}
      onOpenParentReport={onOpenParentReport}
      startQuiz={startQuiz}
      startGrammarGame={startGrammarGame}
      onSelectGame={onSelectGame}
      selectedGame={selectedGame}
      units={units}
      selectedUnits={selectedUnits}
      setSelectedUnits={handleUnitChange}
      numQuestions={numQuestions}
      setNumQuestions={setNumQuestions}
    />
  );
};

export default StartScreen;