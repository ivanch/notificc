import React, { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import Login from './components/login/Login.js';

class RequireAuth extends Component {
    state = {
        isAuthenticated: false
    };

    componentDidMount = () => {
        if (!this.state.isAuthenticated) {
            this.props.history.push('/');
        }
    };

    componentDidUpdate = (prevProps, prevState) => {
        if (this.props.location.pathname !== prevProps.location.pathname &&
            !this.state.isAuthenticated){
            this.props.history.push('/');
        }
    };

    handleAuth = (_isAuthenticated) => {
        this.setState({ isAuthenticated: _isAuthenticated });
    }

    render = () =>
        !this.state.isAuthenticated ? (
            <Login handleAuth={this.handleAuth} />
        ) : (
            <Fragment>
                {this.props.children}
            </Fragment>
    );
}

export default withRouter(RequireAuth);
