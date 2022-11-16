const helper = require('./helper.js');

const handleDomo = (e) => {
    e.preventDefault();
    helper.hideError();

    const name = e.target.querySelector('#domoName').value;
    const age = e.target.querySelector('#domoAge').value;
    const weight = e.target.querySelector('#domoWeight').value;
    const _csrf = e.target.querySelector('#_csrf').value;

    if (!name || !age || !weight) {
        helper.handleError('All fields are required');
        return false;
    }

    helper.sendPost(e.target.action, {name, age, weight, _csrf}, loadDomosFromServer);

    return false;
};

const deleteDomo = (e) => {
    e.preventDefault();
    helper.hideError();

    const _id = e.target.querySelector('#domoId').value;
    const _csrf = e.target.querySelector('#_csrf').value;

    if (!_id) {
        helper.handleError('Could not identify Domo');
        return false;
    }

    helper.sendPost(e.target.action, {_id, _csrf}, loadDomosFromServer);
    
    return false;
}

const DomoForm = (props) => {
    return (
        <form id="domoForm"
            onSubmit={handleDomo}
            name="domoForm"
            action="/maker"
            method="POST"
            className="domoForm"
        >
            <label htmlFor="name">Name: </label>
            <input id="domoName" type="text" name="name" placeholder="Domo Name" />
            <label htmlFor="age">Age: </label>
            <input id="domoAge" type="number" min="0" name="age" />
            <label htmlFor="weight">Weight: </label>
            <input id="domoWeight" type="number" min="0" name="weight" />
            <input id="_csrf" type="hidden" name="_csrf" value={props.csrf} />
            <input className="makeDomoSubmit" type="submit" value="Make Domo" />
        </form>
    );
};

const DomoList = (props) => {
    if (props.domos.length === 0) {
        return (
            <div className="domoList">
                <h3 className="emptyDomo">No Domos Yet!</h3>
            </div>
        );
    }

    const domoNodes = props.domos.map(domo => {
        return (
            <div key={domo._id} className="domo">
                <img src="/assets/img/domoface.jpeg" alt="domo face" className="domoFace" />
                <h3 className="domoName"> Name: {domo.name} </h3>
                <h3 className="domoAge"> Age: {domo.age} </h3>
                <h3 className="domoWeight"> Weight: {domo.weight} </h3>
                <form id="deleteForm" 
                    onSubmit={deleteDomo} 
                    name="deleteForm" 
                    action="/delete" 
                    method="POST" 
                    className="deleteForm"
                >
                    <input id="domoId" type="hidden" name="domoId" value={domo._id} />
                    <input id="_csrf" type="hidden" name="_csrf" value={props.csrf} />
                    <input id="deleteSubmit" type="submit" value="Delete" />
                </form>
            </div>
        );
    });

    return (
        <div className="domoList">
            {domoNodes}
        </div>
    )
};

const loadDomosFromServer = async () => {
    const response = await fetch('/getDomos');
    const data = await response.json();

    const tokenResponse = await fetch('/getToken');
    const tokenData = await tokenResponse.json();

    ReactDOM.render(
        <DomoList csrf={tokenData.csrfToken} domos={data.domos} />,
        document.getElementById('domos')
    );
};

const init = async () => {
    const response = await fetch('/getToken');
    const data = await response.json();

    ReactDOM.render(
        <DomoForm csrf={data.csrfToken} />,
        document.getElementById('makeDomo')
    );

    ReactDOM.render(
        <DomoList csrf={data.csrfToken} domos={[]} />,
        document.getElementById('domos')
    );

    loadDomosFromServer();
};

window.onload = init;