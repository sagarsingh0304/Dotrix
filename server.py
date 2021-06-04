from helperClass.Game import Game
from flask import Flask, render_template, request

app = Flask(__name__)

@app.route('/')
@app.route('/home')
def home():
    return render_template('home.html')


@app.route('/joingame', methods=['GET'])
def join_room():
    game_id = request.args.get('gameid', False)    
    if game_id in Game.gameids_in_use:
        return {'msg': f'Congratulations! You are eligible to join the room {game_id}'}
    return {'msg': 'Wrong GameId', 'errorCode': '400'}


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


if __name__ == "__main__":
    app.run(debug=True, port=5000)
