import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import App from './App';
import RequiresAuth from './RequiresAuth.js';

import { Route, Switch, BrowserRouter } from 'react-router-dom';

import * as serviceWorker from './serviceWorker';
import Login from './components/login/Login';

const routing = (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
        <RequiresAuth>
            <Switch>
                <Route path='/' exact={true} component={App} />
                <Route path='/index' component={App} />
                <Route path='/login' component={Login} />
            </Switch>
        </RequiresAuth>
    </BrowserRouter>
)

ReactDOM.render(routing, document.getElementById('root'));

serviceWorker.register();