import React, { Component } from 'react';
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
        }
        this.timer = setInterval(() => this.fetch_api(), 5000);
    };

    componentDidMount() {
        this.fetch_api();
    };

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