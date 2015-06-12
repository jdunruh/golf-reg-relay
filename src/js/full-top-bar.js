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

module.exports = TimeSelector;