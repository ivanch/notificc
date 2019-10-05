import React, { Component } from 'react';
import API_URL from './config';

import './List.css'

export default class List extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: null,
        }
    };

    componentDidMount() {
        fetch(API_URL + '/api/websites')
        .then(_response => _response.json())
        .then(response => {
            this.setState({ data: response });
        });
    };

    handleClick = (event) => {
        fetch(API_URL + '/api/websites', {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: event.target.id,
            })
        })
        .catch(() => {
            alert("Error while trying to turn on/off website: " + event.target.id);
        });
        window.location.reload(false);
    };

    handleDelete = (event) => {
        fetch(API_URL + '/api/websites', {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: event.target.id,
            })
        })
        .catch(() => {
            alert("Error while trying to delete website: " + event.target.id);
        });
        window.location.reload(false);
    };

    render() {
        if(this.props.api_status !== 'online') return null;

        return (
            <div className="List">
                <nav className="panel">
                    <p className="panel-heading">
                        Websites:
                    </p>
                    {this.state.data.map(x => 
                        <div className={"panel-block " + (x['enabled'] ? "is-active" : "")}>
                            <span className="panel-icon">
                                <i className="fa fa-book" aria-hidden="true"></i>
                            </span>
                            {/* eslint-disable-next-line */}
                            <a  key={x['id']}
                                id={x['id']}
                                onClick={this.handleClick}
                                href='#'
                                title="Enable/disable website check"
                            >
                                {x['url']}
                            </a>
                            <i className="fa fa-minus" title="Delete" id={x['id']} onClick={this.handleDelete}></i>
                        </div>
                    )}
                </nav>
            </div>
        );
    }
}
