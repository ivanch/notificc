import React, { Component } from 'react';
import './Registry.css';

import Switch from '../switch/Switch.js';

export default class Registry extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: [],
        };
    }

    componentDidMount() {
        this.fetchWebsites();
    }

    fetchWebsites = () => {
        fetch('/api/websites')
        .then(_response => _response.json())
        .then(response => {
            this.setState({ data: response });
        });
    }

    handleClick = (event) => {
        fetch('/api/websites', {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: localStorage.getItem('@notificc/access_token'),
                id: event.target.id,
            })
        })
        .catch(() => {
            alert('Error while trying to turn on/off website: ' + event.target.id);
        }).then(() => {
            setTimeout(() => {
                this.fetchWebsites();
            }, 25);
        });
    }

    handleDelete = (event) => {
        fetch('/api/websites', {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: localStorage.getItem('@notificc/access_token'),
                id: event.target.id,
            })
        })
        .catch(() => {
            alert('Error while trying to delete website: ' + event.target.id);
        });
        window.location.reload(false);
    }

    render() {
        return (
            <div id='registered' className='box'>
                <div className='header centered'>
                    <span className='title'>
                        Registered websites
                    </span>
                </div>

                <div id='content'>
                    {this.state.data.map(x => (
                        <div className='content-line' key={x['id']}>
                            <span className='icon'>
                                <i className='fa fa-bookmark'></i>
                            </span>
                            
                            <a href={x['url']}>
                                {x['name']}
                            </a>

                            <div className='content-control'>
                                <Switch id={x['id']}
                                        onChange={this.handleClick}
                                        checked={x['enabled']}
                                        title={x['enabled'] ? 'Disable website' : 'Enable website'}
                                />

                                <i className='content-control-item fa fa-times pointer' title='Delete' id={x['id']} onClick={this.handleDelete}></i>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}
