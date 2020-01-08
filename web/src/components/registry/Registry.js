import React, { Component } from 'react';
import './Registry.css';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Switch from '../switch/Switch.js';

export default class Registry extends Component {
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
            toast.error('Error while trying to turn on/off website: ' + event.target.id);
        }).then(() => {
            setTimeout(() => {
                this.props.fetchWebsites();
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
        .then(() => {
            this.props.fetchWebsites();
        })
        .catch(() => {
            toast.error('Error while trying to delete website: ' + event.target.id);
        });
    }

    handleEdit = (event) => {
        this.props.setEditing(event.target.id);
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
                    {this.props.websites.map(x => (
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

                                <i className='content-control-item fa fa-edit pointer' title='Edit' id={x['id']} onClick={this.handleEdit}></i>

                                <i className='content-control-item fa fa-times pointer' title='Delete' id={x['id']} onClick={this.handleDelete}></i>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}
