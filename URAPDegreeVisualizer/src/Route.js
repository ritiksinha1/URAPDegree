import React, { useEffect, useState } from 'react';
import App from './App';
import CourseListViewer from './CourseListViewer';
import DegreeSelector from './DegreeSelector';
import ListTree from './ListTree';
import Login from './Login';
import Navbar from './Navbar';
import StepNavigation from './StepNavigation';

function Route() {
    useEffect(() => {
        document.title = "AskOski Degree Editor"
    })
    const [degree, setDegree] = useState();
    const [list, setList] = useState("");
    const [selectorView, setSelectorView] = useState(false);
    const [treeView, setTreeView] = useState(false);
    const [loginView, setLoginView] = useState(true);
    const [listView, setListView] = useState(false);
    const [listTreeView, setListTreeView] = useState(false);
    const [step, setStep] = useState(1);
    const [allLoadedReqs, setAllLoadedReqs] = useState()
    const [stepName, setStepName] = useState()
    const [canEditReqs, setCanEditReqs] = useState(true);


    function pickDegree(deg) {
        setDegree(deg);
    }

    function pickList(chosenList) {
        setList(chosenList);
    }

    function changeTreeView(){
        setSelectorView(false);
        setTreeView(true);
        setStep(3.1);
    }

    function changeDegreeView() {
        setStepName("Input the Degree to be Edited")
        setLoginView(false);
        setTreeView(false);
        setListView(false);
        setListTreeView(false);
        setSelectorView(true);
        setStep(3);
    }    

    function changeListView() {
        setStepName("View Course Lists")
        setLoginView(false);
        setListView(true);
        setSelectorView(false);
        setListTreeView(false);
        setStep(2);
    }

    function changeListTreeView() {
        setListView(false);
        setListTreeView(true);
        setStep(2.1);
    }

    function logout() {
        setLoginView(true);
        setTreeView(false);
        setListView(false);
        setListTreeView(false);
        setSelectorView(false);
        setStep(1);
    }

    return (
        <div>
            <Navbar logout={logout} loggedIn={step>1}/>
            {step > 1 && <StepNavigation changeDegreeView = {changeDegreeView} changeListView = {changeListView} degree={degree} step = {step} stepName={stepName} canSeeLeftOnStep3={canEditReqs}/>}
            {loginView && <Login changeListView={changeListView} changeDegreeView={changeDegreeView} setCanEditReqs={setCanEditReqs}/>}
            { selectorView && <DegreeSelector changeTreeView = {changeTreeView} pickDegree = {pickDegree} canEdit={canEditReqs}/> }
            {listView && <CourseListViewer changeListTreeView = {changeListTreeView} pickList={pickList} setAllReqs = {setAllLoadedReqs}/>}
            {listTreeView && <ListTree allLoadedReqs = {allLoadedReqs}/>}
            { treeView && <App degreePicked = {degree} canEditReqs={canEditReqs}/> }
        </div>
    );
}

export default Route;