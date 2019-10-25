import React, { Component } from 'react';

export default class Warning extends Component {
    render(){
        if(!this.props.enabled) return null;
        return (
            <p className="help is-danger">{this.props.text}</p>
        )
    }

}