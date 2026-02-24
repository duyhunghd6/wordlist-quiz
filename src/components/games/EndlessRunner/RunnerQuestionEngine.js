import { useState, useCallback, useEffect, useRef } from 'react';

// Utility for shuffling arrays
const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

// Simple anagram creator for spelling options
const createSpellingDistractors = (wordStr) => {
    const upper = wordStr.toUpperCase();
    
    const swapMiddle = (str) => {
        const arr = str.split('');
        if (arr.length <= 3) return str + 'S';
        const mid = Math.floor(arr.length / 2);
        const temp = arr[mid];
        arr[mid] = arr[mid - 1];
        arr[mid - 1] = temp;
        return arr.join('');
    };

    const dropVowel = (str) => {
        const vowels = ['A', 'E', 'I', 'O', 'U'];
        const arr = str.split('');
        for (let i = 1; i < arr.length - 1; i++) {
            if (vowels.includes(arr[i])) {
                arr[i] = vowels[(vowels.indexOf(arr[i]) + 1) % 5];
                return arr.join('');
            }
        }
        return str.substring(1) + str[0]; // fallback rotation
    };

    let d1 = swapMiddle(upper);
    let d2 = dropVowel(upper);
    
    // Ensure absolute uniqueness. Fallback to basic string manipulation if conflicts occur
    if (d1 === upper) d1 = upper + 'S';
    if (d2 === upper || d2 === d1) d2 = 'X' + upper.substring(1);

    return [
        { id: 1, text: upper, isCorrect: true },
        { id: 2, text: d1, isCorrect: false },
        { id: 3, text: d2, isCorrect: false }
    ];
};

// Helper to mock grammatically incorrect sentence for True/False tense questions
const mockWrongTense = (sentence) => {
    let wrong = sentence;
    // Swap common auxiliaries to test grammatical awareness
    if (/\b(is|are)\b/i.test(wrong)) {
        wrong = wrong.replace(/\bis\b/gi, 'are').replace(/\bare\b/gi, 'is');
    } else if (/\b(was|were)\b/i.test(wrong)) {
        wrong = wrong.replace(/\bwas\b/gi, 'were').replace(/\bwere\b/gi, 'was');
    } else if (/\b(has|have)\b/i.test(wrong)) {
        wrong = wrong.replace(/\bhas\b/gi, 'have').replace(/\bhave\b/gi, 'has');
    } else {
        // Fallback: mess up the verb suffix
        if (/ing\b/i.test(wrong)) {
            wrong = wrong.replace(/ing\b/gi, 'ed');
        } else if (/ed\b/i.test(wrong)) {
            wrong = wrong.replace(/ed\b/gi, 'ing');
        } else {
            // Absolute fallback for sentences without obvious aux/suffixes
            wrong = wrong.replace(/[aeiou]/, 'x');
        }
    }
    return wrong;
};

/**
 * RunnerQuestionEngine Hook (Enterprise Grade)
 * Pedagogically sound procedural engine that scales difficulty based on a 6-tier system.
 * Level 1: Short Word Spelling (<6 letters)
 * Level 2: Long Word Spelling (>=6 letters)
 * Level 3: Definition Match (Active Recall)
 * Level 4: Contextual Fill-in-the-Blank (Grammar)
 * Level 5: Tense True/False (Sentence Grammar Evaluation)
 * Level 6: Interleaved Mixed 'Boss' Mode
 */
