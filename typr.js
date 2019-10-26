import React from 'react'
import { Input, Segment, Table, Button, Icon, Statistic, Container, Header } from 'semantic-ui-react'

import LineBarAreaComposedChart from './charts.js'

class TestInputField extends React.Component {
  constructor(props) {
    super(props);
  }

  handleRef = (c) => {
    this.inputRef = c
  }
  defaultPlaceholder = 'Type here ...'
  reset = () => {
    this.inputRef.focus();
    this.props.reset();
    this.placeholder = this.defaultPlaceholder
  }
  placeholder = this.defaultPlaceholder
  render() {
    return (
      <Input
        ref={this.handleRef}
        placeholder={this.placeholder}
        value={this.props.v}
        //onChange={this.props.ch}
        onKeyPress={event => {
          if (event.key === 'Enter') {
            this.props.reset(true)
          } else {
            this.props.ch(event);
          }
        }}
        onKeyDown={event => {
          if (event.key === 'Backspace') {
            this.props.ch(event);
          }
        }
        }
        action={<Button onClick={this.reset} icon>
          <Icon name='refresh' size='large' />
        </Button>}
        fluid />
    )
  }
}

const Word = ({ s, c, id }) => (
  <span id={'w' + id} className={'word ' + c}>{s}</span>
)

const Sentence = ({ words }) => (
  <Segment size='massive' className='sentence' attached='bottom'>
    <div style={{ height: '3.1em', overflow: 'hidden', lineHeight: '120%' }}>
      {
        words.map(
          (v, i) => (
            <Word key={i} c={v.c} s={v.w} id={i} />
          )
        )
      }
    </div>
  </Segment>

)
const WordStat = ({ word }) => (
  <Table.Row className={(word.isWrong) ? 'incorrect' : ''}>
    <Table.Cell>{word.w} {(word.errors) ? <div dangerouslySetInnerHTML={{ __html: word.realTyped.split('{').join('<strike>').split('}').join('</strike>') }} /> : ''}</Table.Cell>
    <Table.Cell>{(!word.isWrong && word.e) ? Math.round((word.w.length * 60 / (word.e / 1000)) / 5) : '-'}</Table.Cell>
    <Table.Cell textAlign='right'>{(!word.isWrong && word.e) ? word.e / 1000 : '-'}</Table.Cell>
  </Table.Row>

)
const Result = ({ test }) => (
  <Segment>
    Sec: {test.duration_in_sec}<br />
    Words: {test.total_words}<br />
    Characters: {test.sentence_length} / Keystrokes: {test.keystrokes}<br />
    Accuracy: {'coming soon'}<br />
    CPM: {test.cpm}<br />
    WPM: {test.wpm}<br />
    {(test.gameMode == 'suddenDeath') ? 'Score:' + test.score : ''}
    <br />

    <Table unstackable>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Word</Table.HeaderCell>
          <Table.HeaderCell>WPM</Table.HeaderCell>
          <Table.HeaderCell textAlign='right'>Sec</Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {test.test.map((v, i) => ((v.e || v.isWrong) ? <WordStat word={v} key={i} /> : ''))}
      </Table.Body>
    </Table>
  </Segment>
)

const Highscore = ({ score, gameModeDescriptions }) => (
  (score) ?

    <Container text>
      <Header as='h2' textAlign='center'>{gameModeDescriptions[score.gameMode].text} Highscore</Header>
      <Statistic.Group widths={3}>
        <Statistic>
          <Statistic.Value>{((score.duration_in_sec > 60) ? Math.floor(score.duration_in_sec / 60) + ':' : '') + ("0" + Math.round(score.duration_in_sec % 60)).slice(-2)}</Statistic.Value>
          <Statistic.Label>{(score.duration_in_sec > 60) ? 'Minutes' : 'Sec'}</Statistic.Label>
        </Statistic>

        <Statistic>
          <Statistic.Value>{score.wpm}</Statistic.Value>
          <Statistic.Label>WPM</Statistic.Label>
        </Statistic>

        <Statistic>
          <Statistic.Value>{score.score}</Statistic.Value>
          <Statistic.Label>Score</Statistic.Label>
        </Statistic>
      </Statistic.Group>
    </Container> : <u>Finish a test to set your score</u>
)

const History = ({ history, gameModeDescriptions }) => (
  (history instanceof Array && history.length > 0) ?
    <Table unstackable>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell colSpan='4'>{gameModeDescriptions[history[0].gameMode].text} History</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.Cell colSpan='4'>{/*<LineBarAreaComposedChart data={history} />*/}</Table.Cell>
        </Table.Row>
      </Table.Body>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Test #</Table.HeaderCell>
          <Table.HeaderCell>Duration</Table.HeaderCell>
          <Table.HeaderCell>WPM</Table.HeaderCell>
          <Table.HeaderCell textAlign='right'>Score</Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {history.reverse().map((v, i) => (
          <Table.Row key={i}>
            <Table.Cell>{history.length -i}</Table.Cell>
            <Table.Cell>{v.duration_in_sec}</Table.Cell>
            <Table.Cell>{v.wpm}</Table.Cell>
            <Table.Cell textAlign='right'>{v.score}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
    : <u>You don't have a history yet</u>
)
export { Word, Sentence, Result, TestInputField, Highscore, History };