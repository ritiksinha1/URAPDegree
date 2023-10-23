import React from 'react';
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import { useState } from 'react';
import { DialogContent } from '@material-ui/core';
import {makeStyles} from "@material-ui/core/styles";
import axios from "axios";
import './NewDegree.css';
import { getAPILink } from './Utility';




function NewDegree(props) {
    const {changeTreeView, pop, pickDegree, setPop} = props;
    const [degree, setDegree] = useState("")

    function saveData() {
        axios({
            url: 'http://' + getAPILink() + '/createDegree/' + degree,
            method: 'POST',
        })
        .then((response) => {
            console.log(response);
         })
         pickDegree(degree)
         axios({
            url: 'http://' + getAPILink() + '/setDegree/' + degree,
            method: 'POST',
        })
        .then((response) => {
            console.log(response)
        })
        changeTreeView()
    }

    const close = () => {
        setPop(false);
    }

    const submit = (e) => {
        saveData()
        setPop(false)
    }


    const dialogStyle = makeStyles(() => ({
        dialog: {
          height: 250,
          width: 500
        }
      }));

    const classes = dialogStyle();

    const submitForm = (e) => {
        e.preventDefault();
        submit();
    }

    return (
        <Dialog classes = {{ paper: classes.dialog }} open = {pop} onClose = {close} >
            <DialogTitle>{"New Degree"}</DialogTitle>
            <DialogContent>
                <div>                 
                    <form onSubmit = {submitForm}>
                        <label>Degree Name: </label><br />
                        <input type = "text" value = {degree} onInput = {e => setDegree(e.target.value)} placeholder = "Degree name"/>
                    </form>
                </div>
                <div>
                    <button class = "button" onClick={submit}> Submit </button>
                </div>
            </DialogContent>
        </Dialog>

    );
}
export default NewDegree;