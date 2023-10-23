import React from 'react';
import Select from 'react-select';
import { Button } from '@material-ui/core';
import axios from "axios";
import { useState } from 'react';
import { parseData, getAPILink } from './Utility';

function CourseListViewer(props) {

    const {changeListTreeView, pickList, setAllReqs} = props;
    const [selectedList, setSelectedList] = useState("")

    const listOptions = []

    function getExistingLists() {
        axios({
          url: 'http://' + getAPILink() + '/getExistingCourseList',
          method: 'POST',
        })
        .then((response) => {
          console.log(response)
          for (let option of response["data"]) {
            listOptions.push({value: option, label: option})
          } 
        })
      }


    function setList(selectList) {
        setSelectedList(selectList["value"])
        pickList(selectList["value"])
        axios({
            url: 'http://' + getAPILink() + '/getCourseListRules/' + selectList["value"],
            method: 'POST',
          })
          .then((response) => {
            const pickedListData = response["data"]["data"]
            const allReqs = parseData(pickedListData)
            setAllReqs(allReqs)
          })
    }


    function saveListPicked(){
      pickList(selectedList)
      changeListTreeView()
    }

    getExistingLists()
    return (
        <div class='header'>
            <div class = "selectSection">
              <p class = "major">Course List</p>
              <Select options = {listOptions} onChange = {setList}/>
              <br />
              <Button onClick={saveListPicked}>Submit</Button>
            </div>
        </div>
    );
  }

export default CourseListViewer;