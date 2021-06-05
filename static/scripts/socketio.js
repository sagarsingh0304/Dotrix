document.addEventListener('DOMContentLoaded', () => {
    const avtarInput = document.querySelector('#avtar-name');
    const sendAvtar = document.querySelector('#send-avtar');
    const area = document.querySelector('#text-area');
    
    const addMessage = text => {
        let p = document.createElement('p');
        p.innerText = text;
        area.appendChild(p);
    }
    socketio = io({ transports: ["websocket"] });
    socketio.on('connect', () => {
        console.log('connected to server');
    });

    socketio.on('message', msg => {
        console.log(msg)
    });
    
    socketio.on('set-avtar', name => addMessage(name))

    sendAvtar.addEventListener('click', () => {
        const avtarName = avtarInput.value;
        socketio.emit('avtar', avtarName);
        avtarInput.value = '';
    })

});
