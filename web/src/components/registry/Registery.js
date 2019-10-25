import React, { Component } from 'react';
import './Registery.css';

import Warning from '../warning/Warning.js';

const API_URL = process.env.REACT_APP_API_ENDPOINT;

export default class Registery extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: '',
            url: '',
            thresh: '5',
            invalidURL: false,
            invalidName: false,
        };
    }

    handleChange = (event) => {
        this.setState({[event.target.name]: event.target.value});

        if(event.target.name === 'url'){
            this.setState({
                invalidURL: !(event.target.value.startsWith("http://") ||
                            event.target.value.startsWith("https://") ||
                            event.target.value.includes(" "))
            });
        }else if(event.target.name === 'name'){
            this.setState({
                invalidName:   (event.target.value.length === 0 || 
                                event.target.value.length > 24)
            });
        }
    }
  
    handleSubmit = (event) => {
        fetch(API_URL + '/api/websites', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: localStorage.getItem('@notificc/access_token'),
                name: this.state.name,
                url: this.state.url,
                threshold: parseInt(this.state.thresh),
            })
        })
        .then(response => response.json())
        .then(response => {
            if(response['message'] === 'Success'){
                window.location.reload(false);
            }else if(response['message'] === 'Exists'){
                alert("Website is already registered!");
            }else{
                alert("Unknown error.");
            }
        })
        .catch(function(error) {
            console.log(error);
        });
    }

    isValid() {
        return !(this.state.invalidURL || 
                this.state.invalidName || 
                this.state.url === '' || 
                this.props.apiStatus !== 'online');
    }

    render() {
        return (
            <div id="registry" className="box">
                <div className="centered">
                    <span className="title">
                        Register a website
                    </span>
                </div>

                <div className="field">
                    <label className="label">Name:</label>
                    <div className="control has-icons-right">
                        <input className={"input " + (this.state.invalidName ? 'is-danger' : '')}
                            type="text"
                            name="name"
                            placeholder="Name"
                            value={this.state.name}
                            onChange={this.handleChange}
                        />
                    </div>
                    <Warning enabled={this.state.invalidName} text="Name lenght must be between 0 and 24." />

                    <label className="label">URL:</label>
                    <div className="control has-icons-right">
                        <input className={"input " + (this.state.invalidURL ? 'is-danger' : '')}
                            type="text"
                            name="url"
                            placeholder="URL"
                            value={this.state.value}
                            onChange={this.handleChange}    
                        />
                    </div>
                    <Warning enabled={this.state.invalidURL} text="Invalid URL." />

                    <label className="label">Difference threshold:</label>
                    <div className="columns">
                        <div className="column is-11">
                            <div className="control">
                                <input className="slider is-fullwidth"
                                    name="thresh"
                                    step="1"
                                    min="0" max="100"
                                    value={this.state.thresh}
                                    type="range"
                                    onChange={this.handleChange}
                                />
                            </div>
                        </div>
                        <div className="column">
                            <label className="label">{this.state.thresh}%</label>
                        </div>
                    </div>
                    
                    <div className="submit control">
                        <button className="button is-primary"
                            onClick={this.handleSubmit}
                            disabled={!(this.isValid())}>Submit</button>
                    </div>
                </div>
            </div>
        );
    }
}
