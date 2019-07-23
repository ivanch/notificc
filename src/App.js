import React, { Component } from 'react';
import { Box } from "react-bulma-components/full";

import './App.css'
import List from './List.js'
import Registery from './Registery.js'

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: null,
            api_status: false,
            checker_status: false,
        }
    };

    componentDidMount() {
        fetch('http://localhost:5000/api')
            .then(_response => _response.json())
            .then(response => {
                this.setState({ data: response['urls'] });
                if(response != null){
                    this.setState({api_status: true});
                    this.setState({checker_status: response['checker_status']});
                }
                console.log(response);
                console.log(response['checker_status']);
                console.log(response['urls']);
            })
    }

    render() {
        return (
            <div className="App">
                <nav className="level">
                    <div className="level-left">
                        <div className="tags has-addons level-item">
                            <span className="tag is-dark">api</span>
                            {this.state.api_status ? 
                                <span className="tag is-success">online</span> :
                                <span className="tag is-danger">offline</span>
                            }                    
                        </div>
                        <div className="tags has-addons level-item">
                            <span className="tag is-dark">checker</span>
                            {this.state.checker_status ? 
                                <span className="tag is-success">online</span> :
                                <span className="tag is-danger">offline</span>
                            }
                        </div>
                    </div>
                </nav>


                <div className="columns is-multiline">
                    <div className="column is-half">
                        <Registery api_status={this.state.api_status}/>
                    </div>
                    <div className="column is-half">
                        {this.state.api_status ? 
                            <List data={this.state.data}/> : null
                        }
                    </div>
                </div>
            </div>
        );
    }
}