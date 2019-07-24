import React, { Component } from 'react';

import './List.css'

export default class List extends Component {
    handleDelete = (event) => {
        fetch('http://localhost:5000/api', {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: event.target.id,
            })
        }).catch(() => {
            alert("Error while trying to delete website: " + event.target.id);
        });
        window.location.reload(false);
    }

    render() {
        return (
            <div className="List">
                <nav className="panel">
                    <p className="panel-heading">
                        Websites:
                    </p>
                    {this.props.data.map(x => 
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
