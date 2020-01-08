import React, { Component } from 'react';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './Theme.css';

export default class Theme extends Component {
    constructor(props) {
        super(props);

        this.state = {
            theme: 'Light',
        };
    }

    componentDidMount() {
        this.updateTheme(this.getTheme());
    }

    handleSelect = (event) => {
        this.updateTheme(event.target.selected);
    }

    getTheme() {
        const stored = localStorage.getItem('@notificc/theme');
        return stored === 'null' ? 'Light' : stored;
    }

    updateTheme = (theme) => {
        this.setState({theme: theme});
        localStorage.setItem('@notificc/theme', theme);
    }

    render(){
        return (
            <div id='theme-selector'>
                <div className='select'>
                    <select onSelect={this.handleSelect}>
                        <option value='light'>Light</option>
                        <option value='dark'>Dark</option>
                        <option value='electron'>Electron</option>
                    </select>
                </div>
            </div>
        )
    }

}