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
    }

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
    }

    render() {
        if(this.props.api_status !== 'online') return null;

        return (
            <div className="List">
                <nav className="panel">
                    <p className="panel-heading">
                        Websites:
                    </p>
                    {this.state.data.map(x => 
                        <a className={"panel-block " + (x['enabled'] ? "is-active" : "")} key={x['id']}>
                            <span className="panel-icon">
                                <i className="fa fa-book" aria-hidden="true"></i>
                            </span>
                            {x['url']}
                            <span className="control">
                                <i className="fa fa-minus" id={x['id']} onClick={this.handleDelete}></i>
                            </span>
                        </a>
                    )}
                </nav>
            </div>
        );
    }
}
