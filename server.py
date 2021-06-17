from helperClass.Game import Game

from flask_socketio import SocketIO, send, join_room, leave_room

from flask import Flask, render_template, request

app = Flask(__name__)

# app.config['SECRET_KEY'] = ' ops! you can read this '
# socketio = SocketIO(app, logger=True, engineio_logger=True)
socketio = SocketIO(app)

@app.route('/')
@app.route('/home')
def home():
    return render_template('home.html')

# respond to a valid HTTP GET request for joining the gameroom
@app.route('/joingame', methods=['GET'])
def join_game():
    game_id = request.args.get('gameid', False)
    game_instance = Game.get_gameid_instance(game_id)
    if game_instance:
        if len(game_instance.get_players()) < 5:
            return render_template('arena.html', title="Game Arena - Dotrix", id=game_id , dimension=game_instance.get_boardsize())
        else:
            return render_template('error.html', errorcode=400, message='no empty slot')
    return render_template('error.html', errorcode=400)

# respond to valid HTTP POST request for creating a new gameroom, parses json board size and returns the gameid
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


#  triggers when a player joins the game room, here gameid is the name of game room.
#  when player joins the room that particular player will receive the list of players already present in room
@socketio.on('join')
def on_join(game_id):
    join_room(game_id)
    players_list = Game.get_players_in_gameid(game_id)
    socketio.emit('update-players', players_list,to=request.sid) 

    
# handles messages from the client socket by broadcasting it to sockets in room
@socketio.on('message')
def handle_message(msg, game_id):
    print(f'\n\n {msg} \n\n')
    send(msg, to=game_id)


# triggers when a player set its name, it adds that name in players list of that game instance
# TODO implement unique player names 
@socketio.on('avtar')
def set_avtar(avtar_name, game_id):
    player = Game.add_player_in_gameid(game_id, avtar_name) 
    # players_list = Game.get_players_in_gameid(game_id)  #  it will send player list after setting avtar
    socketio.emit('set-avtar', avtar_name, to=request.sid)
    socketio.emit('update-players', [player], to=game_id)


# triggers when a player send a move, it forwards the move to all the sockects in room
@socketio.on('move')
def send_move(move, player, game_id):
    socketio.emit('move', move, player, to=game_id)


# triggers when a player leaves a room
@socketio.on('leave')
def on_leave(game_id, name):
    send(f'{name} left the game room', to=game_id)
    leave_room(game_id)


if __name__ == "__main__":
    # app.run(debug=True, port=5000)
    socketio.run(app, debug=True, port=5000)
