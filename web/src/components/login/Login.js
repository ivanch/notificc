import React, { Component } from 'react';

import Tag from '../tag/Tag.js';
import './Login.css';

export default class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            apiStatus: 'offline',
            authPass: '',
        };
    }

    componentDidMount() {
        this.fetchAPI();
        this.checkAuth();
        this.timer = setInterval(() => this.fetchAPI(), 2500);
    }

    fetchAPI() {
        fetch('/api/status')
        .then(_response => _response.json())
        .then(response => {
            this.setState({apiStatus: 'online'});
        })
        .catch(error => {
            this.setState({apiStatus: 'offline'});
        });
    }

    checkAuth() {
        fetch('/api/auth/token', {
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
            this.props.handleAuth(authorized);
        });
    }

    handleLogin = (event) => {
        event.preventDefault();

        fetch('/api/auth/password', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                auth_pass: this.state.authPass,
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log("dados:", data);
            if(data['message'] === 'Authorized'){
                localStorage.setItem('@notificc/access_token', data['token']);
                this.props.handleAuth(true);
            }else{
                alert('Wrong password!');
            }
        });
    }

    getAPIStatusColor(){
        if(this.state.apiStatus === 'online'){
            return 'is-success';
        }else if(this.state.apiStatus === 'offline'){
            return 'is-danger';
        }else{
            return 'is-black';
        }
    }

    handleChange = (event) => {
        this.setState({[event.target.name]: event.target.value});
    }

    render() {
        return (
            <div id='login'>
                <div id='login-box'>
                    <div className='auth-header'>
                        <h1>Auth</h1>
                        <Tag name='api' content={this.state.apiStatus} color={this.getAPIStatusColor()} />
                    </div>
                    <form className='field' onSubmit={this.handleLogin}>                        
                        <label className='label'>Password:</label>
                        <input  className='input'
                                type='password'
                                name='authPass'
                                value={this.state.authPass}
                                onChange={this.handleChange}
                        />

                        <div className='submit'>
                            <input  type='submit'
                                    className='button is-primary'
                                    disabled={this.state.apiStatus !== 'online'}
                                    value='Login'
                            />
                        </div>
                    </form>
                </div>
            </div>
        );
    }
}
