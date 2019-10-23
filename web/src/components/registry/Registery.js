import React, { Component } from 'react';
import './Registery.css';

const API_URL = process.env.REACT_APP_API_ENDPOINT;

export default class Registery extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: '',
            url: '',
            thresh: '5',
            invalid_url: false,
            invalid_name: false,
        };
    }

    handleChange = (event) => {
        this.setState({[event.target.name]: event.target.value});

        if(event.target.name === 'url'){
            this.setState({
                invalid_url: !(event.target.value.startsWith("http://") ||
                            event.target.value.startsWith("https://") ||
                            event.target.value.includes(" "))
            });
        }else if(event.target.name === 'name'){
            this.setState({
                invalid_name:   (event.target.value.length === 0 || 
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
                token: localStorage.getItem('@notify-change/access_token'),
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

    is_valid() {
        if( this.state.invalid_url || 
            this.state.invalid_name || 
            this.state.url === '' || 
            this.props.api_status !== 'online') return false;
        return true;
    }

    render() {
        let name_warning;
        if(this.state.invalid_name){
            name_warning = <p className="help is-danger">Name lenght must be between 0 and 24.</p>;
        }

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
                        <input className={"input " + (this.state.invalid_name ? 'is-danger' : '')} type="text" name="name" placeholder="Name" value={this.state.name} onChange={this.handleChange}/>
                    </div>
                    {name_warning}

                    <label className="label">URL:</label>
                    <div className="control has-icons-right">
                        <input className={"input " + (this.state.invalid_url ? 'is-danger' : '')} type="text" name="url" placeholder="URL" value={this.state.value} onChange={this.handleChange}/>
                    </div>
                    {this.state.invalid_url ? <p className="help is-danger">Invalid URL</p> : null}

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
                        <button className="button is-primary" onClick={this.handleSubmit} disabled={!(this.is_valid())}>Submit</button>
                    </div>
                </div>
            </div>
        );
    }
}
