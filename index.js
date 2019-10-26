import React, { Component } from 'react';
import { render } from 'react-dom';
import { Button, Checkbox, Container, Message, Label, Dropdown, Segment, Modal, Header } from 'semantic-ui-react'

import './style.css';

import { Word, Sentence, Result, TestInputField, Highscore, History } from './typr.js'
import words_de from './words_de.js'
import words_en from './words_en.js'
import words_es from './words_es.js'
import words_tr from './words_tr.js'

class App extends Component {
  wordsAmount = 30;
  dictionarys = [
    { flag: 'us', text: "English", value: "words_en", dictionary: words_en },
    { flag: 'de', text: "German", value: "words_de", dictionary: words_de },
    { flag: 'es', text: "Spanish", value: "words_es", dictionary: words_es },
    { flag: 'tr', text: "Turkish", value: "words_tr", dictionary: words_tr },
  ];

  gameModes = {
    sprint: { text: "Sprint", value: "sprint", content: <Header size='tiny' content='Sprint' subheader='Type 30 random words as fast as possible' /> },
    suddenDeath: { text: "Sudden Death", value: "suddenDeath", content: <Header size='tiny' content='Sudden Death' subheader='Test your accuracy by typing error free as long as possible' /> },
    typoGrind: { text: "Typo Grind", value: "typoGrind", content: <Header size='tiny' content='Typo Grind' subheader='Repeat mistyped words until you get them right 10 times in a row' /> },
    transcription: { text: "Transcription", value: "transcription", content: <Header size='tiny' content='Transcription' subheader='Type words blind and see the result later' /> }
  }
  defaultDictionary = "words_en"
  defaultGameMode = "sprint"
  constructor() {
    super();

    this.state = this.initialState();
    this.handleChange = this.handleChange.bind(this);
    this.resetTest = this.resetTest.bind(this);
    this.toggleIgnoreCase = this.toggleIgnoreCase.bind(this);
    this.setDictionary = this.setDictionary.bind(this);
    this.setGameMode = this.setGameMode.bind(this);
    //localStorage.clear()
  }

  initialState() {
    let wl = this.generateWordList();

    let ignoreCase = (this.state && this.state.ignoreCase) ? true : localStorage.getItem("config.ignoreCase");
    let gameMode = this.getGameMode();
    let activeDictionary = this.getActiveDictionary();

    let state = {
      activeDictionary: activeDictionary,
      test: wl.words,
      total_words: wl.words.length,
      sentence: wl.sentence.trim(),
      sentence_length: wl.sentence.trim().length,
      typed_words: 0,
      typed_value: '',
      test_start: 0,
      test_end: 0,
      keystrokes: 0,
      ignoreCase: ignoreCase,
      gameMode: gameMode,
      firstLineIds: [],
      duration_in_sec: 0,
      cpm: 0,
      wpm: 0,
      score: 0,
      modalOpen: true
    };

    return state;
  }

  isTestStarted() {
    if (this.state.test_start)
      return true;
    else
      return false;
  }

  resetTest(checkIfTestFinished) {
    if (checkIfTestFinished && !this.state.test_end)
      return null;

    this.setState(this.initialState)
  }

  getGameMode() {
    let backup = (localStorage.getItem("config.gameMode"))
      ? localStorage.getItem("config.gameMode")
      : this.defaultGameMode;

    let gameMode = (this.state && this.state.gameMode) ? this.state.gameMode : backup;

    return gameMode;
  }

  setGameMode(e, { name, value }) {
    localStorage.setItem("config.gameMode", value)

    this.setState({ gameMode: value }, () => (this.resetTest()))
  }

  getActiveDictionary() {
    let backupDict = (localStorage.getItem("config.activeDictionary"))
      ? localStorage.getItem("config.activeDictionary")
      : this.defaultDictionary;
    let dict = (this.state && this.state.activeDictionary)
      ? this.state.activeDictionary
      : backupDict;

    return dict
  }

