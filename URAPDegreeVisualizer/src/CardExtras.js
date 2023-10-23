import React, { Component } from 'react';
import './Card.css';
import { TreeNode } from 'react-organizational-chart';
import { useState } from 'react';
import CardExtrasEdit from './CardExtrasEdit';


function CardExtras(props) {
    const {deleteChildren, i_parent, updateParent, preGPA, preResidence, preUnits, canEdit=true} = props;
    const [pop, setPop] = useState(false);
    const [gpa, setGpa] = useState(preGPA);
    const [units, setUnits] = useState(preUnits);
    const [residence, setResidence] = useState(preResidence);

    const del = () => {
        deleteChildren(i_parent);
    }

    let updateFromCardEdit;
    if (updateParent) {
        updateFromCardEdit = (name, i) => updateParent(name, i);
    }

    
    
    return (
        <TreeNode label = {<div class="node">
                <div class = "card">
                    <div class = "title">
                        <b>Min. Requirements</b>
                    </div>
                    <div class = "requirements">
                        <div>GPA: {gpa}</div>
                        <div>Total Units: {units}</div>
                        <div>Resident Units: {residence}</div>
                    </div>
                    {canEdit && 
                        <div class = "button">
                            <button class = "button-style" onClick = {setPop}>
                                Edit
                            </button>
                            <CardExtrasEdit
                                pop={pop}
                                setPop={setPop}
                                setGPA={setGpa}
                                setResidence={setResidence}
                                setUnits={setUnits}
                                startingI = {i_parent}
                                preGPA = {gpa}
                                preResidence = {residence}
                                preUnits = {units}
                                updateParent = {updateFromCardEdit}
                            >
                            </CardExtrasEdit>
                        </div>
                    }
                    {canEdit &&
                        <div class = "button">
                            <button class="button-style" onClick={del}>
                                Delete
                            </button>
                        </div>
                    }
                </div>
            </div>}
        />
    );
}

export default CardExtras;