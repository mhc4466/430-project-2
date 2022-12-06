let csrf;
const helper = require('./helper.js');

const sendGet = async (url) => {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const result = await response.json();
    return result;
}

const getFriends = async (e) => {
    e.preventDefault();
    helper.hideError();

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

const addFriend = async (e) => {
    e.preventDefault();
    helper.hideError();

    const confirm = e.target.querySelector('.confirm').value;
    const recipient = e.target.querySelector('.recipient').value;
    const _csrf = csrf;

    if (!recipient) {
        helper.handleError('Field is empty');
        return false;
    }
    
    const result = await sendGet(`getUserByName?name=${recipient}`);
    console.log(result);

    let recipientId;
    if (result) {
        recipientId = result.user._id;
    }
    console.log(recipientId);

    if (result) {
        helper.sendPost(e.target.action, {confirm, recipient: recipientId, _csrf});
    }

    return false;
};

const FriendsList = (props) => {
    if (!props.friends || props.friends.length === 0) {
        return (
            <div className="listContainer">
                <h3 className="listHeader">No friends yet</h3>
            </div>
        );
    }
};

const AddFriend = (props) => {
    return (
        <div className="listHeader">
            <form onSubmit={addFriend} 
                name="addFriendForm" 
                action="/addFriend" 
                method="POST" 
                id="addFriendForm"
            >
                <input className="recipient" type="text"></input>
                <input className="confirm" type="hidden" name="confirmInput" value={false} />
                <input type="submit" value="Send Request" />
            </form>
        </div>
    )
};

const RequestsOutgoing = (props) => {
    if (!props.friends || props.friends.length === 0) {
        return (
            <div className="listContainer">
                <h3 className="listHeader">Outgoing</h3>
            </div>
        );
    }
};

const RequestsIncoming = (props) => {
    if (!props.friends || props.friends.length === 0) {
        return (
            <div className="listContainer">
                <h3 className="listHeader">Incoming</h3>
            </div>
        );
    }
};

const init = async () => {
    const response = await fetch('/getToken');
    const data = await response.json();
    csrf = data.csrfToken;

    ReactDOM.render(
        <FriendsList friends={[]}/>,
        document.getElementById('currentFriends')
    );

    ReactDOM.render(
        <AddFriend />,
        document.getElementById('sendRequest')
    );

    ReactDOM.render(
        <RequestsOutgoing />,
        document.getElementById('friendRequestsOut')
    );

    ReactDOM.render(
        <RequestsIncoming />,
        document.getElementById('friendRequestsIn')
    );
};

window.onload = init;