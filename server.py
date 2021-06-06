from helperClass.Game import Game

from flask_socketio import SocketIO, send, join_room, leave_room

from flask import Flask, render_template, request

app = Flask(__name__)

# app.config['SECRET_KEY'] = ' ops! you can read this '
socketio = SocketIO(app, logger=True, engineio_logger=True)

@app.route('/')
@app.route('/home')
def home():
    return render_template('home.html')

@app.route('/test')
def test():
    return render_template('temp.html')

@app.route('/joingame', methods=['GET'])
def join_game():
    game_id = request.args.get('gameid', False)    
    if Game.get_gameid_instance(game_id):
        return render_template('arena.html', title="Game Arena - Dotrix", id=game_id)
    return render_template('error.html', errorcode=400)


@app.route('/newgame', methods=['POST'])
def create_new_game():
    request_json = request.get_json()
    dot_rows = request_json.get('rows', False)
    dot_columns = request_json.get('columns', False)
    newgame = Game(dot_rows, dot_columns)
    response = {
        'message':f'successfully create a game with boardsize is {newgame.get_boardsize()}',
        'gameId': newgame.get_gameid(),
        'isCreator': True     
    }
    return  response

@socketio.on('message')
def handle_message(msg, game_id):
    print(f'\n\n {msg} \n\n')
    send(msg, to=game_id)

@socketio.on('json')
def handle_json(json):
    print(f'\n\n {json} \n\n')
    send(json, json=True)

@socketio.on('join')
def on_join(game_room):
    join_room(game_room)
    send("someone joined this game room", to=game_room)

@socketio.on('leave')
def on_leave(game_room, data):
    leave_room(game_room)
    send(f'{data} left the game room')


@socketio.on('avtar')
def set_avtar(avtar_name, game_id):

    send(f'{avtar_name} join the game', to=game_id)
    socketio.emit('set-avtar', avtar_name, to=game_id)


@socketio.on('move')
def send_move(move, player):
    socketio.emit('move', move, player)


if __name__ == "__main__":
    # app.run(debug=True, port=5000)
    socketio.run(app, debug=True, port=5000)
