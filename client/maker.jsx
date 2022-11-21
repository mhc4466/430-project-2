//const e = require('express');
const helper = require('./helper.js');
const { v4: uuidv4 } = require('uuid');

const ntd = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const handleBlockset = (e) => {
    e.preventDefault();
    helper.hideError();

    const name = e.target.querySelector('#blocksetName').value;
    const _csrf = e.target.querySelector('#_csrf').value;

    if (!name) {
        helper.handleError('All fields are required');
        return false;
    }

    helper.sendPost(e.target.action, {name, _csrf}, loadBlocksetsFromServer);

    return false;
};

const deleteBlockset = (e) => {
    e.preventDefault();
    helper.hideError();

    const _id = e.target.querySelector('#blocksetId').value;
    const _csrf = e.target.querySelector('#_csrf').value;

    if (!_id) {
        helper.handleError('Could not identify Blockset');
        return false;
    }

    helper.sendPost(e.target.action, {_id, _csrf}, loadBlocksetsFromServer);
    
    return false;
};

//Ensures there are no impossible configurations of blocks
//Returns true if a problem is found, false otherwise
const sanitizeBlock = (e) => {
    //Grab the "form"
    const form = document.getElementById("blockAdderForm");

    //Clear the warning text (if there is no new problem, then it stay clear)
    const warning = form.querySelector("#blockAdderWarning");
    warning.innerHTML = "";
    //Grab the "form" and all of its inputs that may have problems
    const startDay = form.querySelector("#blockStartDay");
    const startTime = form.querySelector("#blockStartTime");
    const endDay = form.querySelector("#blockEndDay");
    const endTime = form.querySelector("#blockEndTime");
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
    const form = document.getElementById("blockAdderForm");
    const warning = form.querySelector("#blockAdderWarning");
    warning.innerHTML = "";
    //Ensure necessary fields are populated
    if (form.querySelector("#blockVisibility").value === '' ||
    form.querySelector("#blockStartDay").value === '' ||
    form.querySelector("#blockStartTime").value === '' ||
    form.querySelector("#blockEndDay").value === '' ||
    form.querySelector("#blockEndTime").value === '') {
        warning.innerHTML = "Missing field";
    }


    //If sanitizeBlock finds a problem, it will fix it, but it will return true; 
    //only submit if there was no problem found, so user gets a change to review entry
    if (!sanitizeBlock(e)) {
        const newBlock = {};
        //Generates a unique id for this block
        newBlock.id = uuidv4();
        newBlock.title = form.querySelector("#blockTitle").value;
        newBlock.visibility = form.querySelector("#blockVisibility").value;
        newBlock.startDay = form.querySelector("#blockStartDay").value;
        newBlock.startTime = form.querySelector("#blockStartTime").value;
        newBlock.endDay = form.querySelector("#blockEndDay").value;
        newBlock.endTime = form.querySelector("#blockEndTime").value;

        let blocks;
        if (!localStorage.getItem("blocks")) {
            blocks = [];
        } else {
            blocks = JSON.parse(localStorage.getItem("blocks"));
        }
        blocks.push(newBlock);
        let blocksString = JSON.stringify(blocks);
        localStorage.setItem("blocks", blocksString);
    }
}

const BlockAdder = (props) => {
    return (
        <div id="blockAdderForm">
            <label htmlFor="title">Title: </label>
            <input id="blockTitle" type="text" name="title" placeholder = "Block Title"></input>
            <label htmlFor="startDay">Start: </label>
            <select id="blockStartDay" name="startDay" onChange={sanitizeBlock}>
                <option value=""></option>
                <option value="0">Sunday</option>
                <option value="1">Monday</option>
                <option value="2">Tuesday</option>
                <option value="3">Wednesday</option>
                <option value="4">Thursday</option>
                <option value="5">Friday</option>
                <option value="6">Saturday</option>
            </select>
            <input id="blockStartTime" type="time" name="startTime" onChange={sanitizeBlock}></input>
            <label htmlFor="endDay">End: </label>
            <select id="blockEndDay" name="endDay" onChange={sanitizeBlock}>
                <option value=""></option>
                <option value="0">Sunday</option>
                <option value="1">Monday</option>
                <option value="2">Tuesday</option>
                <option value="3">Wednesday</option>
                <option value="4">Thursday</option>
                <option value="5">Friday</option>
                <option value="6">Saturday</option>
            </select>
            <input id="blockEndTime" type="time" name="endTime" onChange={sanitizeBlock}></input>
            <label htmlFor="startDay">Start: </label>
            <select id="blockVisibility" name="visibility" defaultValue="0">
                <option value="0">Only time visible to others</option>
                <option value="1">Title visible to Group 1 (closest) friends</option>
                <option value="2">Title visible to Group 2 friends</option>
                <option value="3">Title visible to Group 3 friends</option>
                <option value="3">Title visible to the public</option>
            </select>
            <button id="blockSubmit" onClick={addBlock}>Add Block</button>
            <span id="blockAdderWarning"></span>
        </div>
    );
};

const BlocksetForm = (props) => {
    return (
        <form id="blocksetForm"
            onSubmit={handleBlockset}
            name="blocksetForm"
            action="/maker"
            method="POST"
            className="blocksetForm"
        >
            <label htmlFor="name">Name: </label>
            <input id="blocksetName" type="text" name="name" placeholder="Blockset Name" />
            <input id="_csrf" type="hidden" name="_csrf" value={props.csrf} />
            <input className="makeBlocksetSubmit" type="submit" value="Make Blockset" />
        </form>
    );
};

const BlocksetList = (props) => {
    if (props.blockset.length === 0) {
        return (
            <div className="blocksetList">
                <h3 className="emptyBlockset">No Blocksets Yet!</h3>
            </div>
        );
    }

    const blocksetNodes = props.blocksets.map(blockset => {
        return (
            <div key={blockset._id} className="blockset">
                <img src="/assets/img/domoface.jpeg" alt="domo face" className="blocksetFace" />
                <h3 className="blocksetName"> Name: {blockset.name} </h3>
                <form id="deleteForm" 
                    onSubmit={deleteBlockset} 
                    name="deleteForm" 
                    action="/delete" 
                    method="POST" 
                    className="deleteForm"
                >
                    <input id="blocksetId" type="hidden" name="blocksetId" value={blockset._id} />
                    <input id="_csrf" type="hidden" name="_csrf" value={props.csrf} />
                    <input id="deleteSubmit" type="submit" value="Delete" />
                </form>
            </div>
        );
    });

    return (
        <div className="blocksetList">
            {blocksetNodes}
        </div>
    )
};

const loadBlocksetsFromServer = async () => {
    const response = await fetch('/getBlocksets');
    const data = await response.json();

    const tokenResponse = await fetch('/getToken');
    const tokenData = await tokenResponse.json();

    ReactDOM.render(
        <BlocksetList csrf={tokenData.csrfToken} blockset={data.blocksets} />,
        document.getElementById('blockset')
    );
};

const init = async () => {
    const response = await fetch('/getToken');
    const data = await response.json();

    /*
    ReactDOM.render(
        <BlocksetForm csrf={data.csrfToken} />,
        document.getElementById('makeBlockset')
    );
    */
    ReactDOM.render(
        <BlockAdder />,
        document.getElementById('makeBlockset')
    );

    ReactDOM.render(
        <BlocksetList csrf={data.csrfToken} blockset={[]} />,
        document.getElementById('blocksets')
    );

    loadBlocksetsFromServer();
};

window.onload = init;