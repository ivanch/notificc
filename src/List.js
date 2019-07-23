import React, { Component } from 'react';

import './List.css'

export default class List extends Component {
    constructor(props) {
        super(props);
    };

    render() {
        return (
            <div className="List">
                <nav className="panel">
                    <p className="panel-heading">
                        Websites:
                    </p>
                    {this.props.data.map(x => 
                        <a className="panel-block is-active" key={x['url']}>
                            <span className="panel-icon">
                                <i className="fa fa-book" aria-hidden="true"></i>
                            </span>
                            {x['url']}
                        </a>
                    )}
                </nav>
            </div>
        );
    }
}