export const useRunnerEngine = (words = [], tenseSentences = []) => {
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [streak, setStreak] = useState(0);
    const [level, setLevel] = useState(1);
    const [maxLevel, setMaxLevel] = useState(1);
    
    // Spaced Repetition System (SRS) - Track error weights across the session
    const errorWeights = useRef({}); // { "word_string": error_count }
    const recentWords = useRef([]);  // Array to prevent repetition
    const lastTargetWord = useRef(null); // Track last word to update its error weight

    // Determine level purely based on consecutive correct streak to maintain flow state.
    const currentLevel = Math.min(6, Math.floor(streak / 5) + 1);

    // Update level state if it changes
    useEffect(() => {
        if (currentLevel !== level) {
            setLevel(currentLevel);
            if (currentLevel > maxLevel) {
                setMaxLevel(currentLevel);
            }
        }
    }, [currentLevel, level, maxLevel]);

    const generateQuestion = useCallback((typeOverride = null) => {
        if (!words || words.length === 0) return null;

        // Flashcard SRS + Anti-Repetition picking algorithm
        const pickRandomWord = (filterFn) => {
            let filtered = words.filter(filterFn);
            
            // Filter out recently seen words to prevent looping.
            // If the filter is too aggressive (e.g. out of valid words), shrink the history.
            let validWords = filtered.filter(w => !recentWords.current.includes(w.word));
            if (validWords.length === 0) {
                recentWords.current = []; // Reset if we run out of valid words
                validWords = filtered;
            }
            if (validWords.length === 0) {
                return words[Math.floor(Math.random() * words.length)]; // Final fallback
            }

            // Create a weighted pool prioritizing missed words.
            const pool = [];
            validWords.forEach(w => {
                const mistakes = errorWeights.current[w.word] || 0;
                // Base weight 1, add heavy weight for mistakes
                const weight = 1 + (mistakes * 5);
                for (let i = 0; i < weight; i++) {
                    pool.push(w);
                }
            });

            const picked = pool[Math.floor(Math.random() * pool.length)];
            
            // Add to recent words buffer (remember the last 25 words)
            recentWords.current.push(picked.word);
            if (recentWords.current.length > 25) {
                recentWords.current.shift();
            }
            
            return picked;
        };

        const pickRandomSentence = () => {
            if (!tenseSentences || tenseSentences.length === 0) return null;
            
            let filtered = tenseSentences;
            let validSentences = filtered.filter(ts => !recentWords.current.includes(ts.id));
            if (validSentences.length === 0) {
                validSentences = filtered; // Reset pool if exhausted
            }

            const pool = [];
            validSentences.forEach(ts => {
                const mistakes = errorWeights.current[ts.id] || 0;
                const weight = 1 + (mistakes * 5); // SRS scaling
                for (let i = 0; i < weight; i++) {
                    pool.push(ts);
                }
            });

            const picked = pool[Math.floor(Math.random() * pool.length)];
            
            recentWords.current.push(picked.id);
            if (recentWords.current.length > 25) {
                recentWords.current.shift();
            }
            
            return picked;
        };

        const pickTwoDistractors = (correctWord) => {
            // Strictly filter out the correct word, AND any word that has the identical spelling (case insensitive)
            const pool = words.filter(w => 
                w.word.toLowerCase() !== correctWord.word.toLowerCase()
            );
            
            // Randomly shuffle the pool and take the first two
            const shuffled = shuffleArray(pool);
            let d1Text = shuffled[0] ? shuffled[0].word : "Apple";
            let d2Text = shuffled[1] ? shuffled[1].word : "Banana";
            
            // Extreme edge case fallback to guarantee no visual duplicates
            if (d1Text.toLowerCase() === d2Text.toLowerCase()) {
                d2Text += "s";
            }

            return [
                { id: 1, text: correctWord.word, isCorrect: true },
                { id: 2, text: d1Text, isCorrect: false },
                { id: 3, text: d2Text, isCorrect: false }
            ];
        };

        // Determine question type based on level
        let qType = typeOverride;
        if (!qType) {
            if (currentLevel === 1) qType = 'SPELLING_EASY';
            else if (currentLevel === 2) {
                const types = ['SPELLING_HARD', 'TENSE_TF'];
                qType = types[Math.floor(Math.random() * types.length)];
            }
            else if (currentLevel === 3) {
                const types = ['DEFINITION', 'TENSE_TF'];
                qType = types[Math.floor(Math.random() * types.length)];
            }
            else if (currentLevel === 4) {
                const types = ['CONTEXT', 'TENSE_TF'];
                qType = types[Math.floor(Math.random() * types.length)];
            }
            else if (currentLevel === 5) {
                qType = 'TENSE_TF';
            }
            else {
                // Level 6 Interleaved Mix
                const types = ['SPELLING_HARD', 'DEFINITION', 'CONTEXT', 'TENSE_TF'];
                qType = types[Math.floor(Math.random() * types.length)];
            }
        }

        let newQuestion = { id: Date.now(), type: qType, options: [] };
        let target = null;

        if (qType === 'SPELLING_EASY') {
            target = pickRandomWord(w => w.word.length <= 5);
            newQuestion.sentence = ""; // No prompt needed for pure spelling
            newQuestion.options = shuffleArray(createSpellingDistractors(target.word));
        } 
        else if (qType === 'SPELLING_HARD') {
            target = pickRandomWord(w => w.word.length > 5);
            newQuestion.sentence = "";
            newQuestion.options = shuffleArray(createSpellingDistractors(target.word));
        }
        else if (qType === 'DEFINITION') {
            target = pickRandomWord(w => w.definition && w.definition.length > 0);
            newQuestion.sentence = `Meaning: ${target.definition}`;
            newQuestion.options = shuffleArray(pickTwoDistractors(target));
        }
        else if (qType === 'CONTEXT') {
            target = pickRandomWord(w => w.example && w.example.toLowerCase().includes(w.word.toLowerCase()));
            let prompt = target.example || "No example found.";
            
            // Blank out the target word in the sentence
            const regex = new RegExp(`\\b${target.word}\\b`, 'gi');
            prompt = prompt.replace(regex, '______');
            
            newQuestion.sentence = prompt;
            newQuestion.options = shuffleArray(pickTwoDistractors(target));
        }
        else if (qType === 'TENSE_TF') {
            // Enterprise Grammar Bank (Level 5 Boss)
            const ts = pickRandomSentence();
            if (ts) {
                // Track it so we don't repeat the exact same sentence id immediately
                target = { word: ts.id }; // Overload target to be the sentence id
                
                const showWrong = Math.random() > 0.5;
                const displaySentence = showWrong ? ts.wrong_sentence : ts.correct_sentence;

                newQuestion.sentence = displaySentence;
                // Add the pedagogical focus so UI CAN optionally display it if they wanted on game over
                newQuestion.pedagogical_focus = ts.pedagogical_focus;
                newQuestion.options = [
                    { id: 1, text: 'True ✓', isCorrect: !showWrong },
                    { id: 2, text: 'False ✗', isCorrect: showWrong }
                ];
            } else {
                // Fallback if the database failed to load completely
                target = pickRandomWord(w => w.example && w.example.length > 10);
                const makeWrong = Math.random() > 0.5;
                let displaySentence = target.example;
                if (makeWrong) {
                    displaySentence = mockWrongTense(displaySentence);
                }

                newQuestion.sentence = displaySentence;
                newQuestion.options = [
                    { id: 1, text: 'True ✓', isCorrect: !makeWrong },
                    { id: 2, text: 'False ✗', isCorrect: makeWrong }
                ];
            }
        }

        if (target) {
            lastTargetWord.current = target.word;
        }

        setCurrentQuestion(newQuestion);
    }, [words, tenseSentences, currentLevel]);

    const processAnswer = useCallback((isCorrect) => {
        if (isCorrect) {
            setStreak(prev => prev + 1);
        } else {
            // Drop them down slightly to maintain Flow State without crushing them fully
            setStreak(prev => Math.max(0, prev - 2)); 
            
            // Log the error in the SRS weighting table
            if (lastTargetWord.current) {
                const word = lastTargetWord.current;
                errorWeights.current[word] = (errorWeights.current[word] || 0) + 1;
                // If they got it wrong, remove it from the recent history buffer 
                // faster so it can show up again sooner (Spaced Repetition)
                recentWords.current = recentWords.current.filter(w => w !== word);
            }
        }
        // Defer next generation to let the UI show feedback gracefully
    }, []);

    // Initial payload
    useEffect(() => {
        if (words && words.length > 0 && !currentQuestion) {
            generateQuestion();
        }
    }, [words, currentQuestion, generateQuestion]);

    return {
        currentQuestion,
        level,
        maxLevel,
        streak,
        processAnswer,
        generateNext: generateQuestion
    };
};
