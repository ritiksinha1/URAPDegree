import React from 'react';
import './Card.css';
import { TreeNode } from 'react-organizational-chart';
import { useState, useEffect } from 'react';
import CardEdit from './CardEdit';


function Card(props) {
    const {deleteChildren, i_parent, isCourseList = false, preTitle = "", preClasses = [], preLogic = "", updateParent, canEdit = true} = props;
    const [pop, setPop] = useState(false);
    const [title, setTitle] = useState(preTitle);
    const [completion, setCompletion] = useState(preLogic);
    const [classes, setClasses] = useState(preClasses);
    const [saveClasses, setPersistClasses] = useState(preClasses.map(classesToDict));
    const [orVal, setOrVal] = useState(" ");
    const [kVal, setKVal] = useState();

    function classesToDict(x) {
        return {name: x};
    }

    useEffect(() => {
      // console.log(i);
    }, [0]);

    const listClasses = classes.map((c) =>
        <li class = "class">{c}</li>
    );

    const comp = <li class = "req category">{kVal == 1 ? completion.replace(/\bk\b/, kVal).replace('courses', 'course').replace('units', 'unit') : completion.replace(/\bk\b/, kVal)}</li>

    const del = () => {
        deleteChildren(i_parent);
    }


    let updateFromCardEdit;
    if (updateParent) {
        updateFromCardEdit = (name) => updateParent(name, i_parent);
    }

    return (
    <TreeNode label = {<div class="node">
            <div class = "card">
                <div class = "title">
                    <b>{title}</b>
                </div>
                <div class = "requirements">
                    {completion != "" && comp}
                    {listClasses}
                </div>
                <div class = "requirements">
                    {orVal != " " && <li class = "req category">{orVal}</li>}
                </div>
                {!isCourseList && canEdit &&
                    <div class = "button">
                        <button class="button-style" onClick = {setPop}>
                            Edit
                        </button>

                        {!isCourseList &&  
                            <CardEdit 
                                pop={pop}
                                setPop={setPop}
                                setT = {setTitle}
                                setC = {setCompletion}
                                setCl = {setClasses}
                                persistClasses = {setPersistClasses}
                                persistedClasses = {saveClasses}
                                title = {title}
                                cvalue = {completion}
                                orValue = {orVal}
                                setOr={setOrVal}
                                setParentK = {setKVal}
                                updateParent = {updateFromCardEdit}
                            >
                            </CardEdit>
                        }
                    </div>
                }
                
                { !isCourseList && canEdit &&
                    <div class = "button">
                        <button class="button-style" onClick = {del}>
                            Delete
                        </button>
                    </div>
                }
            </div>
        </div>}
        />

    );
}

export default Card;