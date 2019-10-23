import React, { Component } from 'react';
import './Tag.css';

export default class Tag extends Component {
    constructor(props) {
        super(props);
    };

    getTagContent() {
        if(this.props.click){
            return <span
                        className={"tag " + this.props.color}
                        style={{"cursor":"pointer"}}
                        onClick={this.props.click}
                    >
                        {this.props.content}
                    </span>;
        }else{
            return <span
                        className={"tag " + this.props.color}
                    >
                        {this.props.content}
                    </span>;
        }
    }

    render(){
        return (
            <div className="tags has-addons">
                <span className="tag is-dark">{this.props.name}</span>
                {this.getTagContent()}
            </div>
        )
    }

}