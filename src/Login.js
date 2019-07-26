import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import API_URL from './config';

import './Login.css';

export default class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            api_status: false,
            password: '',
            auth: false,
        }
    };

    componentDidMount() {
        this.fetch_api();
        this.timer = setInterval(() => this.fetch_api(), 5000);
    };

    async fetch_api() {
        fetch(API_URL + '/api/status')
        .then(_response => _response.json())
        .then(response => {
            if(response != null){
                this.setState({api_status: 'online'});
            }else{
                this.setState({api_status: 'offline'});
            }
        })
        .catch(error => console.error(error));
    }

    handleChange = (event) => {
        this.setState({[event.target.name]: event.target.value});
    }

    handleLogin = () => {
        fetch(API_URL + '/api/auth/password', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                password: this.state.password,
            })
        }).then(_response => _response.json())
          .then(data => {
                console.log(data);
                if(data['message'] === 'Authorized'){
                    localStorage.setItem('@notify-change/access_token', data['token']);
                    this.setState({auth: true});
                }else{
                    alert("Wrong password!");
                }
        });
    }

    render() {
        if(this.state.auth){
            clearInterval(this.timer);
            return <Redirect to="/index" />
        }

        let api_tag;
        if(this.state.api_status === 'online'){
            api_tag = <span className="tag is-success tag-compact">online</span>;
        }else if(this.state.api_status === 'offline'){
            api_tag = <span className="tag is-danger tag-compact">offline</span>;
        }else{
            api_tag = <span className="tag is-black tag-compact">error</span>;
        }

        return (
            <div id="auth">
                <div className="field center">
                    <h1 id="head">Auth</h1>
                    <div className="tags has-addons tags-center">
                        <span className="tag is-dark tag-compact">api status</span>
                        {api_tag}
                    </div>
                    
                    <label className="label">Password:</label>
                    <div className="control">
                        <input className="input" type="password" name="password" value={this.state.password} onChange={this.handleChange}/>
                    </div>

                    <div className="submit control">
                        <button className="button is-primary" onClick={this.handleLogin} disabled={this.state.api_status !== 'online'}>Login</button>
                    </div>
                </div>
            </div>
        );
    }
}
