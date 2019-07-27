import React, { Component } from 'react';
import { Redirect } from 'react-router-dom'
import "react-bulma-components/full";
import "bloomer-extensions";

import API_URL from './config';

import './App.css'
import List from './List.js'
import Registery from './Registery.js'
import StatusBar from './StatusBar.js'

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            api_status: 'offline',
            checker_status: 'offline',
            settings: false,
            auth: true,
        }
        this.timer = setInterval(() => this.fetch_api(), 5000);
    };

    componentDidMount() {
        this.fetch_api();
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevState.api_status === 'offline' && this.state.api_status === 'online'){
            this.fetch_auth();
        }
    }

    fetch_auth() {
        fetch(API_URL + '/api/auth/token', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: localStorage.getItem('@notify-change/access_token'),
            })
        })
        .then(_response => _response.json())
        .then(response => {
            this.setState({auth: response['message'] === 'Authorized'});
        });
    }

    async fetch_api() {
        fetch(API_URL + '/api/status')
        .then(_response => _response.json())
        .then(response => {
            if(response != null){
                this.setState({api_status: 'online'});
                this.setState({checker_status: response['checker_status']});
            }else{
                this.setState({api_status: 'offline'});
                this.setState({checker_status: 'offline'});
            }
        })
        .catch(() => {
            this.setState({api_status: 'offline'});
            this.setState({checker_status: 'offline'});
        });
    }

    render() {
        if(!this.state.auth){
            clearInterval(this.timer);
            return <Redirect to="/login" />
        }

        return (
            <div className="App">
                <StatusBar api_status={this.state.api_status} checker_status={this.state.checker_status}/>
                <div className="columns is-multiline">
                    <div className="column is-half">
                        <Registery api_status={this.state.api_status}/>
                    </div>
                    <div className="column is-half">
                        <List api_status={this.state.api_status}/>
                    </div>
                </div>
            </div>
        );
    }
}