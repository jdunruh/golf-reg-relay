/**
 * Created by jdunruh on 6/10/15.
 */

var utils = require('./../utils');
var React = require('react');

var db = [{time: "10:36", position: 0, players:["Joe", "Billy Bob", "Spike", "Karen"], maxPlayers: 4},
          {time:"10:42", position:1, players: ["Annie", "Tommy"], maxPlayers: 4},
          {time: "10:48", position: 2, players: [], maxPlayers: 2}];

var TimeSelector = React.createClass({
    render: function () {
        var selectList = this.props.timeSelect.map(function (el, index) {
            return ( <option key={el.position} value={index}>{el.time}</option>)
        });
        var buttonLabel = utlis.inTeeList(this.props) ? "Cancel My Time" : "Add Me";
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
        var players = this.props.timeData.players.map(function(el, index) {
            return (<tr className="player" key={index}><td>{el}</td></tr>)
        })
        return (
        <table className="tee-time">
        <tr>
            <td>{ this.props.timeData.time }</td>
        </tr>
            { players }
        </table>)
    }
});

var TeeTimeList = React.createClass({
         render: function() {
             var times = this.props.teeTimes.map(function(el) {
                 return <TeeTime key={ el.position } timeData={ el }/>
             });

             return ( <div className="tee-time-list">
                 { times }
        </div>)
    }
})

var TeeTimeTable = React.createClass({
    render: function () {
        return ( <div id="tee-time-table">
            <TimeSelector timeSelect={ [{time: "10:36", position: 0}, {time: "10:42", position: 1}, {time: "10:48", position:2}] } inTeeList={ false }/>
            <TeeTimeList teeTimes={ db } />
        </div>)
    }
});

        React.render(<TeeTimeTable />, document.getElementById('container'));




