import React from 'react';
import './Navbar.css';
import oskiBear from "./oskiSmall.png"; 

function Navbar(props) {
    const {logout, loggedIn} = props
    return (
        <header class = "bar">
            <div class = "app-title">
                <img src={oskiBear}/>
                <h1>AskOski Degree Editor Portal</h1>
            </div>
            {loggedIn && <h3 onClick={() => {logout()}} style={{cursor:'pointer'}}>Log Out</h3>}
        </header>
    );
}

export default Navbar;

