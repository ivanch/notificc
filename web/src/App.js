import React, { Component } from 'react';
import { toast } from 'react-toastify';
import 'react-bulma-components/full';
import 'bloomer-extensions';

import './App.css';
import StatusBar from './components/statusbar/StatusBar.js';
import Register from './components/register/Register.js';
import Logs from './components/logs/Logs.js';
import Registry from './components/registry/Registry.js';

toast.configure({
    draggable: false,
    position: 'bottom-center',
    autoClose: 2000
});

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            apiStatus: 'offline',
            checkerStatus: 'offline',
            websites: [],
        };
    }

    componentDidMount() {
        this.fetchAPI();
        this.timer = setInterval(() => {
            this.fetchAPI();
        }, 10000);
        this.fetchWebsites();
    }

    fetchAPI = () => {
        fetch('/api/status')
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

    fetchWebsites = () => {
        fetch('/api/websites')
        .then(_response => _response.json())
        .then(response => {
            this.setState({ websites: response });
        });
    }

    render() {
        return (
            <div className='App'>
                <StatusBar 
                    apiStatus={this.state.apiStatus}
                    checkerStatus={this.state.checkerStatus}
                    fetchAPI={this.fetchAPI}
                />
                <div className='columns is-multiline' style={{'marginTop': '0.5rem'}}>
                    <div className='column is-half'>
                        <Register fetchWebsites={this.fetchWebsites} />
                        <Registry websites={this.state.websites} fetchWebsites={this.fetchWebsites} />
                    </div>
                    <div className='column'>
                        <Logs />
                    </div>
                </div>
            </div>
        );
    }
}