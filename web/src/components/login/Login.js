import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import Tag from '../tag/Tag.js';
import './Login.css';

const API_URL = process.env.REACT_APP_API_ENDPOINT;

export default class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            apiStatus: 'offline',
            authPass: '',
            auth: false,
        };
    }

    componentDidMount() {
        this.fetch_api();
        this.checkAuth();
        this.timer = setInterval(() => this.fetch_api(), 5000);
    }

    async fetch_api() {
        fetch(API_URL + '/api/status')
        .then(_response => _response.json())
        .then(response => {
            this.setState({apiStatus: 'online'});
        })
        .catch(error => {
            console.error(error);
            this.setState({apiStatus: 'offline'});
        });
    }

    checkAuth() {
        fetch(API_URL + '/api/auth/token', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: localStorage.getItem('@notificc/access_token'),
            })
        })
        .then(_response => _response.json())
        .then(response => {
            var authorized = response['message'] === 'Authorized';
            this.setState({auth: authorized});
            this.props.handleAuth(authorized);
        });
    }

    handleLogin = () => {
        fetch(API_URL + '/api/auth/password', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                auth_pass: this.state.authPass,
            })
        })
        .then(_response => _response.json())
        .then(data => {
            if(data['message'] === 'Authorized'){
                localStorage.setItem('@notificc/access_token', data['token']);
                this.setState({auth: true});
                this.props.handleAuth(true);
            }else{
                alert("Wrong password!");
            }
        });
    }

    getAPIStatusColor(){
        if(this.state.apiStatus === 'online'){
            return "is-success";
        }else if(this.state.apiStatus === 'offline'){
            return "is-danger";
        }else{
            return "is-black";
        }
    }

    handleChange = (event) => {
        this.setState({[event.target.name]: event.target.value});
    }

    render() {
        if(this.state.auth){
            clearInterval(this.timer);
            return <Redirect to="/index" />
        }

        return (
            <div id="login">
                <div id="login-box">
                    <div className="auth-header">
                        <h1>Auth</h1>
                        <Tag name="api" content={this.state.apiStatus} color={this.getAPIStatusColor()} />
                    </div>
                    <div className="field">                        
                        <label className="label">Password:</label>
                        <div className="control">
                            <input className="input" type="password" name="authPass" value={this.state.authPass} onChange={this.handleChange}/>
                        </div>

                        <div className="submit control">
                            <button className="button is-primary" onClick={this.handleLogin} disabled={this.state.apiStatus !== 'online'}>Login</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
