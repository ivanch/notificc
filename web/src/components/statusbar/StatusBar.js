import React, { Component } from 'react';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SettingsModal from '../modals/SettingsModal.js';
import Tag from '../tag/Tag.js';

import './StatusBar.css';

export default class StatusBar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            settings: false,
        };
    }

    handleLogout = () => {
        fetch('/api/auth/token?token=' + localStorage.getItem('@notificc/access_token'), {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        })
        .then(() => {
            localStorage.removeItem('@notificc/access_token');
            window.location.reload();
        });
    }

    handleClick = (event) => {
        this.setState({[event.target.name]: true});
    }

    handleClose = (name) => {
        this.setState({[name]: false});
    }

    handleClickChecker = () => {
        fetch('/api/checker', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        })
        .then(() => {
            this.props.fetchAPI();
        })
        .catch(error => {
            toast.error('Error: ' + error);
        });
    }

    getAPIStatusColor(){
        if(this.props.apiStatus === 'online'){
            return 'is-success';
        }else if(this.props.apiStatus === 'offline'){
            return 'is-danger';
        }else{
            return 'is-black';
        }
    }

    getCheckerStatusColor(){
        if(this.props.checkerStatus === 'error'){
            return 'is-black';
        }else if(this.props.checkerStatus === 'offline'){
            return 'is-danger';
        }else if(this.props.checkerStatus === 'stopped'){
            return 'is-warning';
        }else if(this.props.checkerStatus === 'online'){
            return 'is-success';
        }
        return 'is-white';
    }

    render(){
        return (
            <div id='status'>
                <div className='level'>
                    <div className='level-left'>
                        <div className='level-item'>
                            <Tag name='api' content={this.props.apiStatus} color={this.getAPIStatusColor()} />
                        </div>
                        <div className='level-item'>
                            <Tag name='checker' content={this.props.checkerStatus} color={this.getCheckerStatusColor()} click={this.handleClickChecker}/>
                        </div>
                    </div>

                    <div className='level-right'>
                        <div className='level-item'>
                            <button className='button' name='settings' onClick={this.handleClick}>Settings</button>
                        </div>

                        <div className='level-item'>
                            <button className='button is-danger' name='logout' onClick={this.handleLogout}>Logout</button>
                        </div>
                    </div>

                    <SettingsModal active={this.state.settings} handleClose={this.handleClose}/>
                </div>
            </div>
        )
    }

}