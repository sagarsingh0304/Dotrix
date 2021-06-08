document.addEventListener('DOMContentLoaded', () => {
    const avtarInput = document.querySelector('#avtar-name');
    const sendAvtar = document.querySelector('#send-avtar');
    const area = document.querySelector('#text-area');
    const myGameId = document.querySelector('#gameid').textContent;
    const playerList = document.querySelector('#players-list');
    let playerInGame = []
    
    const addMessage = text => {
        let p = document.createElement('p');
        p.innerText = text;
        area.appendChild(p);
    }
    const addPlayer = player => {
        let li = document.createElement('li');
        li.innerText = 'this is' + player;
        playerList.appendChild(li);
    }

    socketio = io({ transports: ["websocket"] });

    socketio.on('connect', () => {
        addMessage('connected to server');
        socketio.emit('join', myGameId);
        socketio.send('someone joined this game', myGameId)
    });

    socketio.on('message', msg => addMessage(msg));

    socketio.on('update-players', playerList => {
        playerList.forEach(player => addPlayer(player));        
    });
        
    socketio.once('set-avtar', name => {
        addMessage(`You are ${name}`);
    });

    socketio.on('disconnet', ()=> console.log('server has closed my connection'))

    sendAvtar.addEventListener('click', () => {
        const avtarName = avtarInput.value;
        socketio.emit('avtar', avtarName, myGameId);
        avtarInput.value = '';
    });

});
