import React, { Component } from 'react';
import { Redirect } from 'react-router-dom'
import "react-bulma-components/full";
import "bloomer-extensions";

import './App.css'
import List from './List.js'
import Registery from './Registery.js'
import StatusBar from './StatusBar.js'

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: null,
            api_status: 'offline',
            checker_status: 'offline',
            settings: false,
            auth: true,
        }
        this.timer = setInterval(() => this.fetch_api(), 5000);
    };

    componentDidMount() {
        this.fetch_api();
        this.fetch_auth();
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevState.api_status === 'offline' && this.state.api_status === 'online'){
            this.fetch_auth();
        }
    }

    fetch_auth() {
        fetch('http://localhost:5000/api/auth/token', {
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
        fetch('http://localhost:5000/api')
            .then(_response => _response.json())
            .then(response => {
                this.setState({ data: response['urls'] });
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
                        <Registery api_status={this.state.api_status === 'online' ? true : false}/>
                    </div>
                    <div className="column is-half">
                        {this.state.api_status === 'online' ? 
                            <List data={this.state.data}/> : null
                        }
                    </div>
                </div>
            </div>
        );
    }
}