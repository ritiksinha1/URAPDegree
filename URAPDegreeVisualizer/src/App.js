import './App.css';
import ReqTree from './Tree';
import axios from "axios";
import { Button } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { parseData, getAPILink } from './Utility';


function App(props) {
  
  const {degreePicked, canEditReqs} = props;

  function saveRule() {
    axios({
      url: 'http://' + getAPILink() + '/saveRules',
      method: 'POST',
    })
    .then((response) => {
      console.log(response)
    })
  }

  const [allLoadedClasses, setAllLoadedClasses] = useState({})
  const [topLevelLoadedClasses, setTopLevelLoadedClasses] = useState([])

  function loadRule() {
    axios({
      url: 'http://' + getAPILink() + '/getRules',
      method: 'POST',
    }).then((response) => {
      let dict = response["data"]["data"]
      const dictRequirements = parseData(dict)
      setAllLoadedClasses(dictRequirements)
      for (let top in dictRequirements){
        if(dictRequirements[top].name == "Overall") {
          for (let findGreater in dictRequirements) {
            if (dictRequirements[findGreater]["type"] == "GreaterThan") {
              dictRequirements[top]["reqs"].push(dictRequirements[findGreater].name)
            } 
          }
          setTopLevelLoadedClasses(dictRequirements[top]["reqs"])
        }

      }
    })
  }

  function clearRequirements() {
    axios({
      url: 'http://' + getAPILink() + '/clearRequirements',
      method: 'POST',
    })
    .then((response) => {
      console.log(response);
    })
  }

  useEffect(() => {
    window.addEventListener('beforeunload', alertUser)
    return () => {
      window.removeEventListener('beforeunload', alertUser)
    }
  })


  useEffect(() => {
    loadRule()
  }, [])

  const alertUser = (event) => {
    clearRequirements()
    event.preventDefault()
    event.returnValue = ''
  }
  
  function reset() {
    clearRequirements()
    setAllLoadedClasses([])
    setTopLevelLoadedClasses([])
    page()
  }

  function askReset(){
    let x = window.confirm("Are you sure you want to clear?");
    if(x) {
      reset()
    }
  }


  function page() { 
    return (
    <div className="App">
      {canEditReqs && <div class = "step">
        <Button onClick={saveRule}>Save</Button>
        <Button onClick={loadRule}>Load</Button>
        <Button onClick={askReset}>Clear</Button>
      </div>}
      <ReqTree loadedClasses = {topLevelLoadedClasses} allLoadedClasses = {allLoadedClasses} key={new Date().getTime()} degree = {degreePicked} canEditReqs = {canEditReqs}/>
    </div>
    )
  }

  return (
    page()
  );
}

export default App;