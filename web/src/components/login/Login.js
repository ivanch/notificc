import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import './Login.css';

const API_URL = process.env.REACT_APP_API_ENDPOINT;

export default class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            api_status: 'offline',
            auth_pass: '',
            auth: false,
        };
    };

    componentDidMount() {
        this.fetch_api();
        this.check_auth();
        this.timer = setInterval(() => this.fetch_api(), 5000);
    };

    async fetch_api() {
        fetch(API_URL + '/api/status')
        .then(_response => _response.json())
        .then(response => {
            this.setState({api_status: 'online'});
        })
        .catch(error => {
            console.error(error);
            this.setState({api_status: 'offline'});
        });
    }

    check_auth() {
        fetch(API_URL + '/api/auth/token', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: localStorage.getItem('@notify-change/access_token'),
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
                auth_pass: this.state.auth_pass,
            })
        })
        .then(_response => _response.json())
        .then(data => {
            if(data['message'] === 'Authorized'){
                localStorage.setItem('@notify-change/access_token', data['token']);
                this.setState({auth: true});
                this.props.handleAuth(true);
            }else{
                alert("Wrong password!");
            }
        });
    }

    handleChange = (event) => {
        this.setState({[event.target.name]: event.target.value});
    }

    render() {
        if(this.state.auth){
            clearInterval(this.timer);
            return <Redirect to="/index" />
        }

        let api_tag;
        if(this.state.api_status === 'online'){
            api_tag = <span className="tag is-success tag-compact">online</span>;
        }else{
            api_tag = <span className="tag is-danger tag-compact">offline</span>;
        }

        return (
            <div id="login">
                <div id="login-box">
                    <div className="auth-header">
                        <h1>Auth</h1>
                        <div className="tags has-addons tags-center">
                            <span className="tag is-dark tag-compact">api status</span>
                            {api_tag}
                        </div>
                    </div>
                    <div className="field">                        
                        <label className="label">Password:</label>
                        <div className="control">
                            <input className="input" type="password" name="auth_pass" value={this.state.auth_pass} onChange={this.handleChange}/>
                        </div>

                        <div className="submit control">
                            <button className="button is-primary" onClick={this.handleLogin} disabled={this.state.api_status !== 'online'}>Login</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
