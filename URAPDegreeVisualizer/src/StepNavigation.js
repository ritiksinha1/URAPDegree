import { Button } from '@material-ui/core';
import React, { useState } from 'react';
import './StepNavigation.css';


function StepNavigation(props) {
    const {changeDegreeView, changeListView, degree, step, canSeeLeftOnStep3} = props
    const [stepDescription, changeStepDescription] = useState(step==2 ? "View Course Lists" : "Input the Degree to be Viewed")

    function right() {
        if (step == 2 || step == 2.1) {
            changeDegreeView()
            changeStepDescription(canSeeLeftOnStep3 ? "Input the Degree to be Edited" : "Input the Degree to be Viewed")
        }
    }

    function left() {
        if (step == 3.1) {
            changeDegreeView()
            changeStepDescription(canSeeLeftOnStep3 ? "Input the Degree to be Edited" : "Input the Degree to be Viewed")
        }
        if (step == 3 || step == 2.1) {
            changeListView()
            changeStepDescription("View Course Lists")
        }
    }

    if (step == 1) {
        return null
    }

    if(step == 3.1 && !stepDescription.includes("Input Degree Requirements")) {
        changeStepDescription("Input Degree Requirements for " + degree)
    }

    if(step == 2.1) {
        return (
            <header class = "stepBarListTree">
                <h2 class = "headerText">Step {step}<br/>{stepDescription}</h2>
                <Button onClick={left}> Back</Button>
            </header>
        );
    }

    
    return (
        <header class = "stepBar">
            <h2 class = "headerText">Step {step - Number(canSeeLeftOnStep3==false)}<br/>{stepDescription}</h2>
            <nav class = "sublinks">
                <ul>
                    {((step==3 && canSeeLeftOnStep3) || (step != 3 && step != 1 && step != 2)) && <li class = "navarrow" onClick={left}> &lt; </li>}
                    <li> Step {step - Number(canSeeLeftOnStep3 == false)} </li>
                    {step != 1 && step!=3 && step!=3.1 && step !=2.1 && <li class = "navarrow" onClick={right}> &gt; </li>}
                </ul>
            </nav>
        </header>
    );
}

export default StepNavigation;

