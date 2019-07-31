import React, { Component } from 'react';
import API_URL from './config';

import './SettingsModal.css';

const delay_min = 60; // 1 minute
const delay_max = 86400; // 1 day

export default class SettingsModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            auth_pass: '',
            delay:'',
        }
    };

    componentDidUpdate(prevProps) {
        if (this.props.active !== prevProps.active && this.props.active === true) {
            this.fetchData();
        }
    };
      
    fetchData() {
        fetch(API_URL + '/api/config')
        .then(_response => _response.json())
        .then(response => {
            if(response != null){
                this.setState({delay: response['delay']})
            }
        });
    };

    delay_valid() {
        const int_delay = parseInt(this.state.delay);
        if(int_delay < delay_min || int_delay > delay_max) return false;
        return true;
    }

    handleChange = (event) => {
        this.setState({[event.target.name]: event.target.value});
    };

    handleSubmit = () => {
        if(this.state.auth_pass !== ''){
            fetch(API_URL + '/api/auth/password', {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    auth_pass: this.state.auth_pass,
                })
            })
            .then()
            .then();
        }
        if(this.state.delay !== ''){
            fetch(API_URL + '/api/config', {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    delay: this.state.delay,
                })
            })
            .then()
            .then();
        }
        this.handleClose();
    };

    handleClose = () => {
        this.props.handleClose("settings");
    };

    render() {
        let delay_warning;
        if(!this.delay_valid()){
            delay_warning = <p className="help is-danger">Min {delay_min}, max {delay_max}.</p>;
        }

        return (
            <div className={"modal " + (this.props.active ? 'is-active' : '')}>
                <div className="modal-background" onClick={this.handleClose}></div>
                <div className="modal-content">
                    <div id="settings" className="box">
                        <h3 className="title">
                            Settings
                        </h3>
                        <div className="field">
                            <label className="label">Change Auth Password:</label>
                            <div className="control">
                                <input  className="input"
                                        type="password"
                                        name="auth_pass"
                                        value={this.state.auth_pass}
                                        onChange={this.handleChange}
                                />
                            </div>
                            <p className="help">
                                Set it to 0 to ignore the auth page.
                            </p>
                        </div>

                        <label className="label">Delay between checks:</label>
                        <div className="field columns">
                            <div className="column is-one-quarter">
                                <div className="control">
                                    <input  className={"input " + (this.delay_valid() ? '' : 'is-danger')}
                                            type="text"
                                            name="delay"
                                            placeholder={`${delay_min}..${delay_max}`}
                                            value={this.state.delay}
                                            onChange={this.handleChange}
                                    />
                                </div>
                                {delay_warning}
                            </div>
                            <div className="column">
                                <label className="label">seconds</label>
                            </div>
                        </div>
                        <div className="field">
                            <div className="submit control">
                                <button className="button is-primary" onClick={this.handleSubmit}>Submit</button>
                            </div>
                            <p className="help" style={{'textAlign':'center'}}>
                                You don't need to set both fields to submit.
                            </p>
                        </div>
                    </div>
                </div>
                <button className="modal-close is-large" aria-label="close" onClick={this.handleClose}></button>
            </div>
        )
    }
}