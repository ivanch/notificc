import React, { Component } from 'react';
import API_URL from './config';

import './EmailModal.css';

export default class EmailModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            user: 'null',
            password: '',
            SMTP_server: 'null',
            SMTP_port: 'null',
            SMTP_ttls: 1,
        }
    };

    componentDidUpdate(prevProps) {
        if (this.props.active !== prevProps.active && this.props.active === true) {
            this.fetchData();
        }
    }
      
    fetchData() {
        fetch(API_URL + '/api/email')
        .then(_response => _response.json())
        .then(response => {
            if(response != null){
                this.setState({user: response['user'], SMTP_server: response['SMTP_server'], SMTP_port: response['SMTP_port']})
            }
        });
    }   

    handleChange = (event) => {
        this.setState({[event.target.name]: event.target.value});
    }

    handleCheck = (event) => {
        this.setState({[event.target.name]: event.target.checked});
    }

    handleClose = () => {
        this.props.handleClose("email");
    }

    handleSubmit = () => {
        fetch(API_URL + '/api/email', {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user: this.state.user,
                password: this.state.password,
                SMTP_server: this.state.SMTP_server,
                SMTP_port: this.state.SMTP_port,
                SMTP_ttls: this.state.SMTP_ttls,
            })
        })
        .then()
        .then(() => {
            this.handleClose();
        });
    }

    handleTest = () => {
        fetch(API_URL + '/api/email/test', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user: this.state.user,
                password: this.state.password,
                SMTP_server: this.state.SMTP_server,
                SMTP_port: this.state.SMTP_port,
                SMTP_ttls: this.state.SMTP_ttls,
            })
        })
        .then(_response => _response.json())
        .then(response => {
            if(response['message'] !== 'Success'){
                alert("Server has returned an error: " + response['message'] + "("+response['statusCode']+")");
            }
        })
        .catch(() => {
            alert("Some undefined error has occurred.");
        });
    }    

    render() {
        return (
            <div className={"modal " + (this.props.active ? 'is-active' : '')}>
                <div className="modal-background" onClick={this.handleClose}></div>
                <div className="modal-content">
                    <div id="settings" className="box">
                        <h3 className="title">
                            Email Settings
                        </h3>
                        <div className="field">
                            <label className="label">Email user:</label>
                            <div className="control">
                                <input className="input" type="email" name="user" placeholder="User" value={this.state.user} onChange={this.handleChange}/>
                            </div>

                            <label className="label">Email password:</label>
                            <div className="control">
                                <input className="input" type="password" name="password" placeholder="Password" value={this.state.password} onChange={this.handleChange}/>
                            </div>

                            <label className="label">SMTP server:</label>
                            <div className="field has-addons">
                                <div className="control" style={{'width':'20em'}}>
                                    <input className="input" type="text" name="SMTP_server" placeholder="SMTP IP" value={this.state.SMTP_server} onChange={this.handleChange}/>
                                </div>
                                <div className="control" style={{'width':'10em'}}>
                                    <input className="input" type="text" name="SMTP_port" placeholder="SMTP Port" value={this.state.SMTP_port} onChange={this.handleChange}/>
                                </div>
                            </div>

                            <div className="level">
                                <div className="level-item level-left">
                                    <div>
                                        <label className="label">SMTP TTLS:</label>
                                        <div>
                                            <label className="checkbox">
                                                <input type="checkbox" name="SMTP_ttls" checked={this.state.SMTP_ttls} onChange={this.handleCheck}/> TTLS Enabled
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="level-item level-right">
                                    <div>
                                        <div className="submit control">
                                            <button
                                                className="button is-info tooltip is-tooltip-left"
                                                data-tooltip="Test your configuration before submitting it."
                                                onClick={this.handleTest}
                                            >
                                                Email test
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="submit control">
                                <button className="button is-primary" onClick={this.handleSubmit}>Submit</button>
                            </div>
                        </div>
                    </div>
                </div>
                <button className="modal-close is-large" aria-label="close" onClick={this.handleClose}></button>
            </div>
        )
    }
}