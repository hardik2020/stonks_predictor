import React, { Component } from 'react'

import Navbar from './navbar';

export default class MySecret extends Component {
    constructor() {
        super();
        this.state = { msg: '' };
    }
    componentWillMount()
    {
        var msg = <h4>Secret Page</h4>;
        console.log("inside postdata");
        fetch('/secret',{
            method:'GET',
            headers:{
                "Content-Type":"application/json"
            }
        }).then(res => res.json())
        .then(json => {
            if(json.status===400)
            {
                msg = <h4>Please Login first...</h4>;
                
            }
            this.setState({msg:msg});
            
        });
        
        
    }
    
    
    render() {
        return (
            <>
                <div>
                    <Navbar></Navbar>
                    {this.state.msg}
                </div>
            </>
        )
    }
}
