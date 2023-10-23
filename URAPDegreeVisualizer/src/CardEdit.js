import React from 'react';
import './CardEdit.css';
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import { useState } from 'react';
import { DialogContent } from '@material-ui/core';
import Multiselect from 'multiselect-react-dropdown';
import {makeStyles} from "@material-ui/core/styles";
import axios from "axios";
import Select from 'react-select';
import { useEffect } from 'react';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { getAPILink } from './Utility';



function CardEdit(props) {
    let {pop, setPop, setT, setC, setCl, setParentK, persistClasses, persistedClasses, title, cvalue, updateParent} = props;
    const [val, setVal] = useState(title);
    const [cval, setCVal] = useState((cvalue == "At least 1 course" ? "At least 1 courses" : cvalue).replace(/\b[0-9]+(\.[0-9]+)?\b/g, 'k'));
    const [kval, setKVal] = useState(cvalue.match(/[0-9]+/g) ? cvalue.match(/[0-9]+/g)[0] : '');
    const [options, setOptions] = useState([]);
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [rangedDept, setRangedDept] = useState("");
    const [rangedClasses, setRangedClasses] = useState([]);
    const multiselectRef = React.createRef();
    const [currClass, setCurrClass] = useState("");
    

    function saveData() {
        let x = val;
        for (const i of multiselectRef.current.getSelectedItems().map(x => x.name)) {
            x = x + '-' + i;
        }
        axios({
            url: 'http://' + getAPILink() + '/saveEntity/' + x,
            method: 'POST',
        })
        .then((response) => {
            console.log(response);
         })

        
        let y = val + '-' + cval.replace(/\bk\b/, kval) + '-' + val;
        if (kval == 1 && cval == "At least k courses") {
            y = val + '-' + "At least 1 course" + '-' + val;
        }
        console.log(y)
        axios({
            url: 'http://' + getAPILink() + '/saveRequirement/' + y,
            method: 'POST',
        })
        .then((response) => {
            console.log(response);
        })

        console.log(val)

        if(updateParent) {
            updateParent(val);
        }

    }

    let departmentList = [];
    function getAllDepartments() {
        axios({
            url: 'http://' + getAPILink() + '/getAllSubjects',
            method: 'POST',
        })
        .then((response) => {
            for (let x = 0; x < Object.keys(response.data).length; x++) {
                departmentList.push({value: response.data[x], label: response.data[x]});
            }
        })
    }    

    useEffect(() => {
        getAllDepartments();
        console.log(departmentList);
    });

    const close = () => {
        setPop(false);
        console.log(val);
    }

    const submit = (e) => {
        let clogic = cval.replace(/\s+/g, '').toLowerCase();
        if (clogic.match(/(all)|(atleast*.(units|course(s)?))/g))
        {
            saveData();
            setPop(false);
            setT(val);
            setRangedClasses([]);
            console.log(multiselectRef.current.getSelectedItems())
            const classesToSave = multiselectRef.current.getSelectedItems()
            setCl(classesToSave.map(x => x.name));
            setC(cval);
            if(val === "") {
                setT("Category");
            }
            if (classesToSave.length == 0) {
                setC("");
            }

            else if (cval === "-"){
                setC("");
            }
            persistClasses(classesToSave);
        }
        
        setParentK(kval);
    }


    const dialogStyle = makeStyles(() => ({
        dialog: {
          height: 700,
          width: 500
        }
      }));

    const classes = dialogStyle();

    const submitForm = (e) => {
        e.preventDefault();
        submit();
    }


    const wrongFormat = <h3 class = "error">Please enter completion logic in the format of "At least x units/course(s)" or "All"</h3>;
    
    function getData(department) {
        axios.post('http://' + getAPILink() + '/getCoursesByMajor/' + department).then((response) => {
            let a = []
            console.log(response)
            let iterator = response["data"]["data"]["course_id"].values();
            for (let x of iterator) {
                a.push({name: x});
            }
            setOptions(a);
        })
    }


    

    const changeDepartment = (selectedDepartment) => {
        const c = selectedDepartment["value"];
        getData(c);
    }

    const changeRangedDept = (selectedDepartment) => {
        axios.post('http://' + getAPILink() + '/getCoursesByMajor/' + selectedDepartment.value).then((response) => {
            let iterator = response["data"]["data"]["course_id"].values();
            setRangedDept(iterator.next().value.split("_")[0])
        })
    }

    const changeCVal = (selectedVal) => {
        setCVal(selectedVal["value"])
        console.log(cval)
    }

    const addRangedClass = ()  => {
        setRangedClasses(rangedClasses => [...rangedClasses, {"name": rangedDept + "_" + from + ":" + to}])
        setFrom("");
        setTo("");
    }

    const addClass = () => {
        console.log(currClass)
        setRangedClasses(rangedClasses => [...rangedClasses, {"name": currClass}])
    }

    const removeRangedClass = (selectedList, removedItem) => {
        console.log(removedItem)
        console.log(rangedClasses)
        if (rangedClasses.includes(removedItem)) {
            setRangedClasses(rangedClasses.filter(item => item.name != removedItem.name))
        }
        if (persistedClasses.includes(removedItem)) {
            persistedClasses = []
        }
    }

    const dStyle = {
        optionContainer: {
            maxHeight: '0',
        },
        searchBox: {
            color: 'red',
        },
        inputField: {
            caretColor: 'transparent',
        }
    };

    let dropdownClasses = <Multiselect
        ref = {multiselectRef}
        closeOnSelect={true}
        displayValue = "name"
        emptyRecordMsg=''
        placeholder=''
        options = {[{name: "hi", id: 1}]}
        onRemove={removeRangedClass}
        selectedValues={persistedClasses.concat(rangedClasses)}
        style={dStyle}
    />


    return (
        <Dialog classes = {{ paper: classes.dialog }} open = {pop} onClose = {close} >
            <DialogTitle disableTypography className='dialogTitle'>
                <h2>Input Info </h2>
                <IconButton onClick={close}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <div class = "element">                 
                    <form onSubmit = {submitForm}>
                        <label>Requirement Name: </label><br />
                        <input type = "text" value = {val} onInput = {e => setVal(e.target.value)} placeholder = "Requirement name"/>
                    </form>
                </div>
               
                <div class = "element completion">                    
                    <form onSubmit = {submitForm}>
                        <label>Completion Logic: </label><br />
                        <Select onChange = {changeCVal} defaultValue = {{value: cval, label: cval}} options = {[{value: 'All', label: 'All'}, {value: 'At least k units', label: 'At least k units'}, {value: 'At least k courses', label: 'At least k courses'}]}/>
                    </form>
                </div>

                {cval && cval != "All" && <div class = "element">                    
                    <form onSubmit = {submitForm}>
                        <label>Specify 'k' value: </label><br />
                        <input type = "text" value = {kval} onInput = {e => setKVal(e.target.value)} placeholder = "k value"/>
                    </form>
                </div>
                }



                <div class = "element">
                    <label>Courses:</label>
                    {dropdownClasses}
                </div>
                
                <div class = "element">
                    <label>Add Course:</label><br />
                    <div class="range">
                        <Select
                            onChange={(d) => getData(d["value"])}
                            options = {departmentList}
                            placeholder="Department"
                        />
                        <select onChange={e => setCurrClass(e.target.value)}>
                            <option> </option>
                            {
                                options.map(x => <option value={x.name}>{x.name}</option>)
                            }
                        </select>
                        <button onClick={addClass}> Add </button>
                    </div>
                </div>

                <div class = "element">
                    <label>Add Course Range:</label><br />
                    <div class = "range">
                    <Select
                        onChange = {changeRangedDept}
                        options = {departmentList}
                        placeholder="Department"
                    />
                        <input id = "from" type = "text" value = {from} onInput = {e => setFrom(e.target.value)} placeholder = "From"/>
                        <input id = "to" type = "text" value  = {to} onInput = {e => setTo(e.target.value)} placeholder = "to"/>
                        <button onClick={addRangedClass}> Add </button>
                    </div>
                </div>
    

                <div class = "element">
                    <button onClick={submit}> Submit </button>
                </div>

               
                <div class = "element">
                    {false && wrongFormat}
                </div>
            </DialogContent>
        </Dialog>

    );
}
export default CardEdit;