  getDictionary() {
    let gameMode = this.getGameMode();

    if (gameMode == this.gameModes.typoGrind.value) {
      let dict = JSON.parse(localStorage.getItem("errorList" + this.getActiveDictionary()));
      if (dict)
        return Object.keys(dict);

    }

    return this.dictionarys.find(i => {
      return i.value == this.getActiveDictionary();
    }).dictionary
  }

  setDictionary(e, { name, value }) {
    localStorage.setItem("config.activeDictionary", value)

    this.setState({ activeDictionary: value }, () => (this.resetTest()));
  }

  generateWordList(words) {
    words = (!words) ? this.wordsAmount : words;
    var selected = [];
    let sentence = '';
    let dictionary = this.getDictionary();

    for (var i = 0; i < words; i++) {
      let w = dictionary[Math.floor(Math.random() * dictionary.length)]
      selected[i] = { w: '' }
      selected[i].w = w;
      sentence += w + ' ';
    }

    return { words: selected, sentence: sentence }
  }

  appendWords(words) {
    let wl = this.generateWordList(words);

    let test = this.state.test;
    test.push(wl.words[0])

    let sentence = this.state.sentence + ' ' + wl.sentence.trim();
    this.setState({
      test: test,
      sentence: sentence,
      total_words: test.length,
      sentence_length: sentence.length
    });
  }

  toggleIgnoreCase() {
    let toggle = !this.state.ignoreCase
    this.setState({ ignoreCase: toggle })

    localStorage.setItem("config.ignoreCase", toggle)
  }

  calculateResult(test) {
    let duration_in_sec = test.test_end / 1000;
    let cpm = Math.round(test.sentence_length * 60 / duration_in_sec);
    let wpm = Math.round(cpm / 5);
    let score = Math.round(test.sentence_length * wpm / 100);

    let result = {
      date: Date.now(),
      gameMode: test.gameMode,
      duration_in_sec: duration_in_sec,
      sentence_length: test.sentence_length,
      cpm: cpm,
      wpm: wpm,
      score: score,
    };

    this.setState(result);
    return result;
  }

  saveHighscore(state) {
    console.log('saving result for ' + state.gameMode)
    let result = this.calculateResult(state);

    this.state.score = result.score;
    if (typeof (Storage) !== "undefined") {
      let currentScore = JSON.parse(localStorage.getItem("highscore_" + state.gameMode));
      // Store
      if (!currentScore || currentScore.score < result.score)
        localStorage.setItem("highscore_" + state.gameMode, JSON.stringify(result));

      let currentHistory = JSON.parse(localStorage.getItem("history_" + state.gameMode));
      if (!currentHistory)
        currentHistory = [];

      if (result.duration_in_sec >= 10 && result.wpm >= 20)
        currentHistory.push(result);

      localStorage.setItem("history_" + state.gameMode, JSON.stringify(currentHistory))
    } else {
      alert('Your Browser does not support local storage')
    }
  }

  saveError(word) {
    let listName = "errorList" + this.getActiveDictionary();
    let currentList = JSON.parse(localStorage.getItem(listName));

    if (!currentList) {
      currentList = {};
    }

    currentList[word] = { count: 10 };

    localStorage.setItem(listName, JSON.stringify(currentList));
  }

  deductError(word) {
    let listName = "errorList" + this.getActiveDictionary();
    let currentList = JSON.parse(localStorage.getItem(listName));

    if (!currentList) {
      currentList = {};
    }

    if (currentList[word] && currentList[word].count) {
      currentList[word] = { count: currentList[word].count - 1 };
      if (currentList[word].count <= 0)
        delete currentList[word];
    }

    localStorage.setItem(listName, JSON.stringify(currentList));
  }

  getHighscore(gameMode) {
    if (!gameMode)
      gameMode = this.getGameMode();

    let score = JSON.parse(localStorage.getItem("highscore_" + gameMode));

    if (score)
      return score;
  }

