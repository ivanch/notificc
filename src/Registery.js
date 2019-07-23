import React, { Component } from 'react';

import './Registery.css'

export default class Registery extends Component {
    constructor(props) {
        super(props);

        this.state = {
            value: '',
        };
    };

    handleChange = (event) => {
        this.setState({value: event.target.value});
    };
  
    handleSubmit = (event) => {
        fetch('http://localhost:5000/api', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url: this.state.value,
            })
        })  .then(response => response.json())
            .then(data => alert(data['isError'] ? 'URL already registered!' : 'Successfully registered URL!'));
        window.location.reload(false);
    };

    render() {
        return (
            <div id="registry" className="box">
                <div className="field">
                    <label className="label">Site URL</label>
                    <div className="control has-icons-left has-icons-right">
                        <input className="input" type="text" placeholder="URL" value={this.state.value} onChange={this.handleChange}/>
                    </div>
                    <div className="control submit">
                        <button className="button is-primary" onClick={this.handleSubmit} disabled={!this.props.api_status}>Submit</button>
                    </div>
                </div>
            </div>
        );
    }
}
