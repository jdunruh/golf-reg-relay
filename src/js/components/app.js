require('babel/polyfill');
var im = require('immutable');
var utils = require('../common/utils');
var React = require('react');
var eventStore = require('../stores/eventStore');
var playerStore = require('../stores/playerStore');
var eventActions = require('../actions/eventActions');
var playerActions = require('../actions/playerActions');
var Typeahead = require('react-typeahead-component');
var moment = require('moment');

import { Router, Route, Link, History } from 'react-router'
import createBrowserHistory from 'history/lib/createBrowserHistory'

var findIndexOfEvent = function(events, id) {
    return events.findIndex(event => event.get('_id') === id);
};

var generateSelect = function (event, value, changeFn, player) {
    if (utils.availableFlights(event.get("flights")).count() === 0) {
        return null;
    } else { // list of options containing only those flights with room for more players
        var selectList = utils.findTimes(event, player).map(el =>
            <option key={el.get("time")} value={el.get("index")}>{el.get("time")}</option>);
        return <select className="time-select" name="time" value={ value }
                                onChange={changeFn}> { selectList } </select>;
    }
};

function generateButtons(event, player, addFn, removeFn, moveFn, changeFn, initialSelectVal) {
    if(!utils.inTeeList(event, player)) {                       // not currently in event
       return <div>
           <div className="left-buttons">
           </div>
           <div className="right-buttons">
               <span>
                   <button className="btn" onClick={addFn}>Add Me At</button>
                   <div>
                       {generateSelect(event, initialSelectVal, changeFn, player)}
                   </div>
               </span>
           </div>
       </div>;
    } else {
        if(utils.availableFlights(event.get("flights")).count() === 0) { // in event, but no place to move
            return <div>
                <div className="left-buttons">
                    <button className="btn" onClick={removeFn}>Cancel My Time</button>
                </div>
                <div className="right-buttons">
                    <span>
                    </span>
                </div>
            </div>;
        } else {                                                        // in event, can move
            return <div>
                <div className="left-buttons">
                    <button className="btn" onClick={removeFn}>Cancel My Time</button>
                </div>
                <div className="right-buttons">
                    <span>
                        <button className="btn" onClick={moveFn}>Move Me To</button>
                        <div>
                            {generateSelect(event, initialSelectVal, changeFn, player)}
                        </div>
                    </span>
                </div>
            </div>;
        }
    }
}



var OptionTemplate = React.createClass({
    displayName: 'OptionTemplate',

    propTypes: {
        data: React.PropTypes.any,
        inputValue: React.PropTypes.string,
        isSelected: React.PropTypes.bool
    },

    render: function() {
        var classes =
            'yt-option' + this.props.selected ? 'yt-selected-option' : '';

        return (
            <div className={classes}>
                {this.renderOption()}
            </div>
        );
    },

    renderOption: function() {
        var optionData = this.props.data.name,
            inputValue = this.props.userInputValue;

        if (optionData.indexOf(inputValue) === 0) {
            return (
                <span>
                    {inputValue}
                    <strong>
                        {optionData.slice(inputValue.length)}
                    </strong>
                </span>
            );
        }

        return optionData;
    }
});
var TypeAheadWidget = React.createClass({
    getInitialState: function() {return {options: [], inputValue: this.props.player.get('name')}},

    _onChange: function() {
        this.setState({options: this.getOptions(this.state.inputValue)});
    },

    componentDidMount: function() { playerStore.addChangeListener(this._onChange)},

    componentWillUnmount: function() {playerStore.removeChangeListener(this._onChange)},

    handleChange: function(event) {
        var value = event.target.value;
        this.setInputValue(value);
        this.setState({options: this.getOptions(value)});
    },

    onComplete(event, completedInputValue) {
        this.setInputValue(completedInputValue);
    },

    getOptions: (inputValue) => playerStore.getOptionList(inputValue).toJS(),

    handleOptionChange: function(event, option) {
        this.setInputValue(option.name);
    },

    handleOptionClick: function(event, option) {
        this.setInputValue(option.name);
    },

    setInputValue: function(value) {
        playerActions.updateCurrentPlayer(value);
        this.setState({inputValue: value});
    },

    setCurrentPlayer: function() {
        var player = this.state.options.find((player) => player.name  === this.state.inputValue);
        if(player)
            playerActions.updateCurrentPlayer(this.state.inputValue);
    },

    handleHint: function() {
        if (this.state.options.length > 0 && new RegExp('^' + this.state.inputValue).test(this.state.options[0].name)) {
            return this.state.options[0].name;
        }
        else
            return '';
    },

    render: function() {
        return  <Typeahead
           inputValue={this.state.inputValue}
           options={this.state.options}
           onChange={this.handleChange}
           onOptionChange={this.handleOptionChange}
           onOptionClick={this.handleOptionClick}
           optionTemplate={OptionTemplate}
//           onBlur={this.setCurrentPlayer}
           handleHint={this.handleHint}
            />
    }
});

