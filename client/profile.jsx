let csrf;
const helper = require('./helper.js');

//Helper function for simple get requests
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

//Get this user's friends, grabbing each friend as data containing their ID, username, and Avail status
const getFriends = async () => {
    helper.hideError();

    const result = await sendGet('getFriends');
    
    //Update the friends list with the results
    ReactDOM.render(
        <FriendsList friends={result.friends} />,
        document.getElementById('currentFriends')
    );
}

//Attempt to send a friend request to the recipient
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
    
    //Recipient is encoded in name form, so get an ID before sending another request
    const result = await sendGet(`getUserByName?name=${recipient}`);

    let recipientId;
    if (result) {
        recipientId = result.user._id;
    }

    if (result) {
        helper.sendPost(e.target.action, {confirm, recipient: recipientId, _csrf});
    }

    return false;
};

//React component that shows a blank placeholder if the user has no friends, but if provided
//  with a list, parse those out into a list of friends
const FriendsList = (props) => {
    if (!props.friends || props.friends.length === 0) {
        return (
            <div className="listContainer">
                <h3 className="listHeader">No friends yet</h3>
            </div>
        );
    } else {
        const friendNodes = props.friends.map(friend => {
            return (
                <div key={friend._id} className="friendBlock">
                    <span className="friendName"> {friend.username} </span>
                    <span className="friendAvail"> Avail: {friend.avail} </span>
                </div>
            );
        });
        return (
            <div className="listContainer">
                <h3 className="listHeader">Friends:</h3>
                {friendNodes}
            </div>
        )
    }
};

//React component containing a form to search for a person and request them as a friend
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

//Unimplemented
const RequestsOutgoing = (props) => {
    if (!props.friends || props.friends.length === 0) {
        return (
            <div className="listContainer">
                <h3 className="listHeader"></h3>
            </div>
        );
    }
};

//Unimplemented
const RequestsIncoming = (props) => {
    if (!props.friends || props.friends.length === 0) {
        return (
            <div className="listContainer">
                <h3 className="listHeader"></h3>
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

    getFriends();
};

window.onload = init;