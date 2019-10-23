import React, { Component } from 'react';

import './Logs.css';

const API_URL = process.env.REACT_APP_API_ENDPOINT;

export default class Logs extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: [],
            delay: 60*1000,
        }
    };

    componentDidMount() {
        this.fetchLogs();
        this.setupTimer();
    };
      
    setupTimer() {
        fetch(API_URL + '/api/config')
        .then(_response => _response.json())
        .then(response => {
            if(response != null){
                this.timer = setInterval(() => this.fetchLogs(), (response['delay']*1000)/2);
            }
        });
    };

    fetchLogs = () => {
        fetch(API_URL + '/api/websites/logs')
        .then(_response => _response.json())
        .then(response => {
            this.setState({ data: response });
        });
    }

    handleRead = (event) => {
        fetch(API_URL + '/api/websites/logs', {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: localStorage.getItem('@notify-change/access_token'),
                id:     event.target.id === "all" ? "all" :
                            this.state.data[event.target.id]['id'],
                read:   event.target.id === "all" ? "1" : 
                            this.state.data[event.target.id]['read'] === 0 ? 1 : 0,
            })
        })
        .catch(() => {
            alert("Error while trying to change read log: " + event.target.id);
        }).then(() => {
            this.fetchLogs();
        });
    }

    handleDelete = (event) => {
        fetch(API_URL + '/api/websites/logs', {
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
            alert("Error while trying to delete log: " + event.target.id);
        }).then(() => {
            this.fetchLogs();
        });
    };

    getDateFormatted = (timestamp) => {
        var date = new Date(timestamp)
        return date.getDate() + "/" + date.getMonth() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds()
    }

    render() {
        if(this.props.api_status !== 'online') return null;

        return (
            <div id="logs" className="box">

                <div className="header centered">
                    <span className="title">
                        Logs
                    </span>

                    <span className="header-control">
                        <i className="fas fa-sync pointer" title="Refresh logs" onClick={this.fetchLogs}></i>
                        <i className="fa fa-tasks pointer" title="Mark all as read" id='all' onClick={this.handleRead}></i>
                        <i className="fa fa-trash pointer" title="Delete all" id='all' onClick={this.handleDelete}></i>
                    </span>
                </div>

                <div id="list">
                    {this.state.data.map((x, index) => 
                        <div className={"list-line " + (x['read'] ? "" : "unread")} key={x['id']}>
                            <span className="icon">
                                <i className="fa fa-book"></i>
                            </span>
                            
                            <a href={x['url']}>
                                {x['name']}
                            </a>

                            <span>
                            : {x['title']}
                            </span>

                            <div className="list-control">
                                <span className="list-control-item logs-time">
                                    {this.getDateFormatted(x['time'])}
                                </span>

                                {x['read'] ? 
                                    <i className="list-control-item far fa-check-circle pointer" title="Mark as unread" id={index} onClick={this.handleRead}></i> :
                                    <i className="list-control-item fas fa-check-circle pointer" title="Mark as read" id={index} onClick={this.handleRead}></i>
                                }
                                <i className="list-control-item fas fa-times pointer" title="Delete" id={x['id']} onClick={this.handleDelete}></i>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}
