document.addEventListener('DOMContentLoaded', () => {
    const avtarInput = document.querySelector('#avtar-name');
    const sendAvtar = document.querySelector('#send-avtar');
    const area = document.querySelector('#text-area');
    const myGameId = document.querySelector('#gameid').textContent;
    const playerList = document.querySelector('#players-list');
    let playerInGame = []
    // let availabeColors = 
    
    const addMessage = text => {
        let p = document.createElement('p');
        p.className = "text-message"
        p.innerText = text;
        area.appendChild(p);
        setTimeout(()=>{
            area.removeChild(p)
        }, 5000);
    }
    const addPlayer = player => {
        playerInGame.push(player)
        let li = document.createElement('li');
        li.className = 'each-player';
        li.innerText = player["name"];
        li.style.backgroundColor = player["color"];
        playerList.appendChild(li);
    }

    socketio = io({ transports: ["websocket"] });

    socketio.on('connect', () => {
        addMessage('connected to server');
        socketio.emit('join', myGameId);
    });
    
    socketio.on('message', msg => addMessage(msg));
    
    socketio.on('update-players', playerList => {
        playerList.forEach(player => addPlayer(player));        
    });
    
    socketio.once('set-avtar', name => {
        addMessage(`You are ${name}`);
        socketio.send(`${name} joined the game`, myGameId)
    });

    socketio.on('disconnet', ()=> console.log('server has closed my connection'))

    sendAvtar.addEventListener('click', () => {
        const avtarName = avtarInput.value;
        socketio.emit('avtar', avtarName, myGameId);
        avtarInput.value = '';
        document.querySelector("#input-area").style.display = "none";
    }, {once: true});

    module.exports = {
        playerInGame
    }

});
