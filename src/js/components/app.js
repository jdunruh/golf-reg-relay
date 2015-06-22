var im = require('immutable');
var utils = require('../common/utils');
var React = require('react');
var eventStore = require('../stores/eventStore');
var actions = require('../actions/eventActions');

var flight1 = eventStore.newFlight(4, "10:20", im.Set(["Harry", "Sally", "Morrie"]));
var flight2 = eventStore.newFlight(2, "1026", im.Set(["Tommy", "Annie"]));
var flight3 = eventStore.newFlight(4, "10:32", im.Set([]));
eventStore.resetStore();
eventStore.addEventToStore("Tuesday", "Fossil Trace", im.List.of(flight1, flight2, flight3));


var TimeSelector = React.createClass({
    getInitialState: function () {
        return {timeSelect: "0"}
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
    render: function () {
        if (utils.inTeeList(this.props.event, this.props.player) ||
            utils.availableFlights(this.props.event.get("flights")).count() === 0) {
            selectTag = null;
        } else {
            var selectList = this.props.event.get("flights").map(function (el, index) {
                return ( <option key={index} value={index}>{el.get("time")}</option>)
            });
            var selectTag = <select name="time" value={ this.state.timeSelect }
                                    onChange={this.handleSelectChange}> { selectList } </select>;
        }
        var buttonInfo = utils.inTeeList(this.props.event, this.props.player) ?
        {label: "Cancel My Time", function: this.handleRemove} : {label: "Add Me", function: this.handleAdd};
        return ( <form>
            <label>Time</label>
            {selectTag}
            <button onClick={buttonInfo.function}> { buttonInfo.label } </button>
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
                    <td>{ this.props.timeData.get("time") }</td>
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
        return ( <div id="tee-time-table">
            <TimeSelector event={ this.state.events.get(0) } player={ utils.getCurrentPlayerName() }/>
            <TeeTimeList teeTimes={ this.state.events.get(0).get("flights") }/>
        </div>)
    }
});

document.addEventListener("DOMContentLoaded", function (event) {
    React.render(<TeeTimeTable />, document.getElementById('container'));
});





