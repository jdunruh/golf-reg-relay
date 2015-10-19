require('babel/polyfill');
var im = require('immutable');
var utils = require('../common/utils');
var React = require('react');
var Typeahead = require('react-typeahead-component');
var validator = require('validator');
var eventActions = require('../actions/eventActions');
var playerActions = require('../actions/playerActions');
import organizationActions from '../actions/organizationActions';
import { Router, Route, Link, History } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import playerStore from '../stores/playerStore';
import eventStore from '../stores/eventStore';
import organizationStore from '../stores/organizationStore'
import DatePicker from 'react-date-picker';
import moment from 'moment';
import TimePicker from 'react-time-picker';
import uuid from 'node-uuid';

require('./base.css');
require('./hackerone.css');



var validateField = function(validator, value, element) {
    var [err, result] = validator(value); // poor man's Maybe monad
    if(fieldContent != '' && !result)
        return  <div className="error">
                    <div>{err}</div>
                    {element}
                </div>;
    else
        return <div>{element}</div>;
    };


// needed something similar to validation applicative functor, but with a different handling of the functor value
// error messages across the validations are accumulated in a semigroup (array), and the right side values are accumulated
// as a logical and of the values, so the rhs will be true only of all rhs are true.
// To allow a variable number of validations as arguments, the validatonArray is an ES2015 rest parameter
function validationCombiner(...validationArray){
    return validationArray.reduce((acc, val) => { return [ val[0] === '' ? acc[0] : acc[0].concat(val[0]) , acc[1] && val[1] ]; }, [[], true])
}

var nullValidator = function() {return ['', true];};

var ValidatedInput = React.createClass({
    render: function() {
        if((this.props.checkValidity) && (!this.props.validation[1])) {
            return (<div className="error">
                <div> { this.props.validation[0] } </div>
                { this.props.wrappedComponent }
            </div>)
        }
        else {
            return <div> { this.props.wrappedComponent } </div>
        }
    }
});

var OrgForm = React.createClass({
    getInitialState: function() {
        return {orgName: this.props.orgName || '',
                checkValidity: false};
    },
    getDefaultProps: function() {
        return {formClass: "edit-form"}; // edit-form for update (with save button and delete button), show-form for show (read only with edit button)
    },
    componentDidMount: function() {
        organizationStore.addChangeListener(this._onChange);
    },
    componentWillUnmount: function() {
        organizationStore.removeChangeListener(this._onChange);
    },
    handleSubmit: function() {
        validator.trim(this.state.orgName);
    },
    orgValidator:  function(content) {
        if(validator.isNull(validator.trim(content)))
            return ['Organization name cannot be blank', false];
        else
            return ['', true];
    },
    onBlur: function() {
        this.setState({checkValidity: true});
    },
    handleTextBoxChange: function(e) {
        this.setState({orgName: e.target.value})
    },
    render: function() {
        return (<form className= {this.props.formClass}>
                    <label>Organization Name</label>
                    <ValidatedInput wrappedComponent = { <input type="text" value={this.state.orgName}
                                           onChange={this.handleTextBoxChange} name="name" onBlur={this.onBlur}/> }
                                    validation = { this.orgValidator(this.state.orgName)}
                                     checkValidity = {this.state.checkValidity }/>
                     <button className="btn" onClick={this.handleSubmit}>Create</button>
                 </form>)
            }
});