  getHistory(gameMode) {
    if (!gameMode)
      gameMode = this.getGameMode();

    let history = JSON.parse(localStorage.getItem("history_" + gameMode));

    if (history)
      return history;
  }
  handleSuddenDeath(state) {
    if (state.gameMode == this.gameModes.suddenDeath.value) {
      state.test_end = Date.now() - state.test_start;

      let activeTest = state.test[state.typed_words]

      /*
       if the first character is wrong sometimes the programm gets so fast to
       this point that the difference between start and end 0 miliseconds is
       */
      if (state.test_end < 1)
        state.test_end = 1;

      state.total_words = state.typed_words;

      let length = 0;
      for (var i = 0; i < state.typed_words; i++) {
        length += state.test[i].w.length
      }
      state.sentence_length = length + state.typed_words + activeTest.should.length - 1

      this.setState(state);

      this.saveHighscore(state);

      return false
    }
  }
  setActiveWordClass(test) {
    test.should = test.w.substr(0, test.typed.length);

    if (this.state.ignoreCase) {
      test.should = test.should.toLowerCase()
      test.typed = test.typed.toLowerCase()
    }

    if (this.getGameMode() != this.gameModes.transcription.value)
      test.c = (test.should == test.typed) ? 'active' : 'active-incorrect';
  }
  handleDelete(event) {
    let widx = this.state.typed_words;
    let test = this.state.test;
    let activeTest = test[widx];

    activeTest.typed = activeTest.typed.substr(0, activeTest.typed.length - 1);

    let lastChar = activeTest.realTyped.substr(-1);

    if (lastChar != '}') {
      activeTest.realTyped = activeTest.realTyped.slice(0, -1) + '{' + lastChar + '}';
    } else {
      let openerPos = activeTest.realTyped.lastIndexOf('{');
      let r = activeTest.realTyped;
      let opener = '{';
      //activeTest.realTyped = 
      if (openerPos > 0) {
        let rBeg = r.substr(0, openerPos - 1);
        if (rBeg.substr(-1) == '}') {
          rBeg = rBeg.slice(0, -1);
          opener = '';
        }
        let rMid = r.substr(openerPos - 1, 1);
        let rEnd = r.substr(openerPos + 1);
        activeTest.realTyped = rBeg + opener + rMid + rEnd;
      }
    }

    this.setActiveWordClass(activeTest);

    this.setState({ test: test, typed_value: activeTest.typed });
    this.handleSuddenDeath(this.state);
  }
  handleChange(event) {
    if (event.key == 'Backspace') {
      this.handleDelete(event);
      return null;
    }
    let val = (event.key.length == 1) ? event.key : '';
    let lastChar = val;

    let state = this.state;
    let widx = this.state.typed_words;
    let test = this.state.test;
    let activeTest = test[widx];

    if (!activeTest || state.test_end)
      return false;

    if (!activeTest.s) {
      if (!state.test_start)
        state.test_start = Date.now()

      activeTest.s = Date.now();
    }

    this.state.keystrokes++;

    if (!activeTest.realTyped)
      activeTest.realTyped = '';

    activeTest.realTyped += lastChar;

    if (!activeTest.typed)
      activeTest.typed = '';

    activeTest.typed += val;
    let val_length = activeTest.typed.length;
    let new_val = (lastChar == ' ') ? '' : activeTest.typed;

    if (this.getGameMode() == 'transcription') {
      new_val = ''

      let base = 'Keep typing ...'

      event.target.placeholder = base;
    }

    this.setState({ typed_value: new_val, test_start: state.test_start });


    if (activeTest.typed.length > activeTest.w.length)
      activeTest.typed = activeTest.typed.trim();

    this.setActiveWordClass(activeTest);

    /*
      don't save errors if Backspace is pressed to avoid double counts
    */
    if (activeTest.should != activeTest.typed && event.key != 'Backspace') {
      if (!activeTest.errors)
        activeTest.errors = []

      activeTest.errors.push({ is: activeTest.typed, should: activeTest.should })

      if (activeTest.errors.length <= 1)
        this.saveError(activeTest.w);

      this.handleSuddenDeath(state);
    } else if (widx + 1 == test.length && activeTest.w == activeTest.typed) {
      // set last char to space to force final validation and end of test
      lastChar = ' '
    }

    if (val_length >= 2 && lastChar == ' ') {

      if (widx < test.length) {
        if (activeTest.w === activeTest.typed.trim()) {
          activeTest.c = 'correct';

          this.deductError(activeTest.w);
        } else {
          activeTest.c = 'incorrect';
          state.sentence_length -= activeTest.w.length + 1;
          activeTest.isWrong = true;
        }

        activeTest.e = Date.now() - activeTest.s;
        let nextIndex = widx + 1;

        if (nextIndex < test.length) {
          test[nextIndex].c = 'active';

          state.firstLineIds.push('' + (widx))

          let activeElement = document.getElementById('w' + (widx));
          let nextElement = document.getElementById('w' + nextIndex);

          if (activeElement.offsetTop != nextElement.offsetTop) {
            let popped;
            while (popped = state.firstLineIds.pop()) {
              test[popped].c = 'hidden';
            }
          }

        } else {
          /*
          TEST IS FINISHED FOR WHAT EVER REASON
          */
          state.test_end = Date.now() - state.test_start;

          this.saveHighscore(state);
        }

        this.setState({ test: test, typed_words: nextIndex, test_end: state.test_end });

        if (state.gameMode == this.gameModes.suddenDeath.value) {
          this.appendWords(1);
        }
      }
    }
  }

