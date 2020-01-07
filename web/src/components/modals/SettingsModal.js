import React, { Component } from 'react';
import './SettingsModal.css';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Warning from '../warning/Warning.js';
import Switch from '../switch/Switch.js';

const DELAY_MIN = 60; // 1 minute
const DELAY_MAX = 86400; // 1 day

const initialState = {
    loginPass: '',
    disablePass: false,
    autostart: false,
    delay: '',
}

export default class SettingsModal extends Component {
    constructor(props) {
        super(props);

        this.state = initialState;
    }

    componentDidUpdate(prevProps) {
        if (this.props.active !== prevProps.active && this.props.active === true) {
            this.fetchData();
        }
    }
      
    fetchData() {
        // Fetch delay
        fetch('/api/config')
        .then(_response => _response.json())
        .then(response => {
            if(response != null){
                this.setState({delay: response['delay'],
                               autostart: response['autostart']})
            }
        });

        // Fetch if password is disabled
        fetch('/api/auth/password/disabled')
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

    handleSubmit = (event) => {
        event.preventDefault();
        if(this.state.loginPass !== '' || this.state.disablePass){
            fetch('/api/auth/password', {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: localStorage.getItem('@notificc/access_token'),
                    auth_pass: this.state.disablePass ? '0' : this.state.loginPass,
                })
            })
            .then(_response => _response.json())
            .then(response => {
                toast.success(response['message'] + '.');
            }).catch(err => {
                toast.error(err);
            });
        }
        if(this.state.delay !== ''){
            fetch('/api/config', {
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
            })
            .then(_response => _response.json())
            .then(response => {
                toast.success(response['message'] + '.');
            }).catch(err => {
                toast.error(err);
            });
        }
        this.handleClose();
    }

    handleClose = (event) => {
        this.setState(initialState);
        this.props.handleClose('settings');
    }

    render() {
        return (
            <div id='settings-modal' className={'modal animated ' + (this.props.active ? 'is-active fadeIn' : '')}>
                <div className='modal-background' onClick={this.handleClose}></div>
                <div className='modal-content'>
                    <form id='settings' className='box'>
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
                                    <Switch id='disablePass'
                                            name='disablePass'
                                            checked={this.state.disablePass}
                                            onChange={this.handleClick}
                                    />
                                    <span style={{marginLeft: '5px'}}>Disable</span>
                                </div>
                            </div>
                        </div>

                        <div className='field'>
                            <label className='label'>Checker auto-start:</label>
                            <div className='control'>
                                <Switch id='autostart'
                                        name='autostart'
                                        checked={this.state.autostart}
                                        onChange={this.handleClick}
                                />
                                <span style={{marginLeft: '5px'}}>Enable</span>
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
                                    Save
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
                <button className='modal-close is-large' aria-label='close' onClick={this.handleClose}></button>
            </div>
        )
    }
}