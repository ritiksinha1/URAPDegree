import React from 'react';
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import { useState } from 'react';
import { DialogContent, Select } from '@material-ui/core';
import {makeStyles} from "@material-ui/core/styles";
import axios from "axios";
import { useEffect } from 'react';
import { parseData, getAPILink } from './Utility';




function ImportList(props) {
    const {courseListPop, setCourseListPop, addListToTree} = props;
  
    const [listOptions, setListOptions] = useState([]);
    const [selectedList, setSelectedList] = useState("");

    const dialogStyle = makeStyles(() => ({
        dialog: {
          height: 250,
          width: 500
        }
      }));

    const classes = dialogStyle();

      
    function getExistingCourseList() {
        axios({
            url: 'http://' + getAPILink() + '/getExistingCourseList',
            method: 'POST',
        })
        .then((response) => {
            let a = []
            for (let list of response["data"]) {
                a.push(list)
            }
            setListOptions(a)
         })
    }

    function loadList() {
        axios({
            url: 'http://' + getAPILink() + '/getCourseListRules/' + selectedList,
            method: 'POST',
        })
        .then((response) => {
            const parsedReqs = parseData(response["data"]["data"])
            setCourseListPop(false)
            console.log(parsedReqs)
            addListToTree(parsedReqs)
            e.preventDefault();
         })
    }

    useEffect(() =>{
        getExistingCourseList()
    }, []);
    
    
    return (
        <Dialog classes = {{ paper: classes.dialog }} open = {courseListPop} onClose = {() => setCourseListPop(false)} >
            <DialogTitle>{"Import a Course List"}</DialogTitle>
            <DialogContent>
                <div>                 
                    <label>Course List: </label><br />
                    <select onChange={e => setSelectedList(e.target.value)}>
                        <option> </option>
                        {
                            listOptions.map(x => <option>{x}</option>)
                        }
                    </select>    
                </div>
                <div>
                    <button class = "button" onClick = {loadList}> Submit </button>
                    <br/>
                    <button class = "button" onClick={() => setCourseListPop(false)}>Close</button>
                </div>
            </DialogContent>
        </Dialog>

    );
}
export default ImportList;