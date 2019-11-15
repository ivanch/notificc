import React, { Component } from 'react';
import 'react-bulma-components/full';
import 'bloomer-extensions';

import './App.css';
import StatusBar from './components/statusbar/StatusBar.js';
import Register from './components/register/Register.js';
import Logs from './components/logs/Logs.js';
import Registry from './components/registry/Registry.js';

const API_URL = process.env.REACT_APP_API_ENDPOINT;

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            apiStatus: 'offline',
            checkerStatus: 'offline',
        };
    }

    componentDidMount() {
        this.fetchAPI();
        this.timer = setInterval(() => {
            this.fetchAPI();
        }, 10000);
    }

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
            this.props.history.push('/login');
        });
    }

    render() {
        return (
            <div className='App'>
                <StatusBar apiStatus={this.state.apiStatus} checkerStatus={this.state.checkerStatus} fetchAPI={this.fetchAPI}/>
                <div className='columns is-multiline' style={{'marginTop': '0.5rem'}}>
                    <div className='column is-half'>
                        <Register/>
                        <Registry />
                    </div>
                    <div className='column'>
                        <Logs apiStatus={this.state.apiStatus}/>
                    </div>
                </div>
            </div>
        );
    }
}