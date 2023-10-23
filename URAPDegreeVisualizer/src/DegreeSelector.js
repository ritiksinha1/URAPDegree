import React from 'react';
import './DegreeSelector.css';
import Select from 'react-select';
import { Button } from '@material-ui/core';
import axios from "axios";
import { useState } from 'react';
import NewDegree from './NewDegree';
import { getAPILink } from './Utility';


function DegreeSelector(props) {
    const {pickDegree, changeTreeView, canEdit} = props;

    const [pop, setPop] = useState(false);
    const [selectedDegree, setSelectedDegree] = useState("")

    const degreeOptions = []

    function getExistingRules() {
        axios({
          url: 'http://' + getAPILink() + '/getExistingRules',
          method: 'POST',
        })
        .then((response) => {
          console.log(response)
          for (let rule of response["data"]) {
            degreeOptions.push({value: rule, label: rule})
          }
        })
      }


    function setDegree(selectedDepartment) {
        pickDegree(selectedDepartment["value"])
        setSelectedDegree(selectedDepartment["value"])
    }

    function canEdite() {
      axios({
        url: 'http://' + getAPILink() + '/canEditReqs',
        method: 'POST',
      })
      .then((response) => {
        console.log(response)
        if(response.data=="true") {
          return true;
        }
        else {
          return false;
        }
      })
    }
  

    function saveDegreePicked(){
        axios({
            url: 'http://' + getAPILink() + '/setDegree/' + selectedDegree,
            method: 'POST',
        })
        .then((response) => {
            console.log(response)
        })
        changeTreeView()
    }

    getExistingRules()
    return (
        <div class='header'>
            <div class = "selectSection">
              <p class = "major">Major</p>
              <Select options = {degreeOptions} onChange = {setDegree}/>
              {selectedDegree != "" && <Button onClick={saveDegreePicked}>Submit</Button>}
            </div>
            {canEdit && <div class = "selectSection">
              <div class = "centeredLabel headerText">Or Create a New Degree:</div>
              <Button onClick={setPop}>New Degree</Button>
            </div>
            }
            <NewDegree changeTreeView = {changeTreeView} pop = {pop} pickDegree = {pickDegree} setPop = {setPop}/>
        </div>
    );
}

export default DegreeSelector;