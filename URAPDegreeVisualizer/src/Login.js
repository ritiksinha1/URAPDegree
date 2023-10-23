import React, {useState} from 'react';
import { Button } from '@material-ui/core';
import axios from "axios";
import './Login.css';
import { getAPILink } from './Utility';


function Login(props) {
    const {changeListView, changeDegreeView, setCanEditReqs} = props;
    const [password, setPassword] = useState("");

    const submit = (e) => {
        e.preventDefault()
        axios({
            url: 'http://' + getAPILink() + '/login/' + password,
            method: 'POST',
        })
        .then((response) => {
            if(response.data == "success") {
                axios({
                    url: 'http://' + getAPILink() + '/canSeeCourseLists',
                    method: 'POST',
                }).then((response) => {
                    if (response.data == "true") {
                        setCanEditReqs(true)
                        changeListView()
                    }
                    else {
                        setCanEditReqs(false)
                        changeDegreeView()
                    }
                })
            }
            else {
                setPassword("")
                alert("Incorrect login info! Please try again.")
            }
        })
    }

    return (
        <div class='headerLogin'>
            <h2 class = "headerT">Please first login to proceed to portal</h2>
            <div class = "login">
              <div class = "password">                    
                <form onSubmit={submit}>
                    <input type = "text" onInput = {e => setPassword(e.target.value)} value={password} placeholder = "Password"/>
                </form>
              </div>
              <div class = "submit">
                <Button onClick={submit}>Submit</Button>
              </div>
            </div>
        </div>
    );
}

export default Login;