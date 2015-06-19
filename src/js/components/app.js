
var im = require('immutable');
var utils = require('../common/utils');
var React = require('react');
var eventStore = require('../stores/eventStore');

var flight1 = eventStore.newFlight(4, "10:20", im.Set(["Harry", "Sally", "Morrie"]));
var flight2 = eventStore.newFlight(2, "1026", im.Set(["Tommy", "Annie"]));
var flight3 = eventStore.newFlight(4, "10:32", im.Set([]));
eventStore.resetDB();
eventStore.addEventToDB("Tuesday", "Fossil Trace", im.List.of(flight1, flight2, flight3));

var TimeSelector = React.createClass({
    render: function () {
        var selectList = this.props.event.get("flights").map(function (el, index) {
            return ( <option key={index} value={index}>{el.get("time")}</option>)
        });
        var buttonLabel = utils.inTeeList(this.props.event, this.props.player) ? "Cancel My Time" : "Add Me";
        return ( <form>
            <label>Time</label>
            <select name="time">
                { selectList }
            </select>
            <button> { buttonLabel } </button>
            </form>);
            }
            });

var TeeTime = React.createClass({
    render: function() {
        var players = this.props.timeData.get("players").map(function(el, index) {
            return (<tr className="player" key={index}><td>{el}</td></tr>)
        });
        return (
        <table className="tee-time">
        <tr>
            <td>{ this.props.timeData.get("time") }</td>
        </tr>
            { players }
        </table>)
    }
});

var TeeTimeList = React.createClass({
         render: function() {
             var times = this.props.teeTimes.map(function(el) {
                 return <TeeTime  timeData={ el }/>
             });

             return ( <div className="tee-time-list">
                 { times }
        </div>)
    }
});

var TeeTimeTable = React.createClass({
    getInitialState: function() {
        console.log(eventStore.getEventsFromDB());
        return {
            events: eventStore.getEventsFromDB()
        };
    },
    render: function () {
        console.log(this.state);
        return ( <div id="tee-time-table">
            <TimeSelector event={ this.state.events.get(0) } player={ utils.getCurrentPlayerName() }/>
            <TeeTimeList teeTimes={ this.state.events.get(0).get("flights") } />
        </div>)
    }
});

document.addEventListener("DOMContentLoaded", function(event) {
    React.render(<TeeTimeTable />, document.getElementById('container'));
});