var TimeSelector = React.createClass({
    getInitialState: function () { // need position (index) of first possible flight time
        return {timeSelect: utils.findTimes(this.props.event, this.props.player).getIn([0, "index"])}
    },
    componentDidMount: function() {
        playerStore.addNewPlayerListener(this.handleNewPlayer);
    },
    componentWillUnmount: function() {
        playerStore.removeNewPlayerListener(this.handleNewPlayer);
    },
    componentWillReceiveProps: function(nextProps) { // here timeSelect is the index of the first select value
        this.setState({timeSelect: utils.findTimes(nextProps.event, nextProps.player).getIn([0, "index"])}) // TODO - is this 0 correct?
    },
    handleSelectChange: function (e) {
        this.setState({timeSelect: e.target.value})
    },
    handleRemove: function (e) {
        e.preventDefault();
        var events = eventStore.getEventsFromStore();
        eventActions.removePlayer({event: findIndexOfEvent(events, this.props.params.id),
            player: this.props.player});
    },
    handleAdd: function (e) {
        e.preventDefault();
        var events = eventStore.getEventsFromStore();
        if(!this.props.player.get('_id'))
            playerActions.newPlayer(this.props.player.get('name'));
        else
            eventActions.addPlayer({player: this.props.player, flight: this.state.timeSelect,
                event: findIndexOfEvent(events, this.props.params.id)})
    },
    handleNewPlayer: function() {
        var events = eventStore.getEventsFromStore();
        eventActions.addPlayer({player: playerStore.getCurrentPlayer(), flight: this.state.timeSelect,
            event: findIndexOfEvent(events, this.props.params.id)})
    },
    handleMove: function (e) {
        e.preventDefault();
        var events = eventStore.getEventsFromStore();
        eventActions.movePlayer({player: playerStore.getCurrentPlayer(), flight: this.state.timeSelect,
            event: findIndexOfEvent(events, this.props.params.id)})
    },
    render: function () { // timeselect last param not used.
        return ( <form>
            {generateButtons(this.props.event, this.props.player, this.handleAdd, this.handleRemove, this.handleMove, this.handleSelectChange, this.state.timeSelect)}
            <TypeAheadWidget player={ this.props.player }/>
        </form>);
    }
});

var TeeTime = React.createClass({
    render: function () {
        var players = this.props.timeData.get("players").map(function (el, index) {
            return (<tr className="player" key={index}>
                <td>{el.get('name')}</td>
            </tr>)
        });
        return (
            <table className="tee-time">
                <tbody>
                <tr>
                    <td>{this.props.timeData.get("time") + " up to " + this.props.timeData.get("maxPlayers") + " players"}</td>
                </tr>
                { players }
                </tbody>
            </table>)
    }
});

var TeeTimeList = React.createClass({
    render: function () {
        var times = this.props.teeTimes.map(function (el, index) {
            return <TeeTime key={index} timeData={ el }/>
        });

        return ( <div className="tee-time-list">
            { times }
        </div>)
    }
});

var TeeTimeTable = React.createClass({
    getInitialState: function () {
        return {
            events: eventStore.getEventsFromStore()
        };
    },
    _onChange: function () {
        this.setState({
            events: eventStore.getEventsFromStore()
        });
    },
    componentDidMount: function () {
        eventStore.addChangeListener(this._onChange);
        playerStore.addChangeListener(this._onChange);
    },
    componentWillUnmount: function () {
        eventStore.removeChangeListener(this._onChange);
        playerStore.removeChangeListener(this._onChange);
    },
    render: function () {
        return ( <div id="tee-time-table" className="form-box">
            <TimeSelector event={ this.state.events.get(findIndexOfEvent(this.state.events, this.props.params.id)) }
                          player={ playerStore.getCurrentPlayer() }
                          params= {this.props.params }/>
            <TeeTimeList teeTimes={ this.state.events.get(findIndexOfEvent(this.state.events, this.props.params.id)).get("flights") }/>
        </div>)
    }
});

const EventListItem = React.createClass({
    render: function() {
        var dest = "/signup/" + this.props.event.get('_id');
        return <li className="event-select-item" >
                <div className="event-link"><Link to={dest}>{this.props.event.get('name')}</Link></div>
                <div>{this.props.event.get('location')}</div>
                <div>{this.props.event.get('date')}</div>
            </li>
    }
});

const SelectEvent = React.createClass({
    mixins: [History],
    componentWillMount: function() {
        var events = eventStore.getEventsFromStore();
        if(events.size == 1) {
            var eventID = events.getIn([0, '_id']);
            this.history.replaceState(null, '/signup/' + eventID);
        }
    },
    render:  function() {
        var eventList = eventStore.getEventsFromStore()
            .map(event => <EventListItem event={event} key={event.get('_id')}/>);
        return (<div className="form-box"> <ul className="pick-list">
                { eventList }
            </ul>
            </div>
        )
    }
});

document.addEventListener("DOMContentLoaded", function () {
    playerStore.getInitialDataFromServer();
    eventStore.getInitialDataFromServer(function() {
        React.render((
            <Router history={createBrowserHistory()}>
                <Route path="/" component={SelectEvent} />
                <Route path="/signup/:id" component={TeeTimeTable}  />
            </Router>), document.getElementById('container'));
    });
});







