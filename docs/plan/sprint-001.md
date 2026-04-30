a small ESL review-question loader plus 2 new review games, while reusing    
  existing games for vocab and tense-choice practice.
                               
  What exists now                     
                                
  - ESL journey has 5 nodes in src/components/GameJourney.js:14:                                                                                                          
    - esl_1: swipe, quiz, bubble   
    - esl_2: wordSearch, scramble, shapeBuilder                                                                                                                           
    - esl_3: photobomb, tenseSignal                                                                                                                                       
    - esl_4: typing, timelineDetective, angryTenses
    - esl_5: marioTense, endlessRunner                                                                                                                                    
  - Grammar games are registered in src/constants/gameConfig.js:27.                                                                                                     
  - ESL wordlist data loads from public/db/wordlist_esl.json in src/App.js:133.                                                                                           
  - Existing grammar games mostly generate their own questions or use public/db/tense_sentences_esl.toon, loaded in src/App.js:139.                                       
  - handleGameAnswer already supports custom question objects for result review in src/App.js:339, so new question-bank games can report real worksheet questions without 
  rewriting the results system.                                                                                                                                           
                                                                                                                                                                          
  Question banks found                                                                                                                                                    
                                                                                                                                                                          
  Total: 185 questions                                                                                                                                                    
                                                                                                                                                                          
  ┌──────────────────────┬───────┬──────────────────────────────────────────────────────────────┐                                                                         
  │         Bank         │ Count │                           Best fit                           │                                                                         
  ├──────────────────────┼───────┼──────────────────────────────────────────────────────────────┤                                                                       
  │ matching             │    10 │ Existing/new match game                                      │                                                                         
  ├──────────────────────┼───────┼──────────────────────────────────────────────────────────────┤                                                                       
  │ fill_given_words     │    10 │ New word-bank fill game                                      │                                                                         
  ├──────────────────────┼───────┼──────────────────────────────────────────────────────────────┤                                                                       
  │ fill_passage         │    10 │ New passage fill game                                        │                                                                         
  ├──────────────────────┼───────┼──────────────────────────────────────────────────────────────┤                                                                       
  │ multiple_choice      │    50 │ Existing quiz-style game or new ESL review quiz              │                                                                         
  ├──────────────────────┼───────┼──────────────────────────────────────────────────────────────┤                                                                         
  │ grammar_completion   │    90 │ New grammar builder/fill game + existing Angry Tenses subset │                                                                         
  ├──────────────────────┼───────┼──────────────────────────────────────────────────────────────┤                                                                         
  │ reading_find_words   │    10 │ New reading hunt game                                        │                                                                         
  ├──────────────────────┼───────┼──────────────────────────────────────────────────────────────┤                                                                         
  │ reading_short_answer │     5 │ New reading response/check game                              │                                                                         
  └──────────────────────┴───────┴──────────────────────────────────────────────────────────────┘                                                                         
                                                                                                                                                                          
  Proposed data architecture                                                                                                                                              
                                                                                                                                                                          
  Move/copy the question banks from docs into public runtime data:                                                                                                        
                                                                                                                                                                        
  public/db/esl/review_tenses/                                                                                                                                            
    matching.json                                                                                                                                                         
    fill_given_words.json                                                                                                                                                 
    fill_passage.json                                                                                                                                                     
    multiple_choice.json                                                                                                                                                  
    grammar_completion.json                                                                                                                                               
    reading_find_words.json                                                                                                                                               
    reading_short_answer.json                                                                                                                                             
    manifest.json                                                                                                                                                         
                                                                                                                                                                          
  Add one loader in App.js beside the current TOON loader:                                                                                                                
                                                                                                                                                                          
  fetch('db/esl/review_tenses/manifest.json')                                                                                                                             
                                                                                                                                                                          
  Then pass eslReviewQuestions into gameProps near src/App.js:520.                                                                                                        
                                                                                                                                                                          
  This keeps docs/requirements/... as source/reference and makes public/db/... the app-consumable database.                                                               
                                                                                                                                                                        
  Existing games to reuse                                                                                                                                                 
                                                                                                                                                                        
  1. Quiz                                                                                                                                                                 
  
  Use for:                                                                                                                                                                
  - Vocabulary - Multiple Choice                                                                                                                                        
  - Reading - Multiple Choice                                                                                                                                             
  - Grammar - Multiple Choice - Would you like                                                                                                                          
  - Grammar - Multiple Choice - Present Continuous Future                                                                                                                 
  - Grammar - Multiple Choice - Future Forms                                                                                                                              
                                                                                                                                                                          
  Reason: these already have option_A–option_D, answer, and answer_text.                                                                                                  
                                                                                                                                                                          
  Needed change:                                                                                                                                                          
  - Add an ESL review quiz adapter that maps:                                                                                                                             
                                                                                                                                                                          
  {
    definition: q.question,                                                                                                                                               
    word: q.answer_text,                                                                                                                                                  
    options: [option_A, option_B, option_C, option_D].filter(Boolean),                                                                                                    
    explanation: q.category,                                                                                                                                              
    example: q.passage || '',                                                                                                                                             
  }                                                                                                                                                                       
                                                                                                                                                                        
  2. ScienceMatchGame pattern, not component directly                                                                                                                     
                                                                                                                                                                        
  Use the same connection mechanic for:                                                                                                                                   
  - Vocabulary - Matching                                                                                                                                               
                                                                                                                                                                          
  Current ScienceMatchGame expects word + definition pairs from a wordlist, so I’d either:                                                                              
  - generalize it into MatchGame, or                                                                                                                                      
  - create EslMatchingGame using the same UI mechanics.                                                                                                                   
                                                                                                                                                                          
  Given the data has term, option_A...option_J, and answer_text, a dedicated EslMatchingGame is cleaner.                                                                  
                                                                                                                                                                          
  3. AngryTenses                                                                                                                                                          
                                                                                                                                                                          
  Use selectively for:                                                                                                                                                    
  - grammar completion items that have a single blank and a small word_bank                                                                                             
  - present simple, past continuous, present perfect, modals, prepositions                                                                                                
                                                                                                                                                                        
  But it is not enough by itself because many grammar_completion answers contain multiple slots, e.g. "wakes up; prepares".                                               
                                                                                                                                                                          
  4. TenseSignalGame                                                                                                                                                      
                                                                                                                                                                          
  Keep as-is for signal-word noticing, but optionally expand later using worksheet grammar categories:                                                                    
  - present simple signal words                                                                                                                                         
  - present perfect signal words                                                                                                                                          
  - past continuous when/while                                                                                                                                          
  - future time expressions                                                                                                                                               
                                                                                                                                                                        
  It currently uses hardcoded tenseSignalData, so don’t force the review JSON into it in phase 1.                                                                         
                                                                                                                                                                          
  New games I recommend                                                                                                                                                   
                                                                                                                                                                          
  A. EslReviewQuiz                                                                                                                                                        
                                                                                                                                                                        
  Purpose: turn multiple-choice and simple completion banks into a child-friendly review quiz.                                                                            
                                                                                                                                                                        
  Covers:                                                                                                                                                                 
  - all 50 multiple_choice                                                                                                                                              
  - some single-answer grammar_completion                                                                                                                                 
                                         
  Design:                                                                                                                                                                 
  - question card                                                                                                                                                         
  - 3–4 large answer buttons                                                                                                                                              
  - optional passage panel for reading questions                                                                                                                          
  - immediate visual/haptic feedback                                                                                                                                      
  - result review using customQuestionObj                                                                                                                                 
                                                                                                                                                                          
  Best journey placement:                                                                                                                                                 
  - Add to esl_3 or esl_5                                                                                                                                               
                                                                                                                                                                          
  { id: 'eslReviewQuiz', name: 'Review Quiz', isGrammar: true }                                                                                                         
                                                                                                                                                                          
  B. WordBankBuilder                                                                                                                                                      
                                                                                                                                                                          
  Purpose: handle “fill in with given words” and grammar completion with word banks.                                                                                      
                                                                                                                                                                        
  Covers:                                                                                                                                                                 
  - fill_given_words                                                                                                                                                    
  - fill_passage                                                                                                                                                          
  - grammar_completion rows with word_bank
  - prepositions, modals, relative clauses, like/about                                                                                                                    
                                                                                                                                                                          
  Design:                                                                                                                                                                 
  - sentence/passage with one highlighted blank at a time                                                                                                                 
  - draggable/tappable word-bank chips                                                                                                                                    
  - “presence check” scaffolding for Vietnamese learners:                                                                                                               
    - force auxiliaries like is/are/was/were/have/has                                                                                                                     
    - visually mark missing helper verbs                                                                                                                                  
    - use shape coding: Subject = red oval, auxiliary = small yellow bridge, verb = blue hexagon                                                                          
  - for passage mode, progress blank-by-blank rather than asking the child to fill all 10 at once.                                                                        
                                                                                                                                                                          
  Best journey placement:                                                                                                                                                 
  - Replace or supplement shapeBuilder in esl_2                                                                                                                           
  - Add to esl_4 for active recall                                                                                                                                        
                                                                                                                                                                          
  C. ReadingExplorer                                                                                                                                                      
                                                                                                                                                                          
  Purpose: make reading comprehension interactive instead of plain text input.                                                                                            
                                                                                                                                                                          
  Covers:                                                                                                                                                                 
  - reading_find_words                                                                                                                                                  
  - reading_short_answer                                                                                                                                                  
  - Reading - Multiple Choice                                                                                                                                           
                                                                                                                                                                          
  Design:                                                                                                                                                                 
  - passage shown in scrollable card                                                                                                                                      
  - “Find word” questions: child taps/highlights the phrase in the passage                                                                                                
  - short answer: show 3 answer cards generated from acceptable answers, or use guided chips instead of free typing for Grade 3                                         
  - multiple choice: reuse quiz interaction after passage reading                                                                                                         
                                                                                                                                                                          
  Best journey placement:                                                                                                                                                 
  - Add to esl_5 as a mastery reading challenge.                                                                                                                          
                                                                                                                                                                          
  D. Optional: TagQuestionBuilder                                                                                                                                         
                                                                                                                                                                          
  Purpose: dedicated game for tag questions because Vietnamese learners need auxiliary polarity noticing.                                                                 
                                                                                                                                                                          
  Covers:                                                                                                                                                                 
  - Grammar - Completion - Tag Questions                                                                                                                                
                                                                                                                                                                          
  Design:                                                                                                                                                               
  - split sentence into:                                                                                                                                                  
    - statement polarity: positive/negative                                                                                                                             
    - helper verb: is/are/do/does/did/have/will/can
    - pronoun                                                                                                                                                             
  - child builds the tag from chips:                                                                                                                                      
    - isn’t + she                                                                                                                                                         
    - did + they                                                                                                                                                          
  - visual rule: positive statement pushes to negative tag, negative statement pushes to positive tag.                                                                    
                                                                                                                                                                          
  This could also be part of WordBankBuilder, but a dedicated game would teach the pattern better.                                                                        
                                                                                                                                                                          
  Suggested revised ESL journey                                                                                                                                           
                                                                                                                                                                          
  Update src/components/GameJourney.js:17 to align with PPP/TBLT progression:                                                                                             
  
  1. Vocab Warm-up                                                                                                                                                        
    - swipe, quiz, bubble                                                                                                                                               
    - Units 6–9 vocabulary recognition                                                                                                                                    
  2. Word Meaning & Form                                                                                                                                                  
    - wordSearch, scramble, eslMatching                                                                                                                                   
    - matching, spelling, definition recognition                                                                                                                          
  3. Grammar Noticing                                                                                                                                                     
    - shapeBuilder, tenseSignal, eslReviewQuiz                                                                                                                            
    - inductive pattern spotting                                                                                                                                          
  4. Grammar Building                                                                                                                                                     
    - wordBankBuilder, angryTenses, timelineDetective                                                                                                                     
    - active construction and tense choice                                                                                                                                
  5. Reading Mission                                                                                                                                                      
    - readingExplorer, endlessRunner, marioTense                                                                                                                          
    - passage comprehension + mixed mastery                                                                                                                               
                                                                                                                                                                          
  Implementation plan                                                                                                                                                     
                                                                                                                                                                          
  1. Add runtime question data                                                                                                                                            
    - Copy normalized JSON to public/db/esl/review_tenses/.
    - Add manifest.json grouping by bank and category.                                                                                                                    
  2. Add loader                                                                                                                                                           
    - Extend ESL loading in src/App.js:139 to fetch review banks.                                                                                                         
    - Add eslReviewQuestions state.                                                                                                                                       
    - Pass it through gameProps.                                                                                                                                          
  3. Add question normalization utility                                                                                                                                   
    - Convert each raw bank item into shared shapes:                                                                                                                      
        - multipleChoice                                                                                                                                                  
      - matching                                                                                                                                                          
      - wordBank                                                                                                                                                          
      - readingFind                                                                                                                                                       
      - shortAnswer                                                                                                                                                       
    - Add eslReviuwQuestionsostate.estion_number.                                                                                                                         
  4. Crast it through gamePr ps.                                                                                                                                          
  3 -Add question normalization utility                                                                                                                                   
    - Conv ruleacherawobankbitem into shared shapes:                                                                                                                      
        - multipleChoice  i     jects via onAnswer.                                                                                                                       
  5. C- matching    i                                                                                                                                                     
    - - wordBank           tyle.                                                                                                                                          
      - readingFinda     _                                                                                                                                                
  6. C- shortAnswer                                                                                                                                                       
    - Preserve source, category,gquestion_number.                                                                                                                         
  4. Create EslReviewQuiz f       f      iliaries/prepositions.                                                                                                           
  7. CFastest win.   p                                                                                                                                                    
    - Uses multiple-choice bank.t and guided answer mode.                                                                                                                 
  8. RReports cumtom question objects via onAnswer.                                                                                                                       
  5 -Create EslMatchingGamenstants/gameConfig.js.                                                                                                                         
    - Reusr Scernce Match style.                                                                                                                                          
    - Maps term to answer_text.          rney.js:17.                                                                                                                      
  6. Create WordBankBuilder                                                                                                                                               
    - Handlesesentencegand passage fills.least one game.                                                                                                                  
    - Add shape-coded scaffolding forl uxiliaries/prepositions. correct answer, and explanation/category.                                                                 
  7. Create ReadingExplorer    n      u       e        d       c               t   s                                                                                      
      Passage-based tap/highlight and guided answer mode.                                                                                                                 
  8.iRegister gamesdation                                                                                                                                                 
    - Add entries in src/constants/gameConfig.js.                                                                                                                         
  Bu-lAddnrenderocases in src/App.js:537.                                                                                                                                 
    - Add node  in src/components/GameJourney.js:17.                                                                                                                    
  9. QAlReviewQuiz — highest reuse, covers 50 questions quickly.                                                                                                       
      - shortAnswer
    - Preserve source, category, question_number.
      - shortAnswer
    - Preserve source, category, question_number.
  4. Create EslReviewQuiz
      - shortAnswer
    - Preserve source, category, question_number.
  4. Create EslReviewQuiz
      - shortAnswer
    - Preserve source, category, question_number.
      - shortAnswer
    - Preserve source, category, question_number.
      - shortAnswer
    - Preserve source, category, question_number.
  4. Create EslReviewQuiz
    - Fastest win.
    - Uses multiple-choice bank.
    - Reports custom question objects via onAnswer.
  5. Create EslMatchingGame
    - Reuse Science Match style.
    - Maps term to answer_text.
  6. Create WordBankBuilder
    - Handles sentence and passage fills.
    - Add shape-coded scaffolding for auxiliaries/prepositions.
  7. Create ReadingExplorer
    - Passage-based tap/highlight and guided answer mode.
  8. Register games
    - Add entries in src/constants/gameConfig.js.
    - Add render cases in src/App.js:537.
    - Add nodes in src/components/GameJourney.js:17.
  9. QA
    - Verify each category appears in at least one game.
    - Check result review shows actual prompt, selected answer, correct answer, and explanation/category.
    - Run mobile viewport testing because these are Grade 3 touch-first interactions.

  Priority recommendation

  Build in this order:

  1. EslReviewQuiz — highest reuse, covers 50 questions quickly.
  2. EslMatchingGame — covers vocab matching cleanly.
  3. WordBankBuilder — covers the largest and most important grammar/passage bank.
  4. ReadingExplorer — best mastery activity, but needs more UI work.
  5. Optional TagQuestionBuilder — strong pedagogy, especially for auxiliary/polarity practice.