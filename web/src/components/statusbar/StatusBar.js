import React, { Component } from 'react';

import SettingsModal from '../modals/SettingsModal.js';
import Tag from '../tag/Tag.js';

import './StatusBar.css';

const API_URL = process.env.REACT_APP_API_ENDPOINT;

export default class StatusBar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            settings: false,
        };
    };

    handleLogout() {
        fetch(API_URL + '/api/auth/token', {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: localStorage.getItem('@notificc/access_token'),
            })
        })
        .then(() => {
            localStorage.removeItem('@notificc/access_token');
            window.location.reload(false);
        });
    };

    handleClick = (event) => {
        this.setState({[event.target.name]: true});
    };

    handleClose = (name) => {
        this.setState({[name]: false});
    };

    handleClickChecker = () => {
        fetch(API_URL + '/api/checker', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        }).then(() => {
            this.props.fetchAPI();
        })
        .catch(error => {
            alert("Error: " + error);
        });
    };

    getAPIStatusColor(){
        if(this.props.apiStatus === 'online'){
            return "is-success";
        }else if(this.props.apiStatus === 'offline'){
            return "is-danger";
        }else{
            return "is-black";
        }
    }

    getCheckerStatusColor(){
        if(this.props.checkerStatus === 'error'){
            return "is-black";
        }else if(this.props.checkerStatus === 'offline'){
            return "is-danger";
        }else if(this.props.checkerStatus === 'stopped'){
            return "is-warning";
        }else if(this.props.checkerStatus === 'online'){
            return "is-success";
        }
        return "is-white";
    }

    render(){
        return (
            <div id="status">
                <div className="level">
                    <div className="level-left">
                        <div className="level-item">
                            <Tag name="api" content={this.props.apiStatus} color={this.getAPIStatusColor()} />
                        </div>
                        <div className="level-item">
                            <Tag name="checker" content={this.props.checkerStatus} color={this.getCheckerStatusColor()} click={this.handleClickChecker}/>
                        </div>
                    </div>
            
                    <div className="level-right">
                        <div className="level-item">
                            <button className="button" name="settings" onClick={this.handleClick} disabled={this.props.apiStatus === 'online' ? false : true}>Settings</button>
                        </div>

                        <div className="level-item">
                            <button className="button is-danger" name="logout" onClick={this.handleLogout} disabled={this.props.apiStatus === 'online' ? false : true}>Logout</button>
                        </div>
                    </div>

                    <SettingsModal active={this.state.settings} handleClose={this.handleClose}/>
                </div>
            </div>
        )
    }

}