import React, { Component } from 'react';
import './Register.css';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Warning from '../warning/Warning.js';

const initialState = {
    name: '',
    url: '',
    thresh: '5',
    invalidURL: false,
    invalidName: false,
};

export default class Register extends Component {
    constructor(props) {
        super(props);

        this.state = initialState;
    }

    componentDidUpdate(prevProps) {
        if(this.props.editing !== prevProps.editing && this.props.editing !== -1) {
            this.fetchWebsite(this.props.editing);
        }
    }

    fetchWebsite = (id) => {
        fetch('/api/website?id=' + id)
        .then(response => response.json())
        .then(response => {            
            this.setState({ name: response['name'],
                            url: response['url'],
                            thresh: response['thresh']  });
        })
        .catch(err => {
            toast.error(err + '.');
        });
    }

    handleChange = (event) => {
        this.setState({[event.target.name]: event.target.value});

        if(event.target.name === 'url'){
            this.setState({
                invalidURL: !(event.target.value.startsWith('http://') ||
                            event.target.value.startsWith('https://') ||
                            event.target.value.includes(' '))
            });
        }else if(event.target.name === 'name'){
            this.setState({
                invalidName:   (event.target.value.length === 0 || 
                                event.target.value.length > 24)
            });
        }
    }
  
    handleSubmit = (event) => {
        fetch(this.props.editing === -1 ? '/api/websites' : '/api/website', {
            method: this.props.editing === -1 ? 'POST' : 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: localStorage.getItem('@notificc/access_token'),
                id: this.props.editing, // will be used only if != -1
                name: this.state.name,
                url: this.state.url,
                threshold: parseInt(this.state.thresh),
            })
        })
        .then(response => response.json())
        .then(response => {
            if(response['message'] === 'Success'){
                this.props.fetchWebsites();
                this.resetState();
                toast.success('Success.');
            }else if(response['message'] === 'Exists'){
                toast.info('Website is already registered!');
            }else{
                toast.error('Unknown error.');
            }
        })
        .catch(err => {
            toast.error(err + '.');
        });
    }

    resetState = () => {
        this.props.setEditing(-1);
        this.setState(initialState);
    }

    isValid() {
        return !(this.state.invalidURL || 
                this.state.invalidName || 
                this.state.url === '');
    }

    render() {
        return (
            <div id='register' className='box'>
                <div className='centered'>
                    <span className='title'>
                        {this.props.editing === -1 ? 'Register' : 'Edit' } a website
                    </span>
                </div>

                <div className='field'>
                    <label className='label'>Name:</label>
                    <div className='control has-icons-right'>
                        <input className={'input ' + (this.state.invalidName ? 'is-danger' : '')}
                            type='text'
                            name='name'
                            placeholder='Name'
                            value={this.state.name}
                            onChange={this.handleChange}
                        />
                    </div>
                    <Warning enabled={this.state.invalidName} text='Name lenght must be between 0 and 24.' />

                    <label className='label'>URL:</label>
                    <div className='control has-icons-right'>
                        <input className={'input ' + (this.state.invalidURL ? 'is-danger' : '')}
                            type='text'
                            name='url'
                            placeholder='URL'
                            value={this.state.url}
                            onChange={this.handleChange}    
                        />
                    </div>
                    <Warning enabled={this.state.invalidURL} text='Invalid URL.' />

                    <label className='label'>Difference threshold:</label>
                    <div className='columns'>
                        <div className='column is-11'>
                            <div className='control'>
                                <input className='slider is-fullwidth'
                                    name='thresh'
                                    step='1'
                                    min='0' max='100'
                                    value={this.state.thresh}
                                    type='range'
                                    onChange={this.handleChange}
                                />
                            </div>
                        </div>
                        <div className='column'>
                            <label className='label'>{this.state.thresh}%</label>
                        </div>
                    </div>
                    
                    <div className='field is-grouped is-grouped-centered'>
                        <div className='submit control'>
                            <button className='button is-primary'
                                onClick={this.handleSubmit}
                                disabled={!(this.isValid())}>Submit</button>
                        </div>

                        {this.props.editing !== -1 ? (
                            <div className='submit control'>
                                <button className='button is-danger'
                                    onClick={this.resetState}>Cancel</button>
                            </div>
                        ) : null }
                    </div>
                </div>
            </div>
        );
    }
}