  render() {
    return (
      <Container text>
        <Message>
          <Message.Header>New here?</Message.Header>
          <Message.List>
            <Message.Item>Start typing to activate the test</Message.Item>
            <Message.Item>Activate the <strong>'Sudden Death'</strong> mode to see how long you can type error free</Message.Item>
            <Message.Item>Your 'Sudden Death' score is calculated according to this formula: Typed characters * WPM</Message.Item>
            <Message.Item>To have your score saved in the history you need to type in 'Sudden Death' mode error free for longer than 10 seconds with a  minimum of 20 WPM</Message.Item>
            <Message.Item>If you want to test your speed on a mobile device activate the 'Ignore Case' option</Message.Item>
            <Message.Item>After finishing or failing a test you can start a new test by pressing the 'Enter' key</Message.Item>
            <Message.Item>Activate the <strong>'Typo Grind'</strong> mode to repeat your mistyped words until you get them right 10 times in a row</Message.Item>
          </Message.List>
        </Message>
        <Highscore score={this.getHighscore()} gameModeDescriptions={this.gameModes} />

        <Segment attached='top' disabled={this.isTestStarted()} >

          I want to type {' '}
          <Dropdown inline options={this.dictionarys} defaultValue={(this.state && this.state.activeDictionary) ? this.state.activeDictionary : this.defaultDictionary} disabled={this.isTestStarted()} onChange={this.setDictionary} />words in <Dropdown inline options={Object.keys(this.gameModes).map(key => this.gameModes[key])} onChange={this.setGameMode} defaultValue={this.getGameMode()} disabled={this.isTestStarted()} /> mode
            <br /><Checkbox label='ignore Case' checked={this.state.ignoreCase} onChange={this.toggleIgnoreCase} toggle disabled={this.isTestStarted()} />
        </Segment>

        <Sentence words={this.state.test} />

        <TestInputField ref='input' v={this.state.typed_value} ch={this.handleChange} reset={this.resetTest} />
        {(this.state.test_end) ? <Label pointing>Press Enter key to start a new test</Label> : ''}

        <History history={this.getHistory()} gameModeDescriptions={this.gameModes} />

        <Modal open={(this.state.test_end > 0)} onClose={() => { this.resetTest(); }} closeIcon>
          <Modal.Header>{(this.getGameMode() == 'suddenDeath') ? 'You are dead' : 'Your Result'}</Modal.Header>
          <Modal.Content>
            <Modal.Description>
              <Result test={this.state} />
            </Modal.Description>
          </Modal.Content>
        </Modal>
      </Container>
    );
  }
}

render(<App />, document.getElementById('root'));
