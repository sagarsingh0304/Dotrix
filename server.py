from flask import Flask, render_template, request

app = Flask(__name__)

@app.route('/')
@app.route('/home')
def home():
    return render_template('home.html')


@app.route('/joingame', methods=['GET'])
def join_room():
    game_id = request.args.get('gameid', False)    
    print(game_id)
    return {'msg': f'Congratulations! You are eligible to join the room {game_id}'}


@app.route('/newgame', methods=['POST'])
def create_new_game():
    request_json = request.get_json()
    dot_rows = request_json.get('rows', False)
    dot_cols = request_json.get('columns', False)
    print(f'{dot_rows} x {dot_cols}')
    return {'game':f'this is your game is this and size is {dot_rows} x {dot_cols}'}


if __name__ == "__main__":
    app.run(debug=True, port=5000)
