/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./client/helper.js":
/*!**************************!*\
  !*** ./client/helper.js ***!
  \**************************/
/***/ ((module) => {

eval("/* Takes in an error message. Sets the error message up in html, and\r\n   displays it to the user. Will be hidden by other events that could\r\n   end in an error.\r\n*/\nconst handleError = message => {\n  document.getElementById('errorMessage').textContent = message;\n  document.getElementById('blocksetMessage').classList.remove('hidden');\n};\n\n/* Sends post requests to the server using fetch. Will look for various\r\n   entries in the response JSON object, and will handle them appropriately.\r\n*/\nconst sendPost = async (url, data, handler) => {\n  const response = await fetch(url, {\n    method: 'POST',\n    headers: {\n      'Content-Type': 'application/json'\n    },\n    body: JSON.stringify(data)\n  });\n  const result = await response.json();\n  document.getElementById('blocksetMessage').classList.add('hidden');\n  if (result.redirect) {\n    window.location = result.redirect;\n  }\n  if (result.error) {\n    handleError(result.error);\n  }\n  if (handler) {\n    handler(result);\n  }\n};\nconst hideError = () => {\n  document.getElementById('blocksetMessage').classList.add('hidden');\n};\nmodule.exports = {\n  handleError,\n  sendPost,\n  hideError\n};\n\n//# sourceURL=webpack://Logins/./client/helper.js?");

/***/ }),

/***/ "./client/profile.jsx":
/*!****************************!*\
  !*** ./client/profile.jsx ***!
  \****************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

eval("let csrf;\nconst helper = __webpack_require__(/*! ./helper.js */ \"./client/helper.js\");\n\n//Helper function for simple get requests\nconst sendGet = async url => {\n  const response = await fetch(url, {\n    method: 'GET',\n    headers: {\n      'Content-Type': 'application/json'\n    }\n  });\n  const result = await response.json();\n  return result;\n};\n\n//Get this user's friends, grabbing each friend as data containing their ID, username, and Avail status\nconst getFriends = async () => {\n  helper.hideError();\n  const result = await sendGet('getFriends');\n\n  //Update the friends list with the results\n  ReactDOM.render( /*#__PURE__*/React.createElement(FriendsList, {\n    friends: result.friends\n  }), document.getElementById('currentFriends'));\n};\n\n//Attempt to send a friend request to the recipient\nconst addFriend = async e => {\n  e.preventDefault();\n  helper.hideError();\n  const confirm = e.target.querySelector('.confirm').value;\n  const recipient = e.target.querySelector('.recipient').value;\n  const _csrf = csrf;\n  if (!recipient) {\n    helper.handleError('Field is empty');\n    return false;\n  }\n\n  //Recipient is encoded in name form, so get an ID before sending another request\n  const result = await sendGet(`getUserByName?name=${recipient}`);\n  let recipientId;\n  if (result) {\n    recipientId = result.user._id;\n  }\n  if (result) {\n    helper.sendPost(e.target.action, {\n      confirm,\n      recipient: recipientId,\n      _csrf\n    });\n  }\n  return false;\n};\nconst premiumify = async e => {\n  e.preventDefault();\n  helper.hideError();\n  const _csrf = csrf;\n  helper.sendPost('/premium', {\n    _csrf\n  }, () => {\n    location.reload();\n  });\n};\n\n//React component that shows a blank placeholder if the user has no friends, but if provided\n//  with a list, parse those out into a list of friends\nconst FriendsList = props => {\n  if (!props.friends || props.friends.length === 0) {\n    return /*#__PURE__*/React.createElement(\"div\", {\n      className: \"listContainer\"\n    }, /*#__PURE__*/React.createElement(\"h3\", {\n      className: \"listHeader\"\n    }, \"No friends yet\"));\n  } else {\n    const friendNodes = props.friends.map(friend => {\n      return /*#__PURE__*/React.createElement(\"div\", {\n        key: friend._id,\n        className: \"friendBlock\"\n      }, /*#__PURE__*/React.createElement(\"span\", {\n        className: \"friendName\"\n      }, \" \", friend.username, \" \"), /*#__PURE__*/React.createElement(\"span\", {\n        className: \"friendAvail\"\n      }, \" Avail: \", friend.avail, \" \"));\n    });\n    return /*#__PURE__*/React.createElement(\"div\", {\n      className: \"listContainer\"\n    }, /*#__PURE__*/React.createElement(\"h3\", {\n      className: \"listHeader\"\n    }, \"Friends:\"), friendNodes);\n  }\n};\n\n//React component containing a form to search for a person and request them as a friend\nconst AddFriend = props => {\n  return /*#__PURE__*/React.createElement(\"div\", {\n    className: \"listHeader\"\n  }, /*#__PURE__*/React.createElement(\"form\", {\n    onSubmit: addFriend,\n    name: \"addFriendForm\",\n    action: \"/addFriend\",\n    method: \"POST\",\n    id: \"addFriendForm\"\n  }, /*#__PURE__*/React.createElement(\"input\", {\n    className: \"recipient\",\n    type: \"text\"\n  }), /*#__PURE__*/React.createElement(\"input\", {\n    className: \"confirm\",\n    type: \"hidden\",\n    name: \"confirmInput\",\n    value: false\n  }), /*#__PURE__*/React.createElement(\"input\", {\n    type: \"submit\",\n    value: \"Send Request\"\n  })));\n};\n\n//Unimplemented\nconst RequestsOutgoing = props => {\n  if (!props.friends || props.friends.length === 0) {\n    return /*#__PURE__*/React.createElement(\"div\", {\n      className: \"listContainer\"\n    }, /*#__PURE__*/React.createElement(\"h3\", {\n      className: \"listHeader\"\n    }));\n  }\n};\n\n//Unimplemented\nconst RequestsIncoming = props => {\n  if (!props.friends || props.friends.length === 0) {\n    return /*#__PURE__*/React.createElement(\"div\", {\n      className: \"listContainer\"\n    }, /*#__PURE__*/React.createElement(\"h3\", {\n      className: \"listHeader\"\n    }));\n  }\n};\nconst init = async () => {\n  const response = await fetch('/getToken');\n  const data = await response.json();\n  csrf = data.csrfToken;\n  ReactDOM.render( /*#__PURE__*/React.createElement(FriendsList, {\n    friends: []\n  }), document.getElementById('currentFriends'));\n  ReactDOM.render( /*#__PURE__*/React.createElement(AddFriend, null), document.getElementById('sendRequest'));\n  ReactDOM.render( /*#__PURE__*/React.createElement(RequestsOutgoing, null), document.getElementById('friendRequestsOut'));\n  ReactDOM.render( /*#__PURE__*/React.createElement(RequestsIncoming, null), document.getElementById('friendRequestsIn'));\n  document.getElementById('goPremium').onclick = premiumify;\n  const pResponse = await fetch('/premium');\n  const pData = await pResponse.json();\n  console.log(pData);\n  if (pData.premium === true) {\n    document.getElementById('premium').innerHTML = \"Thanks for going premium! \" + \"The title of your time block will now appear in the friends list of those you've added!\";\n  }\n  getFriends();\n};\nwindow.onload = init;\n\n//# sourceURL=webpack://Logins/./client/profile.jsx?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./client/profile.jsx");
/******/ 	
/******/ })()
;