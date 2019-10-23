import React, { Component } from 'react';
import "react-bulma-components/full";
import "bloomer-extensions";

import './App.css'
import StatusBar from './components/statusbar/StatusBar.js'
import Registery from './components/registry/Registery.js'
import Logs from './components/logs/Logs.js'
import List from './components/list/List.js'

const API_URL = process.env.REACT_APP_API_ENDPOINT;

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            api_status: 'offline',
            checker_status: 'offline',
            settings: false,
        }
        //this.timer = setInterval(() => this.fetch_api(), 5000);
    };

    componentDidMount() {
        this.fetch_api();  
    };

    fetch_api = () => {
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
        return (
            <div className="App">
                <StatusBar api_status={this.state.api_status} checker_status={this.state.checker_status} fetch_api={this.fetch_api}/>
                <div className="columns is-multiline" style={{"marginTop": "0.5rem"}}>
                    <div className="column is-half">
                        <Registery api_status={this.state.api_status}/>
                        <List api_status={this.state.api_status}/>
                    </div>
                    <div className="column">
                        <Logs api_status={this.state.api_status}/>
                    </div>
                </div>
            </div>
        );
    }
}