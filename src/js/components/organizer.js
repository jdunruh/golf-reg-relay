import React from 'react';
import Typeahead from 'react-typeahead-component';
import validator from 'validator';

var OrgForm = React.createClass({
    getInitialState: function() {
        return {orgName: this.props.orgName || ''};
    },
    handleSubmit: function() {
        this.state.orgName.trim();
    },
    handleNameChange: function(e) {
        this.setState({orgName: e.target.value});
    },
    render: function() {
        return (<form>
                    <label>Organization Name</label><input type="text" value="this.state.orgName" onChange="handleNameChange" name="org-name"/>
                     <button class="btn" onClick="handleSubmit">Create</button>
                 </form>)
            }
});

var UserForm = Recat.createClass({
    getInitialState: function() {
        return {email: this.props.email || '',
                name: this.props.name || '',
                password: this.props.password || '',
                passwerdConfirm: this.props.passwordConfirm || ''}
    },
    handleSubmit: function() {
        this.state.email = this.state.email.trim();
        this.state.password = this.state.password.trim();
        this.state.name = this.state.name.trim();
        this.state.passwordConfirm = this.state.passwordConfirm.trim()
        this.state.email.isEmail();
    },
    handleEmailChange: function(e) {
        this.state.email = e.target.value;
    },
    handlePasswordChange: function(e) {
        this.state.password = e.target.value;
    },
    handlePasswordConfirmChange: function(e) {
        this.state.passwordConfirm = e.target.value;
    },
    render: function() {
        return  ( <form>
                        <label>Email Address</label> <input type="email" value="this.state.email" onChange="handleEmailChange" name="email" />
                        <label>Name</label> <input type="text" value="this.state.name" onChange="handelNameChange" name="name" />
                        <label>Password</label> <input type="password" value="this.state.password" onChange="handlePasswordChange" name="name" />
                        <label>Confirm Password</label> <input type="password" value="this.state.passwordConfirm" onChange="handlePasswordConfirmChange" name="password-confirm" />)
                    </form>)
    }
});
