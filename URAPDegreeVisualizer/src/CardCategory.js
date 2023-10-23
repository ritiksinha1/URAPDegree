import React from 'react';
import './Card.css';
import { TreeNode } from 'react-organizational-chart';
import { useState, setState, useEffect } from 'react';
import ImportList from './ImportList';
import axios from "axios";
import Card from "./Card";
import CardEditCategory from './CardEditCategory';
import CardExtras from './CardExtras';
import { getAPILink } from './Utility';



function CardCategory(props) {
    const {isRoot = false, isCourseList = false, deleteChildren, i_parent, loadedChildren = [], allLoadedChildren = {}, preTitle = "", updateParent, preOr = "AND", canEdit = true, hasUpdated} = props;
    let [children, setChildren] = useState({});
    const [i, seti] = useState(0); 
    const [pop, setPop] = useState(false);
    const [courseListPop, setCourseListPop] = useState(false);
    const [title, setTitle] = useState(preTitle);
    const [canDelete, setCanDelete] = useState(loadedChildren.length == 0);
    const [orVal, setOrVal] = useState(preOr);
    const [createdOthers, setCreatedOthers] = useState(false);

    const create = () => {
        setCanDelete(false);     
        let copyChildrens = {...children};
        copyChildrens[i] = <Card deleteChildren = {delChild} i_parent = {i} isRoot={false} updateParent={(childName, i) => updateChildren(title, i, childName)}/>;
        setChildren(copyChildrens);
        seti(i+1);
        console.log(children)
    }

    const createCategory = () => {
        setCanDelete(false);     
        let copyChildrens = {...children};
        copyChildrens[i] = <CardCategory deleteChildren = {delChild} i_parent = {i} updateParent={(childName, i) => updateChildren(title, i, childName)} />;
        setChildren(copyChildrens);
        seti(i+1);
    }

    const createOthers = () => {
        setCanDelete(false);     
        let copyChildrens = {...children};
        copyChildrens[i] = <CardExtras deleteChildren = {delChild} i_parent = {i} updateParent={(childName, i) => updateChildren(title, i, childName)} />;
        setChildren(copyChildrens);
        seti(i+3);
        setCreatedOthers(true);
    }

    const delChild = (i) => {
        setChildren((oldChildren) => {
            const newChildren = {...oldChildren}
            newChildren[i] = null
            return newChildren
        })
        if(children.length == 0) {
            setCanDelete(true)
        }
        requirementDeleteChildren(i)
    }

    const addImportedCourses = (list) => {
        setCanDelete(false);
        let copyChildrens = {...children};
        const importRootTitle = list[0]["name"]
        const importRootLogic = list[0]["type"].includes("And") ? "AND" : "OR"
        axios({
            url: 'http://' + getAPILink() + '/saveRequirementCategory/' + importRootTitle + "-" + orVal,
            method: 'POST',
        })
        axios({
            url: 'http://' + getAPILink() + '/requirementUpdateChildren/' + title + "-" + i + "-" + importRootTitle,
            method: 'POST',
        })
        copyChildrens[i] = <CardCategory deleteChildren = {delChild} i_parent = {i} allLoadedChildren = {list} preTitle = {importRootTitle} preOr = {importRootLogic} loadedChildren = {list[0]["reqs"]} updateParent={(childName, k) => updateChildren(title, k, childName)}/>;
        setChildren(copyChildrens)
        seti(i+1)
    }

    useEffect(() => {
        setChildrenOnLoad();
        console.log(children);
      }, []);

    const del = () => {
        deleteChildren(i_parent);
    }

    function findLoadedChild(name, allChildrenList) {
        for(const x of allChildrenList) {
            if (x["name"] == name) {
                return x;
            }
        }
    }

    function setChildrenOnLoad() {
        setChildren(load(loadedChildren, allLoadedChildren));
    }

    function load(toLoad, masterReqList) {
        if(toLoad.length > 0) {
            let k = 0;
            let copyChildren = {};
            let preGPA, preResidence, preUnits;

            for (let j = 0; j < toLoad.length; j++) {
                let clogic = "";
                let isCategory = false;
                if (toLoad[j] == '') {
                    continue
                }
                const childInAllLoadedChildren = findLoadedChild(toLoad[j], masterReqList);
                if (!childInAllLoadedChildren) {
                    continue
                }
                switch(childInAllLoadedChildren["type"]) {
                    case "All":
                        clogic = "All";
                        for (let i in childInAllLoadedChildren["courses"]) {
                            childInAllLoadedChildren["courses"][i] = childInAllLoadedChildren["courses"][i].replace('$', '') 
                        }
                        break;
                    case "AtLeastOneCourse":
                        clogic = "At least 1 course";
                        for (let i in childInAllLoadedChildren["courses"]) {
                            childInAllLoadedChildren["courses"][i] = childInAllLoadedChildren["courses"][i].replace('$', '') 
                        }
                        break;
                    case "AtLeastKCourses":
                        clogic = "At least " + childInAllLoadedChildren["k"] + " courses";
                        for (let i in childInAllLoadedChildren["courses"]) {
                            childInAllLoadedChildren["courses"][i] = childInAllLoadedChildren["courses"][i].replace('$', '') 
                        }
                        break;
                    case "AtLeastKUnits":
                        clogic = "At least " + childInAllLoadedChildren["units"] + " units";
                        for (let i in childInAllLoadedChildren["courses"]) {
                            childInAllLoadedChildren["courses"][i] = childInAllLoadedChildren["courses"][i].replace('$', '') 
                        }
                        break;
                    case "ReqAnd":
                        clogic = "AND";
                        isCategory = true;
                        break;
                    case "ReqOr":
                        clogic = "OR";
                        isCategory = true;
                        break;
                    case "GreaterThan":
                        clogic = "GreaterThan";
                        break;
                    default:
                        continue;
                }
                let y;
                if(isCategory) {
                    y = childInAllLoadedChildren["name"] + '-' + orVal;
                    if (!isCourseList) {
                        axios({
                            url: 'http://' + getAPILink() + '/saveRequirementCategory/' + y,
                            method: 'POST',
                        })
                        .then((response) => {
                            console.log(title)
                            console.log(response);
                        })
                    }
                    copyChildren[k] = <CardCategory deleteChildren = {delChild} i_parent = {k} isCourseList = {isCourseList} allLoadedChildren = {masterReqList} preTitle = {loadedChildren[j]} preOr = {clogic} loadedChildren = {childInAllLoadedChildren["reqs"]} updateParent={(childName, k) => updateChildren(title, k, childName)} canEdit={canEdit}/>
                }

                else if(clogic == "GreaterThan" && toLoad[j]=="GPA_req") {
                    y = "GPA_req-GreaterThan-" + childInAllLoadedChildren["GPA"]
                    if (!isCourseList) {
                        axios({
                            url: 'http://' + getAPILink() + '/saveRequirementOthers/' + y,
                            method: 'POST',
                        })
                        .then((response) => {
                            console.log(title)
                            console.log(response);
                        })
                    }
                    preGPA = childInAllLoadedChildren["GPA"]
                    continue;
                }

                else if(clogic == "GreaterThan" && toLoad[j]=="units_req") {
                    y = "units_req-GreaterThan-" + childInAllLoadedChildren["units"]
                    if (!isCourseList) {
                        axios({
                            url: 'http://' + getAPILink() + '/saveRequirementOthers/' + y,
                            method: 'POST',
                        })
                        .then((response) => {
                        
                        })
                    }
                    preUnits = childInAllLoadedChildren["units"]
                    continue;
                }

                else if(clogic == "GreaterThan" && toLoad[j]=="residence_req") {
                    y = "residence_req-GreaterThan-" + childInAllLoadedChildren["residence_units"]
                    if (!isCourseList) {
                        axios({
                            url: 'http://' + getAPILink() + '/saveRequirementOthers/' + y,
                            method: 'POST',
                        })
                        .then((response) => {
                        
                        })
                    }
                    preResidence = childInAllLoadedChildren["residence_units"]
                    continue;
                }

                // go through all the "GreaterThan", store the GPA/units/residence in variables, then create the copyChildren at the end of for loop

                else {
                    let x = childInAllLoadedChildren["name"];
                    for (const i of childInAllLoadedChildren["courses"]) {
                        x = x + '-' + i;
                    }
                    if (!isCourseList) {
                        axios({
                            url: 'http://' + getAPILink() + '/saveEntity/' + x,
                            method: 'POST',
                        })
                        .then((response) => {
                        })
                        y = childInAllLoadedChildren["name"] + '-' + clogic + '-' + childInAllLoadedChildren["name"] + '-' + orVal;
                        axios({
                            url: 'http://' + getAPILink() + '/saveRequirement/' + y,
                            method: 'POST',
                        })
                        .then((response) => {
                        })
                    }
                    copyChildren[k] = <Card deleteChildren = {delChild} isCourseList = {isCourseList} i_parent = {k} preTitle={childInAllLoadedChildren["name"]} preClasses = {childInAllLoadedChildren["courses"]} preLogic = {clogic} updateParent={(childName, k) => updateChildren(title, k, childName)} canEdit={canEdit}/>;
                    
                }

                updateChildren(title, k, toLoad[j]);
                k = k+1;
            }
            if(isRoot && (preGPA !== undefined || preUnits !== undefined || preResidence !== undefined)) {
                copyChildren[k] = <CardExtras deleteChildren = {delChild} i_parent = {k} preGPA = {preGPA} preResidence = {preResidence} preUnits = {preUnits} updateParent={(childName, k) => updateChildren(title, k, childName)} canEdit={canEdit}/>
                if (preGPA !== undefined) {
                    updateChildren(title, k, "GPA_req");
                    k = k+1;
                }
                if (preUnits !== undefined) {
                    updateChildren(title, k, "units_req");
                    k = k+1;
                }
                if (preResidence !== undefined) {
                    updateChildren(title, k, "residence_req");
                    k=k+1;
                }
            }
            seti(k);
            console.log(copyChildren)
            return copyChildren;
        }
        return {};
    }

    let updateFromCardEdit;
    if (updateParent) {
        updateFromCardEdit = (name) => updateParent(name, i_parent);
    }

    function updateChildren(title, i, childName) {
        axios({
            url: 'http://' + getAPILink() + '/requirementUpdateChildren/' + title + '-' + i + '-' + childName,
            method: 'POST',
        })
        .then((response) => {
            console.log(response)
        })
    }


    function requirementDeleteChildren(i) {
        axios({
            url: 'http://' + getAPILink() + '/requirementDeleteChildren/' + title + '-' + i,
            method: 'POST',
        })
        .then((response) => {
            console.log(response)
        })
    }

    return (
    <TreeNode label = {<div class="node">
            <div class = "card">
                <div class = "title">
                    <b>{title}</b>
                </div>
                <div>
                    {orVal == "OR" ? "Satisfied w/ any" : "Satisfied w/ all"}
                </div>
                {!isRoot && !isCourseList && canEdit &&
                <div>
                    <div class = "button">
                        <button class = "button-style" onClick = {setPop}>
                            Edit
                        </button>
                    </div>
                    <CardEditCategory 
                        pop={pop}
                        setPop={setPop}
                        setT = {setTitle}
                        title = {title}
                        orValue = {orVal}
                        setOr={setOrVal}
                        updateParent = {updateFromCardEdit}
                    >
                    </CardEditCategory>
                </div>
                }
                
                { !isCourseList && canEdit &&
                    <div class = "button">
                        <button class="button-style" onClick = {create}>
                            Add Courses
                        </button>
                    </div>
                }
                {!isCourseList && canEdit &&
                    <div class = "button">
                        <button class="button-style" onClick = {createCategory}>
                            Add Category
                        </button>
                    </div>
                }
                {!isCourseList && canEdit &&
                    <div class="button">
                        <button class="button-style" onClick={() => {setCourseListPop(true)}}>
                            Import Course List
                        </button>
                    </div>
                }
                {!isCourseList && canEdit &&
                    <ImportList courseListPop={courseListPop} setCourseListPop={setCourseListPop} addListToTree={addImportedCourses}/>
                }
                {isRoot && !isCourseList && !createdOthers && canEdit &&
                    <div class = "button">
                        <button class="button-style" onClick = {createOthers}>
                            Add Other Reqs.
                        </button>
                    </div>
                }
                {
                    !isRoot && canDelete && !isCourseList && canEdit &&
                    <div class = "button">
                        <button class="button-style" onClick = {del}>
                            Delete
                        </button>
                    </div>
                }
            </div>
        </div>}
        children = {Object.values(children)} 
        />

    );
}

export default CardCategory;