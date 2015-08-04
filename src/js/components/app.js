var im = require('immutable');
var utils = require('../common/utils');
var React = require('react');
var eventStore = require('../stores/eventStore');
var playerStore = require('../stores/playerStore');
var actions = require('../actions/eventActions');

/*
var flight1 = eventStore.newFlight(4, "10:20", im.Set(["Harry", "Sally", "Morrie"]));
var flight2 = eventStore.newFlight(2, "10:26", im.Set(["Tommy", "Annie"]));
var flight3 = eventStore.newFlight(4, "10:32", im.Set([]));
eventStore.resetStore();
eventStore.addEventToStore("Tuesday", "Fossil Trace", im.List.of(flight1, flight2, flight3));
*/

var generateSelect = function (event, value, changeFn, player) {
    if (utils.availableFlights(event.get("flights")).count() === 0) {
        return null;
    } else { // list of options containing only those flights with room for more players
        var selectList = utils.findTimes(event, player).map(el =>
            <option key={el.get("index")} value={el.get("index")}>{el.get("time")}</option>);
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
                       {generateSelect(event, player, changeFn, initialSelectVal)}
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
                            {generateSelect(event, player, changeFn, initialSelectVal)}
                        </div>
                    </span>
                </div>
            </div>;
        }
    }
}


var TimeSelector = React.createClass({
    getInitialState: function () { // need position (index) of first possible flight time
        return {timeSelect: utils.findTimes(this.props.event, this.props.player).getIn([0, "index"])}
    },
    componentWillReceiveProps: function(nextProps) {
        this.setState({timeSelect: utils.findTimes(nextProps.event, nextProps.player).getIn([0, "index"])})
    },
    handleSelectChange: function (e) {
        this.setState({timeSelect: e.target.value})
    },
    handleRemove: function (e) {
        e.preventDefault();
        actions.removePlayer({event: 0, player: this.props.player});
    },
    handleAdd: function (e) {
        e.preventDefault();
        actions.addPlayer({player: this.props.player, flight: this.state.timeSelect, event: 0});
    },
    handleMove: function (e) {
        e.preventDefault();
        actions.movePlayer({player: this.props.player, flight: this.state.timeSelect, event: 0});
    },
    render: function () {
        return ( <form>
            {generateButtons(this.props.event, this.props.player, this.handleAdd, this.handleRemove, this.handleMove)}
        </form>);
    }
});

var TeeTime = React.createClass({
    render: function () {
        var players = this.props.timeData.get("players").map(function (el, index) {
            return (<tr className="player" key={index}>
                <td>{el}</td>
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
    },
    componentWillUnmount: function () {
        eventStore.removeChangeListener(this._onChange);
    },
    render: function () {
        return ( <div id="tee-time-table" className="form-box">
            <TimeSelector event={ this.state.events.get(0) } player={ playerStore.getCurrentPlayerName() }/>
            <TeeTimeList teeTimes={ this.state.events.get(0).get("flights") }/>
        </div>)
    }
});

document.addEventListener("DOMContentLoaded", function () {
    playerStore.getInitialDataFromServer();
    eventStore.getInitialDataFromServer(function() {
        React.render(<TeeTimeTable />, document.getElementById('container'));
    });
});







