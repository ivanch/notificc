import React, { Component } from 'react';
import API_URL from './config';

import SettingsModal from './SettingsModal.js'


export default class StatusBar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            settings: false,
            auth: false,
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
                token: localStorage.getItem('@notify-change/access_token'),
            })
        }).then().then(() => {
            localStorage.removeItem('@notify-change/access_token');
            window.location.reload(false);
        });
    }

    handleClick = (event) => {
        if([event.target.name] === 'logout'){
            window.location.reload(false);
        }else{
            this.setState({[event.target.name]: true});   
        }
    }

    handleClose = () => {
        this.setState({settings: false});
    }

    handleClickChecker() {
        fetch(API_URL + '/api/checker', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        })
        .then()
        .then(() => {
            window.location.reload(false);
        })
        .catch(error => {
            alert("Error: " + error);
        });
    };

    render(){
        let api_tag;
        if(this.props.api_status === 'online'){
            api_tag = <span className="tag is-success">online</span>;
        }else if(this.props.api_status === 'offline'){
            api_tag = <span className="tag is-danger">offline</span>;
        }else{
            api_tag = <span className="tag is-black">error</span>;
        }

        let checker_tag;
        if(this.props.checker_status === 'error'){
            checker_tag = <span className="tag is-black">error</span>;
        }else if(this.props.checker_status === 'offline'){
            checker_tag = <span className="tag is-danger" onClick={this.handleClickChecker} style={{'cursor':'pointer'}}>offline</span>;
        }else if(this.props.checker_status === 'stopped'){
            checker_tag = <span className="tag is-light" onClick={this.handleClickChecker} style={{'cursor':'pointer'}}>stopped</span>;
        }else if(this.props.checker_status === 'online'){
            checker_tag = <span className="tag is-success" onClick={this.handleClickChecker} style={{'cursor':'pointer'}}>online</span>;
        }

        return (
            <nav className="level status">
                <div className="level-left">
                    <div className="level-item">
                        <div className="tags has-addons">
                            <span className="tag is-dark">api</span>
                            {api_tag}
                        </div>
                    </div>
                    <div className="level-item">
                        <div className="tags has-addons">
                            <span className="tag is-dark">checker</span>
                            {checker_tag}
                        </div>
                    </div>
                </div>
        
                <div className="level-right">
                    <div className="level-item">
                        <button className="button is-danger" name="logout" onClick={this.handleLogout} disabled={this.props.api_status === 'online' ? false : true}>Logout</button>
                    </div>

                    <div className="level-item">
                        <button className="button" name="settings" onClick={this.handleClick} disabled={this.props.api_status === 'online' ? false : true}>Checker Settings</button>
                    </div>
                </div>

                <SettingsModal active={this.state.settings} handleClose={this.handleClose}/>
            </nav>
        )
    }

}