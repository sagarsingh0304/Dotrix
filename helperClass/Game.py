from random import randint
class Game:
    gameids_in_use = []     # will store all the gameid which are in use
    available_gameids = ['134576', '201457']       # will store pre generated gameids which can be used 

    def __init__(self, rows, columns):
        self.players_socketid = []      # will store the socketid of all the players in the game or room
        self.rows = rows    # number of rows of dots on the board in the game
        self.columns = columns      # number of columns of dots on the board in the game
        self.gameid = Game.available_gameids.pop()   # assigns gameid from the list of available gamid
        Game.gameids_in_use.append(self.gameid)     # makes this gameid in the list of inuse game ids
        Game.flood_gameid()     # will call the class method to generate a new gmae id to added in available gameids


    # this class method will generate a new gameid which is not already in use, add it in availble_gameids list
    @classmethod   
    def flood_gameid(cls):
        new_id = str(randint(100000, 999999))
        while new_id in cls.gameids_in_use:      # checks if new_id is not already in use
            new_id = str(randint(100000, 999999))
        cls.available_gameids.append(new_id)


    # destructor will remove gameid from the list of gameids_in_use as the game object is deleted
    def __del__(self):
        Game.gameids_in_use.remove(self.gameid)      
