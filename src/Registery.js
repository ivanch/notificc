import React, { Component } from 'react';

import './Registery.css'

export default class Registery extends Component {
    constructor(props) {
        super(props);

        this.state = {
            url: '',
            thresh: '5',
            wrong_url: false,
        };
    };

    handleChange = (event) => {
        this.setState({[event.target.name]: event.target.value});

        if([event.target.name] === 'url'){
            this.setState({
                wrong_url: !(event.target.value.startsWith("http://") ||
                            event.target.value.startsWith("https://") ||
                            event.target.value.includes(" "))
            });
        }
    };
  
    handleSubmit = (event) => {
        fetch('http://localhost:5000/api', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: this.state.url,
                threshold: parseInt(this.state.thresh),
            })
        }).then(response => response.json())
          .then(response => {
                if(response['message'] === 'Success'){
                    window.location.reload(false);
                }else if(response['message'] === 'Exists'){
                    alert("Website is already registered!");
                }else{
                    alert("Unknown error.");
                }
          });
    };

    render() {
        return (
            <div id="registry" className="box">
                <h3 className="title">
                    Register a website
                </h3>
                <div className="field">
                    <label className="label">URL:</label>
                    <div className="control has-icons-right">
                        <input className={"input " + (this.state.wrong_url ? 'is-danger' : '')} type="text" name="url" placeholder="URL" value={this.state.value} onChange={this.handleChange}/>
                    </div>
                    {this.state.wrong_url ? <p className="help is-danger">Invalid URL</p> : null}

                    <label className="label">Difference threshold:</label>
                    <div className="columns">
                        <div className="column is-11">
                            <div className="control">
                                <input className="slider is-fullwidth" name="thresh" step="1" min="0" max="100" value={this.state.thresh} type="range" onChange={this.handleChange}/>
                            </div>
                        </div>
                        <div className="column">
                            <label className="label">{this.state.thresh}%</label>
                        </div>
                    </div>
                    
                    <div className="submit control">
                        <button className="button is-primary" onClick={this.handleSubmit} disabled={(!this.props.api_status || this.state.wrong_url)}>Submit</button>
                    </div>
                </div>
            </div>
        );
    }
}
