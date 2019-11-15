import React, { Component } from 'react';
import './SettingsModal.css';

import Warning from '../warning/Warning.js';

const API_URL = process.env.REACT_APP_API_ENDPOINT;

const DELAY_MIN = 60; // 1 minute
const DELAY_MAX = 86400; // 1 day

export default class SettingsModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loginPass: '',
            disablePass: false,
            autostart: false,
            delay:'',
        };
    }

    componentDidUpdate(prevProps) {
        if (this.props.active !== prevProps.active && this.props.active === true) {
            this.fetchData();
        }
    }
      
    fetchData() {
        // Fetch delay
        fetch(API_URL + '/api/config')
        .then(_response => _response.json())
        .then(response => {
            if(response != null){
                this.setState({delay: response['delay'],
                               autostart: response['autostart']})
            }
        });

        // Fetch password disabled
        fetch(API_URL + '/api/auth/password', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                auth_pass: '0',
            })
        })
        .then(_response => _response.json())
        .then(data => {
            this.setState({disablePass: data['message'] === 'Authorized'});
        });
    }

    isDelayValid() {
        const int_delay = parseInt(this.state.delay);
        if(int_delay < DELAY_MIN || int_delay > DELAY_MAX) return false;
        return true;
    }

    isPasswordValid() {
        return this.state.loginPass.length >= 4 || this.state.loginPass.length === 0;
    }

    handleChange = (event) => {
        this.setState({[event.target.name]: event.target.value});
    }

    handleClick = (event) => {
        this.setState({[event.target.name]: event.target.checked});
    }

    handleSubmit = () => {
        if(this.state.loginPass !== '' || this.state.disablePass){
            fetch(API_URL + '/api/auth/password', {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: localStorage.getItem('@notificc/access_token'),
                    auth_pass: this.state.disablePass ? '0' : this.state.loginPass,
                })
            });
        }
        if(this.state.delay !== ''){
            fetch(API_URL + '/api/config', {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: localStorage.getItem('@notificc/access_token'),
                    delay: this.state.delay,
                    autostart: this.state.autostart,
                })
            });
        }
        this.handleClose();
    }

    handleClose = () => {
        this.props.handleClose('settings');
    }

    render() {
        return (
            <div id='settings-modal' className={'modal animated ' + (this.props.active ? 'is-active fadeIn' : '')}>
                <div className='modal-background' onClick={this.handleClose}></div>
                <div className='modal-content'>
                    <div id='settings' className='box'>
                        <div className='header centered'>
                            <span className='title'>
                                Settings
                            </span>
                        </div>
                        <div className='field'>
                            <label className='label'>Auth Password:</label>
                            <div className="columns">
                                <div className='column is-four-fifths control'>
                                    <input  className='input'
                                            type='password'
                                            name='loginPass'
                                            disabled={this.state.disablePass}
                                            value={this.state.loginPass}
                                            onChange={this.handleChange}
                                    />
                                    <Warning text='Make sure your password is at least 4 characters long.' enabled={!this.isPasswordValid()} />
                                </div>
                                <div className='column control'>
                                    <label className='checkbox'>
                                        <input  type='checkbox'
                                                name='disablePass'
                                                checked={this.state.disablePass}
                                                onChange={this.handleClick}        
                                        />
                                        Disable
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className='field'>
                            <label className='label'>Checker auto-start:</label>
                            <div className='control'>
                                <label className='checkbox'>
                                    <input  type='checkbox'
                                            name='autostart'
                                            checked={this.state.autostart}
                                            onChange={this.handleClick}        
                                    />
                                    Enabled
                                </label>
                            </div>
                        </div>

                        <label className='label'>Delay between checks:</label>
                        <div className='field columns'>
                            <div className='column is-one-quarter'>
                                <div className='control'>
                                    <input  className={'input ' + (this.isDelayValid() ? '' : 'is-danger')}
                                            type='number'
                                            name='delay'
                                            placeholder={`${DELAY_MIN}..${DELAY_MAX}`}
                                            value={this.state.delay}
                                            onChange={this.handleChange}
                                    />
                                </div>
                                <Warning text={`Min ${DELAY_MIN}, max ${DELAY_MAX}.`} enabled={!this.isDelayValid()} />
                            </div>
                            <div className='column'>
                                <label className='label'>seconds</label>
                            </div>
                        </div>
                        <div className='field'>
                            <div className='submit control'>
                                <button className='button is-primary'
                                        onClick={this.handleSubmit}
                                        disabled={!this.isDelayValid() || !this.isPasswordValid()}
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <button className='modal-close is-large' aria-label='close' onClick={this.handleClose}></button>
            </div>
        )
    }
}