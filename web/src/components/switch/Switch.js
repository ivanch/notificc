import React, { Component } from 'react';

import './Switch.css';


/*  Switch
    props:
        id
        onChange
        checked
        title
*/
export default class Switch extends Component {
    
    render(){
        return(
            <div className='switch'>
                <input
                    type='checkbox'
                    className='switch-checkbox'
                    id={this.props.id}
                    name={this.props.name}
                    onChange={this.props.onChange}
                    checked={this.props.checked}
                />
                <label
                    className='switch-label'
                    htmlFor={this.props.id}
                    title={this.props.title}>    
                </label>
            </div>
        )
    }

}