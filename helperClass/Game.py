from random import randint

class Game:
    available_gameids = ['1341576', '201457']       # will store pre generated gameids which can be used. 
    map_gameid = {}       # it is used to store map of gamid with it's instance and also will store all the gameid which are in use.

    def __init__(self, rows, columns):
        self.AVAILABLE_COLORS = ["#008037", "#216CD0", "#F7BC13", "#DD5D00", "#C72C41"] 
        self.players = []   # will store the player name
        self.rows = rows    # number of rows of dots on the board in the game.
        self.columns = columns      # number of columns of dots on the board in the game.
        self.gameid = Game.available_gameids.pop()   # assigns gameid from the list of available gamid.
        self.is_game_on = False
        Game.flood_gameid()     # will call the class method to generate a new gmae id to added in available gameids.
        Game.map_gameid[self.gameid] = self     # will map the object to its gameid and this can use to check gameids used


    def get_gameid(self):
        return self.gameid


    def get_boardsize(self):
        return f"{self.rows} x {self.columns}"


    def get_players(self):
        return self.players
        

    def add_player(self, player_name):
        if len(self.players) < 5:
            is_starter = True if len(self.players) == 0 else False
                
            player = {
                "name": player_name,
                "color": self.AVAILABLE_COLORS.pop(),
                "isStarter": is_starter,
                "isMe": False,
                "score": 0  
            }
            self.players.append(player)
            return player
        return False


    # this class method will generate a new gameid which is not already in use, add it in availble_gameids list.
    @classmethod   
    def flood_gameid(cls):
        new_id = str(randint(100000, 999999))
        while new_id in cls.map_gameid.keys():      # checks if new_id is not already in use
            new_id = str(randint(100000, 999999))
        cls.available_gameids.append(new_id)


    @classmethod
    def get_gameid_instance(cls, game_id):        #returns the object maped to passed id, if it exists else it returns None
        return cls.map_gameid.get(game_id, None)


    @classmethod              
    def get_players_in_gameid(cls, game_id):    # will return the list of players in game
        game_instance = cls.get_gameid_instance(game_id)
        return game_instance.get_players()


    # @classmethod
    # def add_player_in_gameid(cls, game_id, player):     # will add player in game is possible
    #     game_instance = cls.get_gameid_instance(game_id)
    #     return game_instance.add_player(player)
        

    @classmethod
    def set_game_on(cls, game_id):
        game_instance = cls.get_gameid_instance(game_id)
        game_instance.is_game_on = True


    @classmethod
    def delete_game(cls, id):
        del cls.map_gameid[id]


