//const e = require('express');
const helper = require('./helper.js');
const { v4: uuidv4 } = require('uuid');

const ntd = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const privacyLevelDesc = ["Only time visible to others", "Title visible to Group 1 (closest) friends", "Title visible to Group 2 friends", "Title visible to Group 3 friends", "Title visible to the public"];

let csrf;

const handleBlockset = (e) => {
    e.preventDefault();
    helper.hideError();

    const name = e.target.querySelector('#blocksetName').value;
    const visibility = e.target.querySelector('#blockVisibility').value;
    const _csrf = csrf;

    if (!name || !visibility) {
        helper.handleError('All fields are required');
        return false;
    }

    helper.sendPost(e.target.action, {name, visibility, _csrf}, loadScheduleFromServer);

    return false;
};

const deleteBlockset = (e) => {
    e.preventDefault();
    helper.hideError();

    const _id = e.target.querySelector('.blocksetId').value;
    const _csrf = csrf;

    if (!_id) {
        helper.handleError('Could not identify Blockset');
        return false;
    }

    helper.sendPost(e.target.action, {_id, _csrf}, loadScheduleFromServer);
    
    return false;
};

const deleteBlock = (e) => {
    e.preventDefault();
    helper.hideError();

    const _id = e.target.querySelector('.blockId').value;
    const _bsid = e.target.querySelector('.blocksetId').value;
    const _csrf = csrf;

    if (!_id) {
        helper.handleError('Could not identify Block');
        return false;
    }

    helper.sendPost(e.target.action, {_id, _bsid, _csrf}, loadScheduleFromServer);
    
    return false;
}

//Ensures there are no impossible configurations of blocks
//Returns true if a problem is found, false otherwise
const sanitizeBlock = (e) => {
    //Grab the "form"
    const form = e.target.parentElement;

    //Clear the warning text (if there is no new problem, then it stay clear)
    const warning = form.querySelector(".blockAdderWarning");
    warning.innerHTML = "";
    //Grab the "form" and all of its inputs that may have problems
    const startDay = form.querySelector(".blockStartDay");
    const startTime = form.querySelector(".blockStartTime");
    const endDay = form.querySelector(".blockEndDay");
    const endTime = form.querySelector(".blockEndTime");
    let problemFound = false;

    //End day cannot be before start day
    if (endDay.value < startDay.value) {
        //If the end day is blank, modify the day but don't send a warning, because that would be annoying
        if (endDay.value !== '') {
            warning.innerHTML = "Fixed: End day cannot be before start day"
        }
        endDay.value = startDay.value;
        problemFound = true;
    }

    //If end day is the same day as start day, end time cannot be before start time
    if ((endDay.value === startDay.value) && (endTime.value < startTime.value)) {
        if (endTime.value !== '') {
            warning.innerHTML = "Fixed: End time cannot be before start time on same day"
        }
        endTime.value = startTime.value;
        problemFound = true;
    }

    return problemFound;
};

const addBlock = (e) => {
    //Get the "form" and clear its warning
    const form = e.target.parentElement;
    const warning = form.querySelector(".blockAdderWarning");
    warning.innerHTML = "";
    //Ensure necessary fields are populated
    if (form.querySelector(".blockVisibility").value === '' ||
    form.querySelector(".blockStartDay").value === '' ||
    form.querySelector(".blockStartTime").value === '' ||
    form.querySelector(".blockEndDay").value === '' ||
    form.querySelector(".blockEndTime").value === '') {
        warning.innerHTML = "Missing field";
        return false;
    }


    //If sanitizeBlock finds a problem, it will fix it, but it will return true; 
    //only submit if there was no problem found, so user gets a change to review entry
    if (!sanitizeBlock(e)) {
        const newBlock = {};
        //Generates a unique id for this block
        newBlock.id = uuidv4();
        newBlock.visibility = form.querySelector(".blockVisibility").value;
        newBlock.startDay = form.querySelector(".blockStartDay").value;
        newBlock.startTime = form.querySelector(".blockStartTime").value;
        newBlock.endDay = form.querySelector(".blockEndDay").value;
        newBlock.endTime = form.querySelector(".blockEndTime").value;

        helper.sendPost('/newBlock', {
            blocksetId: form.querySelector(".blocksetId").value,
            block: newBlock,
            _csrf: csrf
        }, loadScheduleFromServer);
    }
}

const BlockAdder = (props) => {
    return (
        <div className="blockAdderForm">
            <label htmlFor="startDay">Start: </label>
            <select className="blockStartDay" name="startDay" onChange={sanitizeBlock}>
                <option value=""></option>
                <option value="0">Sunday</option>
                <option value="1">Monday</option>
                <option value="2">Tuesday</option>
                <option value="3">Wednesday</option>
                <option value="4">Thursday</option>
                <option value="5">Friday</option>
                <option value="6">Saturday</option>
            </select>
            <input className="blockStartTime" type="time" name="startTime" onChange={sanitizeBlock}></input>
            <label htmlFor="endDay">End: </label>
            <select className="blockEndDay" name="endDay" onChange={sanitizeBlock}>
                <option value=""></option>
                <option value="0">Sunday</option>
                <option value="1">Monday</option>
                <option value="2">Tuesday</option>
                <option value="3">Wednesday</option>
                <option value="4">Thursday</option>
                <option value="5">Friday</option>
                <option value="6">Saturday</option>
            </select>
            <input className="blockEndTime" type="time" name="endTime" onChange={sanitizeBlock}></input>
            <label htmlFor="visibility">Visibility: </label>
            <select className="blockVisibility" name="visibility" defaultValue="0">
                <option value="0">{privacyLevelDesc[0]}</option>
                <option value="1">Title visible to Group 1 (closest) friends</option>
                <option value="2">Title visible to Group 2 friends</option>
                <option value="3">Title visible to Group 3 friends</option>
                <option value="3">Title visible to the public</option>
            </select>
            <input className="blocksetId" type="hidden" name="blocksetId" value={props.blocksetId} />
            <button className="blockSubmit" onClick={addBlock}>Add Block</button>
            <span className="blockAdderWarning"></span>
        </div>
    );
};

