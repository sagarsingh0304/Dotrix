from helperClass.Game import Game

from flask_socketio import SocketIO, send

from flask import Flask, render_template, request

app = Flask(__name__)

# app.config['SECRET_KEY'] = ' ops! you can read this '
socketio = SocketIO(app)

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
    if game_id in Game.gameids_in_use:
        return render_template('arena.html', title="Game Arena - Dotrix")
    return render_template('error.html', errorcode=400)


@app.route('/newgame', methods=['POST'])
def create_new_game():
    request_json = request.get_json()
    dot_rows = request_json.get('rows', False)
    dot_columns = request_json.get('columns', False)
    newgame = Game(dot_rows, dot_columns)
    return {
        'message':f'successfully create a game with boardsize is {newgame.get_boardsize()}',
        'gameId': newgame.get_gameid(),
        'isCreator': True     
    }

@socketio.on('message')
def message(msg):
    print(f'\n\n {msg} \n\n')
    send(msg)


@socketio.on('avtar')
def set_avtar(avtar_name):
    send(f'{avtar_name} join the game')
    socketio.emit('set-avtar', avtar_name)

@socketio.on('move')
def send_move(move, player):
    socketio.emit('move', move, player)


if __name__ == "__main__":
    # app.run(debug=True, port=5000)
    socketio.run(app, debug=True, port=5000)