var UserForm = React.createClass({
    getInitialState: function() {
        return {email: this.props.email || '',
                name: this.props.name || '',
                password: this.props.password || '',
                passwordConfirm: this.props.passwordConfirm || '',
                checkValidateName: this.props.checkValidateName || false,
                checkValidateEmail: this.props.checkValidateEmail || false,
                checkValidatePassword: this.props.checkValidatePassword || false,
                checkValidatePasswordConfirm: this.props.checkValidatePasswordConfirm || false};
    },
    getDefaultProps: function() {
        return {formClass: "edit-form"};
    },
    componentDidMount: function() {
        playerStore.addChangeListener(this._onChange);
    },
    componentWillUnmount: function() {
        playerStore.removeChangeListener(this._onChange);
    },
    handleSubmit: function() {
        this.state.email = normalizeEmail(this.state.email);
        this.state.password = this.state.password.trim();
        this.state.name = this.state.name.trim();
        this.state.passwordConfirm = this.state.passwordConfirm.trim();
    },
    onBlur: function(field) {
        var validatorFlag = {};
        validatorFlag["checkValidate" + field] = true;
        this.setState(validatorFlag);
    },
    validateEmail: function(val) {
        val = validator.normalizeEmail(val);
        if(validator.isEmail(val))
            return ['', true];
        else
            return ['invalid email address', false];
    },
    validateName: function(val) {
        if(!validator.isNull(validator.trim(val)) && validator.isLength(validator.trim(val), 5, 100))
            return ['', true];
        else
            return ['name must be between 5 and 100 characters', false];
    },
    validatePassword: function(val) {
        if(!validator.isNull(validator.trim(val)) && validator.isLength(validator.trim(val), 7, 30))
            return ['', true];
        else
            return ['password must be between 7 and 30 characters', false];
    },
    validatePasswordConfirm: function(passwordVal, confirmVal) {
        if(confirmVal.trim() === passwordVal.trim())
            return ['', true];
        else
            return ['password and password confirmation do not match', false];
    },
    validatedEmail: function() {
        return validateField(validateEmail, this.state.email,
            <label>Email Address<input type="email" value="this.state.email"
                                       onChange={handleTextBoxChange.bind(this, "email")} name="email"/></label>)
    },
    isValid: function(){
       return validationCombiner(this.validateName(this.state.name),
            this.validateEmail(this.state.email),
            this.validatePassword(this.state.password),
            this.validatePasswordConfirm(this.state.password, this.state.passwordConfirm))[1];
    },
    handleTextBoxChange(field, e) {
        var tempState = {};
        tempState[field] = e.target.value;
        this.setState(tempState);
    },
    render: function () {
        return ( <form className= { this.props.formClass }>
            <label>Email Address
                <ValidatedInput wrappedComponent={ <input type="text" value={this.state.orgName}
                                    onChange={this.handleTextBoxChange.bind(this,"email")} name="name"
                                    onBlur={this.onBlur.bind(this, "Email")}/> }
                                validation={ this.validateEmail(this.state.email) }
                                checkValidity={this.state.checkValidateEmail}/>
            </label>
            <label>Name
                <ValidatedInput wrappedComponent={<input type="text"
                                    value={this.state.name}
                                    onChange= {this.handleTextBoxChange.bind(this,"name")} name="name"
                                    onBlur = {this.onBlur.bind(this, "Name")}/>}
                                validation={ this.validateName(this.state.name) }
                                checkValidity={this.state.checkValidateName}/>
            </label>
            <label>Password
                <ValidatedInput wrappedComponent={<input type="password"
                                    value={this.state.password}
                                    onChange={this.handleTextBoxChange.bind(this, "password")} name="password"
                                    onBlur = {this.onBlur.bind(this, "Password")}/>}
                                validation={this.validatePassword(this.state.password)}
                                checkValidity={this.state.checkValidatePassword}/>
            </label>
            <label>Confirm Password
                <ValidatedInput wrappedComponent={<input type="password" value={this.state.passwordConfirm}
                                    onChange={this.handleTextBoxChange.bind(this, "passwordConfirm")} name="password-confirm"
                                    onBlur ={this.onBlur.bind(this, "PasswordConfirm")}/>}
                                validation={this.validatePasswordConfirm(this.state.password, this.state.passwordConfirm)}
                                checkValidity={this.state.checkValidatePasswordConfirm }/>
            </label>
            <button onClick={this.handleSubmit} disabled={!this.isValid()}>Save</button>
        </form>)
    }
});


var FlightForm = React.createClass({
    getInitialState: function() {
        return {maxPlayers: this.props.maxPlayers || 4,
                time: this.props.time || "7:00 AM",
                checkValidateMaxPlayers: false,
        };
    },
    getDefaultProps: function() {
        return {formClass: 'edit',
                addFlight: function() {},
                removeFlight: function() {},
                last: false,
                maxPlayers: 4
        };
    },
    onBlur: function(field) {
        var validatorFlag = {};
        validatorFlag["checkValidate" + field] = true;
        this.setState(validatorFlag);
    },
    render: function() {
        return  <div className="clearfix">
            <TimePicker className="time-picker"
                value ={this.props.time}
                onChange ={ this.props.handleTimeChange } />
            <label className="max-players">Number of Players
                <ValidatedInput wrappedComponent={<input type="text" value={this.props.maxPlayers} name="maxPlayers"
                onChange={this.props.handleMaxPlayersChange}
                onBlur = {this.onBlur.bind(this, "MaxPlayers")}/>}
                    validation={this.props.validateNumberOfPlayers}
                    checkValidity={this.state.checkValidateMaxPlayers} />
            </label>
            {this.props.formClass === 'edit' ?
                <button className="icon-button" onClick={this.props.removeFlight}>
                    <i className="fa fa-minus-circle fa-2x add-remove-button"></i></button> : ''}
            {(this.props.formClass === 'edit' && this.props.last) ?
                <button className="icon-button" onClick={this.props.addFlight}>
                    <i className="fa fa-plus-circle fa-2x add-remove-button"></i></button> : ''}
                </div>
                        }
});

