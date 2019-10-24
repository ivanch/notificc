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
            apiStatus: 'offline',
            checkerStatus: 'offline',
        }
    };

    componentDidMount() {
        this.fetchAPI();  
    };

    fetchAPI = () => {
        fetch(API_URL + '/api/status')
        .then(_response => _response.json())
        .then(response => {
            if(response != null){
                this.setState({apiStatus: 'online'});
                this.setState({checkerStatus: response['checker_status']});
            }else{
                this.setState({apiStatus: 'offline'});
                this.setState({checkerStatus: 'offline'});
            }
        })
        .catch(() => {
            this.setState({apiStatus: 'offline'});
            this.setState({checkerStatus: 'offline'});
        });
    }

    render() {
        return (
            <div className="App">
                <StatusBar apiStatus={this.state.apiStatus} checkerStatus={this.state.checkerStatus} fetchAPI={this.fetchAPI}/>
                <div className="columns is-multiline" style={{"marginTop": "0.5rem"}}>
                    <div className="column is-half">
                        <Registery apiStatus={this.state.apiStatus}/>
                        <List apiStatus={this.state.apiStatus}/>
                    </div>
                    <div className="column">
                        <Logs apiStatus={this.state.apiStatus}/>
                    </div>
                </div>
            </div>
        );
    }
}