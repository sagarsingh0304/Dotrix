document.addEventListener('DOMContentLoaded', () => {
    const avtarInput = document.querySelector('#avtar-name');
    const sendAvtar = document.querySelector('#send-avtar');
    const area = document.querySelector('#text-area');
    const myGameId = document.querySelector('#gameid').textContent;
    
    const addMessage = text => {
        let p = document.createElement('p');
        p.innerText = text;
        area.appendChild(p);
    }
    socketio = io({ transports: ["websocket"] });
    socketio.on('connect', () => {
        addMessage('connected to server');
        socketio.emit('join', myGameId);
        socketio.send(`player of ${myGameId} is joined`, myGameId)
    });

    socketio.on('message', msg => addMessage(msg));
    
    socketio.on('set-avtar', name => addMessage(name));

    sendAvtar.addEventListener('click', () => {
        const avtarName = avtarInput.value;
        socketio.emit('avtar', avtarName, myGameId);

        avtarInput.value = '';

    })

});
