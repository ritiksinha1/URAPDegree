import React from 'react';
import './CardEdit.css';
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import { useState } from 'react';
import { DialogContent } from '@material-ui/core';
import {makeStyles} from "@material-ui/core/styles";
import axios from "axios";
import { getAPILink } from './Utility';



function CardEditCategory(props) {
    const {pop, setPop, preGPA, preResidence, preUnits, setGPA, setResidence, setUnits} = props;
    const [editGpa, setEditGpa] = useState(preGPA);
    const [editUnits, setEditUnits] = useState(preUnits);
    const [editResidence, setEditResidence] = useState(preResidence);
    

    function saveData() {
        if(editGpa != undefined) {
            axios({
                url: 'http://' + getAPILink() + '/saveRequirementOthers/GPA_req-GreaterThan-' + editGpa,
                method: 'POST',
            })
            .then((response) => {
                console.log(response)
            })
        }

        if(editUnits != undefined){
            axios({
                url: 'http://' + getAPILink() + '/saveRequirementOthers/units_req-GreaterThan-' + editUnits,
                method: 'POST',
            })
            .then((response) => {
                console.log(response)
            })
        }

        if(editResidence != undefined){
            axios({
                url: 'http://' + getAPILink() + '/saveRequirementOthers/residence_req-GreaterThan-' + editResidence,
                method: 'POST',
            })
            .then((response) => {
                console.log(response)
            })
        }

    }
 
    const close = () => {
        setPop(false);
    }

    const submit = (e) => {
        setGPA(editGpa);
        setResidence(editResidence);
        setUnits(editUnits);
        saveData();
        setPop(false);
    }

    const submitForm = (e) => {
        e.preventDefault();
        submit();
    }


    const dialogStyle = makeStyles(() => ({
        dialog: {
          height: 500,
          width: 500
        }
      }));

    const classes = dialogStyle();

    return (
        <Dialog classes = {{ paper: classes.dialog }} open = {pop} onClose = {close} >
            <DialogTitle>{"Other Reqs."}</DialogTitle>
            <DialogContent>
                <div class = "element">                    
                    <form onSubmit = {submitForm}>
                        <label>GPA Req.:</label>
                        <input type = "text" value = {editGpa} onInput = {e => setEditGpa(e.target.value)} placeholder = "GPA Requirement"/>
                    </form>
                </div>
                <div class = "element">                    
                    <form onSubmit = {submitForm}>
                        <label>Unit Req.:</label>
                        <input type = "text" value = {editUnits} onInput = {e => setEditUnits(e.target.value)} placeholder = "Unit Requirement"/>
                    </form>
                </div>
                <div class = "element">                    
                    <form onSubmit = {submitForm}>
                        <label>Resident Unit Req.:</label>
                        <input type = "text" value = {editResidence} onInput = {e => setEditResidence(e.target.value)} placeholder = "Residence Requirement"/>
                    </form>
                </div>
                <div class = "element">
                    <button onClick={submit}> Submit </button>
                </div>
            </DialogContent>
        </Dialog>

    );
}
export default CardEditCategory;