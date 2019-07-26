import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import App from './App';
import Login from './Login'

import { Route, Switch, BrowserRouter } from 'react-router-dom'

import * as serviceWorker from './serviceWorker';

const routing = (
    <BrowserRouter>
        <Switch>
            <Route path="/" exact={true} component={Login} />
            <Route path="/index" component={App} />
            <Route path="/login" component={Login} />
        </Switch>
    </BrowserRouter>
)  

ReactDOM.render(routing, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
