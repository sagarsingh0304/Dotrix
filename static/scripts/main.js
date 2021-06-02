// just empty
const joinBtn = document.getElementById('join-button');
const createBtn = document.getElementById('create-button');
const joinForm = document.getElementById('join-form');
const createGameForm = document.getElementById('create-game-form')

function sendRequest(requestMethod, apiEndPoint, data) {
    options = {
        method: requestMethod
    }

    if ('get' === requestMethod) {
        query = new URLSearchParams(data);
        apiEndPoint += '?' + query.toString(); // to prevent script to be enterd as query
        
    }
    else if ('post' === requestMethod) {
        options.body = JSON.stringify(data),
        options.headers = {
            "Content-type": "application/json; charset=UTF-8"
        }
    }

    return fetch(apiEndPoint, options).then(response => response.json())    
}

joinForm.addEventListener('submit', event => {
    event.preventDefault();
    gameid = joinForm.elements['gameid'].value;
    // params = {
    //     gameId: String(id),
    //     isCreator: false
    // }    
    sendRequest(joinForm.method, joinForm.action, {gameid})
    .then(response => console.log(response))
})

createGameForm.addEventListener('submit', event => {
    event.preventDefault();
    rows = createGameForm.elements['rows'].value;
    columns = createGameForm.elements['columns'].value;
    sendRequest(createGameForm.method, createGameForm.action, {rows, columns})
    .then(response => console.log(response))
})