var addUuid = function(flight) {
    return flight.set('key', uuid.v4());
};

var EventForm = React.createClass({
    getInitialState: function() {
        return {
                name: this.props.name || '',
                date: this.props.date || moment(),
                course: this.props.course || '',
                address: this.props.address || '',
                city: this.props.city || '',
                state: this.props.state || '',
                zip: this.props.zip || '',
                flights: this.props.flights.map(function(el) {
                        return addUuid(el);
                    })
                }
    },
    getDefaultProps: function() {
        return {formClass: "edit",
            flights: im.List([im.Map({maxPlayers: '4', time: '7:00 AM', key: uuid.v4()})])}
    },
    componentDidMount: function() {
        eventStore.addChangeListener(this._onChange);
    },
    componentWillUnmount: function() {
        eventStore.removeChangeListener(this._onChange);
    },
    onDateChange: function(dateString, moment){
        this.setState({date: dateString});
    },
    onBlur: function(field) {
        var validatorFlag = {};
        validatorFlag["checkValidate" + field] = true;
        this.setState(validatorFlag);
    },
    validateName: function(val) {
        if(validator.isLength(val, 5, 100))
            return ['', true];
        else
            return ['Name must be 5 to 100 characters', false];
    },
    validateCourse: function(val) {
        if(validator.isLength(val, 5, 100))
            return ['', true];
        else
            return ['Course must be 5 to 100 characters', false];
    },
    validateAddress: function(val) {
        if(validator.isLength(val, 5, 50))
            return ['', true];
        else
            return ['Address must be 5 to 50 characters', false];
    },
    validateState: function(val) {
        if(validator.isLength(val, 2, 2))
            return ['', true];
        else
            return ['State must be 2 characters', false];
    },
    validateZip: function(val) {
        if (validator.isNumeric(val) && validator.isLength(val, 5, 5))
            return ['', true];
        else
            return ['Zip must be 5 digits', false];
    },
    validateCity: function(val) {
        if(validator.isLength(val, 5, 25))
            return ['', true];
        else
            return ['Name must be 5 to 25 characters', false];
    },
    validateNumberOfPlayers: function(val) {
        if(validator.isInt(val, {min: 1, max: 6}))
            return ['', true];
        else
            return ['Number of Players must be between 1 and 6', false]
    },
    isFlightValid: function(flight) {
        return this.validateNumberOfPlayers(flight.get('maxPlayers'));
    },
    isDisabled: function() {
        var fieldValidations = [this.validateName(this.state.name), this.validateCourse(this.state.course), this.validateAddress(this.state.address),
            this.validateCity(this.state.city), this.validateState(this.state.state), this.validateZip(this.state.zip)];
        var flightValidations = this.state.flights.map(flight => this.isFlightValid(flight)).toJS();
        return validationCombiner.apply(this, flightValidations.concat(fieldValidations))[1];
    },
    handleTextBoxChange: function(field, e) {
        e.preventDefault();
        var tempState = {};
        tempState[field] = validator.trim(e.target.value);
        this.setState(tempState);
    },
    handleTimeChange: function(flightIndex, newValue) {
        this.setState({flights: this.state.flights.setIn([flightIndex, 'time'], newValue)});
    },
    handleMaxPlayersChange: function(flightIndex, e) {
        e.preventDefault();
        this.setState({flights: this.state.flights.setIn([flightIndex, 'maxPlayers'], validator.trim(e.target.value))});
    },
    removeFlight: function(flightIndex, e) {
        e.preventDefault();
        this.setState({flights: this.state.flights.delete(flightIndex)});
    },
    addFlight: function(e) {
        e.preventDefault();
        this.setState({flights: this.state.flights.push(im.Map({maxPlayers: '4', time: '7:00 AM', key: uuid.v4()}))});
    },
    handleSubmit: function(e) {
        e.preventDefault();
        event.name = this.state.name;
        event.location = this.state.course;
        event.city = this.state.city;
        event.state = this.state.state;
        event.zip = this.state.zip;
        event.date = this.state.date;
        event.flights = this.state;
        eventActions.addEvent(im.Map(event));
    },
    render: function() {
        var _this = this;
        var length = this.state.flights.size;
        var formClass = this.props.formClass;
        var flights = this.state.flights.map(function(el, index) {
            return <FlightForm key={el.get('key')}
                time = {el.get('time')}
                maxPlayers = {el.get('maxPlayers')}
                last = { index === (length - 1)}
                formClass = {formClass}
                addFlight = {_this.addFlight}
                removeFlight = {_this.removeFlight.bind(_this, index)}
                handleTimeChange = {_this.handleTimeChange.bind(_this, index)}
                handleMaxPlayersChange = {_this.handleMaxPlayersChange.bind(_this, index)}
                validateNumberOfPlayers = {_this.validateNumberOfPlayers(_this.state.flights.getIn([index, 'maxPlayers']))}/>
        });
            return <form className = {this.props.formCLass}>
                <label>Event Name
                    <ValidatedInput wrappedComponent={<input type="text" value={this.state.name} name="name"
                        onChange={this.handleTextBoxChange.bind(this, "name")}
                        onBlur = {this.onBlur.bind(this, "Name")}/>}
                        validation={this.validateName(this.state.name)}
                        checkValidity={this.state.checkValidateName} />
                </label>
                <label>Date
                    <DatePicker
                        minDate={moment()}
                        date={this.state.date}
                        onChange={this.onDateChange}
                        hideFooter = {true}
                    />
                </label>
                <label>Course
                    <ValidatedInput wrappedComponent={<input type="text" value={this.state.course} name="course"
                        onChange={this.handleTextBoxChange.bind(this, "course")}
                        onBlur = {this.onBlur.bind(this, "Course")}/>}
                        validation={this.validateCourse(this.state.course)}
                        checkValidity={this.state.checkValidateCourse} />
                </label>
                <label>Address
                    <ValidatedInput wrappedComponent={<input type="text" value={this.state.address} name="address"
                        onChange={this.handleTextBoxChange.bind(this, "address")}
                        onBlur = {this.onBlur.bind(this, "Address")}/>}
                                    validation={this.validateAddress(this.state.address)}
                                    checkValidity={this.state.checkValidateAddress} />
                </label>
                <label>City
                    <ValidatedInput wrappedComponent={<input type="text" value={this.state.city} name="city"
                        onChange={this.handleTextBoxChange.bind(this, "city")}
                        onBlur = {this.onBlur.bind(this, "City")}/>}
                                    validation={this.validateCity(this.state.city)}
                                    checkValidity={this.state.checkValidateCity} />
                </label>
                <label>State
                    <ValidatedInput wrappedComponent={<input type="text" value={this.state.state} name="state"
                        onChange={this.handleTextBoxChange.bind(this, "state")}
                        onBlur = {this.onBlur.bind(this, "State")}/>}
                                    validation={this.validateState(this.state.state)}
                                    checkValidity={this.state.checkValidateState} />
                </label>
                <label>Zip
                    <ValidatedInput wrappedComponent={<input type="text" value={this.state.zip} name="zip"
                        onChange={this.handleTextBoxChange.bind(this, "zip")}
                        onBlur = {this.onBlur.bind(this, "Zip")}/>}
                                    validation={this.validateZip(this.state.zip)}
                                    checkValidity={this.state.checkValidateZip} />
                </label>
                <h3>Tee Times for This Event</h3>
                    {flights}
                <div className="clearfix">
                    <button className="btn cancel">Cancel</button>
                    <button className="btn accept" disabled={!this.isDisabled()} onClick={this.handleSubmit}>Save</button>
                </div>
            </form>
        }
});

document.addEventListener("DOMContentLoaded", function () {
    playerStore.getInitialDataFromServer();
    eventStore.getInitialDataFromServer(function() {
        React.render((
            <Router history={createBrowserHistory()}>
                <Route path="/organizers" component={OrgForm} />
                <Route path="/organizers/players" component={UserForm}  />
                <Route path="/organizers/events" component={EventForm}/>
                <Route path="/organizers/events/new" component={EventForm} />
            </Router>), document.getElementById('container'));
    });
});