import React from 'react';
import './CardEdit.css';
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import { useState } from 'react';
import { DialogContent } from '@material-ui/core';
import {makeStyles} from "@material-ui/core/styles";
import axios from "axios";
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { getAPILink } from './Utility';


function CardEditCategory(props) {
    const {pop, setPop, setT, title, setOr, orValue, updateParent} = props;
    const [val, setVal] = useState(title);
    const[oval, setOVal] = useState(orValue);
    

    function saveData() {
        let y = val + '-' + oval;
        axios({
            url: 'http://' + getAPILink() + '/saveRequirementCategory/' + y,
            method: 'POST',
        })
        .then((response) => {
            console.log(response)
        })

        if(updateParent) {
            updateParent(val);
        }

    }
 
    function saveCourseList() {
        axios({
            url: 'http://' + getAPILink() + '/saveCourseList/' + val,
            method: 'POST',
        })
        .then((response) => {
            console.log(response)
        })
        alert("Course list has been saved!")
    }

    const close = () => {
        setPop(false);
    }

    const submit = (e) => {
        saveData();
        setPop(false);
        setT(val);
        setOr(oval);
    }


    const dialogStyle = makeStyles(() => ({
        dialog: {
          height: 500,
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
            <DialogTitle disableTypography className='dialogTitle'>
                <h2>Input Info </h2>
                <IconButton onClick={close}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <div class = "element">                    
                    <form onSubmit = {submitForm}>
                        <label>Category:</label> <br />
                        <input type = "text" value = {val} onInput = {e => setVal(e.target.value)} placeholder = "Requirement name"/>
                    </form>
                </div>
                <div class = "element">
                    <select onInput={e => setOVal(e.target.value)} value = {oval}>
                        <option value = "AND"> ALL </option>
                        <option value = "OR"> ANY </option>
                    </select>    
                </div>

                <div class = "element">
                    <button onClick={submit}> Submit </button>
                    <br />
                    <br />
                    <button onClick={saveCourseList}>Create course list</button>
                </div>
            </DialogContent>
        </Dialog>

    );
}
export default CardEditCategory;