const NewBlocksetForm = (props) => {
    return (
        <form id="blocksetForm"
            onSubmit={handleBlockset}
            name="blocksetForm"
            action="/newBlockset"
            method="POST"
            className="blocksetForm"
        >
            <label htmlFor="name">Name: </label>
            <input id="blocksetName" type="text" name="name" placeholder="Blockset Name" />
            <label htmlFor="visibility">Visibility: </label>
            <select id="blockVisibility" name="visibility" defaultValue="0">
                <option value="0">{privacyLevelDesc[0]}</option>
                <option value="1">{privacyLevelDesc[1]}</option>
                <option value="2">{privacyLevelDesc[2]}</option>
                <option value="3">{privacyLevelDesc[3]}</option>
                <option value="3">{privacyLevelDesc[4]}</option>
            </select>
            <input className="makeBlocksetSubmit" type="submit" value="Make Blockset" />
        </form>
    );
};

//React component which holds one set of blocks
//Each blockset has a name and visibility level and can be deleted in entirety
//Contains a place to add new blocks and delete them
const Blockset = (props) => {
    console.log(props);
    if (!props.blockset.blocks || props.blockset.blocks.length === 0) {
        return (
            <div className="blockset">
                <div className="blocksetHeader">
                    <span className="blocksetName"><h3>{props.blockset.name}</h3></span>
                    <form onSubmit={deleteBlockset} 
                        name="deleteBlocksetForm" 
                        action="/deleteBlockset" 
                        method="POST" 
                        className="deleteBlocksetForm"
                    >
                        <input className="blocksetId" type="hidden" name="blocksetId" value={props.blockset._id} />
                        <input className="deleteSubmit" type="submit" value="Delete" />
                    </form>
                </div>
                <div className="blockList">
                    
                </div>
                <BlockAdder blocksetId={props.blockset._id}/>
            </div>
        );
    }

    const blockNodes = props.blockset.blocks.map(block => {
        return (
            <div key={block.id} className="block">
                <h3 className="blockName"> {ntd[block.startDay]} {block.startTime} - {ntd[block.endDay]} {block.endTime}</h3>
                <form className="deleteBlockForm" 
                    onSubmit={deleteBlock} 
                    name="deleteBlockForm" 
                    action="/deleteBlock" 
                    method="POST" 
                >
                    <input className="blockId" type="hidden" name="blockId" value={block.id} />
                    <input className="blocksetId" type="hidden" name="blocksetId" value={props.blockset._id} />
                    <input className="deleteSubmit" type="submit" value="Delete" />
                </form>
            </div>
        );
    });

    return (
        <div className="blockset">
            <div className="blocksetHeader">
                <span className="blocksetName"><h3>{props.blockset.name}</h3></span>
                <form onSubmit={deleteBlockset} 
                    name="deleteBlocksetForm" 
                    action="/deleteBlockset" 
                    method="POST" 
                    className="deleteBlocksetForm"
                >
                    <input className="blocksetId" type="hidden" name="blocksetId" value={props.blockset._id} />
                    <input className="deleteSubmit" type="submit" value="Delete" />
                </form>
            </div>
            <div className="blockList">
                {blockNodes}
            </div>
                <BlockAdder blocksetId={props.blockset._id}/>
        </div>
    )
};

const loadScheduleFromServer = async () => {
    const response = await fetch('/getSchedule');
    const data = await response.json();

    const tokenResponse = await fetch('/getToken');
    const tokenData = await tokenResponse.json();

    const container = document.getElementById('blocksets');

    container.innerHTML = "";

    data.blocksets.forEach(blockset => {
        const blocksetElement = document.createElement('div');
        container.insertBefore(blocksetElement, container.firstChild);
        ReactDOM.render(
            <Blockset blockset={blockset} />,
            blocksetElement
        );
    });

    return data.blocksets;
};

const AddBlockset = () => {
    const container = document.getElementById('container');
    const unit = document.createElement('div');
    container.insertBefore(unit, container.firstChild);
    ReactDOM.render(
        <Blockset />,
        unit
    );
};

const init = async () => {
    const response = await fetch('/getToken');
    const data = await response.json();
    csrf = data.csrfToken;

    const addBlocksetButton = document.getElementById('addBlocksetButton');
    addBlocksetButton.onclick = AddBlockset;

    ReactDOM.render(
        <NewBlocksetForm />,
        document.getElementById('makeBlockset')
    );

    loadScheduleFromServer();

};

window.onload = init;