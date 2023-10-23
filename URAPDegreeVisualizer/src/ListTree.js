import React from 'react';
import { Tree } from 'react-organizational-chart';
import './Tree.css';
import CardCategory from './CardCategory';

function ListTree(props) {
  const {allLoadedReqs} = props;
  const delChild = (i) => {
  }

  
  return (
    <Tree 
        lineWidth={'1px'}
        lineColor = {'darkblue'}
        lineBorderRadius = {'5px'}
        label={<div class = "root node">{allLoadedReqs[0]["name"]}</div>}
        >
        <CardCategory deleteChildren = {delChild} i_parent = {0} isRoot = {true} isCourseList = {true} loadedChildren = {allLoadedReqs[0]["reqs"]} allLoadedChildren = {allLoadedReqs} preTitle = {allLoadedReqs[0]["name"]}
        />
    </Tree>
);
}



export default ListTree;