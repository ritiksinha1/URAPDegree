import React, { useEffect, useState } from 'react';
import { Tree } from 'react-organizational-chart';
import './Tree.css';
import CardCategory from './CardCategory';
import axios from "axios";
import { getAPILink } from './Utility';


function ReqTree(props) {
  const {loadedClasses, allLoadedClasses, degree, canEditReqs} = props;
  const [canEdite, changeCanEdite] = useState(true);
  const delChild = (i) => {
  }

  useEffect(() => {
    canEdit()
  }, [])

  let y = 'Overall-AND';
  console.log(loadedClasses)
  axios({
      url: 'http://' + getAPILink() + '/saveRequirementCategory/' + y,
      method: 'POST',
  })
  .then((response) => {
    console.log(response)
  })

  function canEdit() {
    axios({
      url: 'http://' + getAPILink() + '/canEditReqs',
      method: 'POST',
    })
    .then((response) => {
      console.log(response)
      if(response.data=="true") {
        changeCanEdite(true);
      }
      else {
        changeCanEdite(false);
      }
    })
  }

  return (
    <Tree 
    lineWidth={'1px'}
    lineColor = {'darkblue'}
    lineBorderRadius = {'5px'}
    label={<div class = "root node">{degree}</div>}
    >
      <CardCategory deleteChildren = {delChild} i_parent = {0} isRoot = {true} loadedChildren = {loadedClasses} allLoadedChildren = {allLoadedClasses} preTitle = "Overall" canEdit={canEditReqs}
      />
    </Tree>
);
}



export default ReqTree;