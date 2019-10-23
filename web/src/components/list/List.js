import React, { Component } from 'react';
import './List.css';

const API_URL = process.env.REACT_APP_API_ENDPOINT;

export default class List extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: [],
        }
    };

    componentDidMount() {
        this.fetchWebsites();
    };

    fetchWebsites = () => {
        fetch(API_URL + '/api/websites')
        .then(_response => _response.json())
        .then(response => {
            this.setState({ data: response });
        });
    }

    handleClick = (event) => {
        fetch(API_URL + '/api/websites', {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: localStorage.getItem('@notify-change/access_token'),
                id: event.target.id,
            })
        })
        .catch(() => {
            alert("Error while trying to turn on/off website: " + event.target.id);
        }).then(() => {
            setTimeout(() => {
                this.fetchWebsites();
            }, 25);
        });
    };

    handleDelete = (event) => {
        fetch(API_URL + '/api/websites', {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: localStorage.getItem('@notify-change/access_token'),
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
            <div id="registered" className="box">
                <div className="header centered">
                    <span className="title">
                        Registered websites
                    </span>
                </div>

                <div id="list">
                    {this.state.data.map(x => 
                        <div className="list-line" key={x['id']}>
                            <span className="icon">
                                <i className="fa fa-bookmark"></i>
                            </span>
                            
                            <a href={x['url']}>
                                {x['name']}
                            </a>

                            <div className="list-control">
                                <div className="list-control-item switch">
                                    <input
                                        type="checkbox"
                                        className="switch-checkbox"
                                        id={x['id']}
                                        onChange={this.handleClick}
                                        checked={x['enabled']}
                                    />
                                    <label
                                        className="switch-label"
                                        htmlFor={x['id']}
                                        title={x['enabled'] ? "Disable website" : "Enable website"}>    
                                    </label>
                                </div>

                                <i className="list-control-item fa fa-times pointer" title="Delete" id={x['id']} onClick={this.handleDelete}></i>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}
