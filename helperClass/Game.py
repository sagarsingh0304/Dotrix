from random import randint

class Game:
    available_gameids = ['1341576', '201457']       # will store pre generated gameids which can be used. 
    map_gameid = {}       # it is used to store map of gamid with it's instance and also will store all the gameid which are in use.

    def __init__(self, rows, columns):
        self.rows = rows    # number of rows of dots on the board in the game.
        self.columns = columns      # number of columns of dots on the board in the game.
        self.gameid = Game.available_gameids.pop()   # assigns gameid from the list of available gamid.
        Game.flood_gameid()     # will call the class method to generate a new gmae id to added in available gameids.
        Game.map_gameid[self.gameid] = self     # will map the object to its gameid and this can use to check gameids used


    def get_gameid(self):
        return self.gameid


    def get_boardsize(self):
        return f"{self.rows} x {self.columns}"


    # this class method will generate a new gameid which is not already in use, add it in availble_gameids list.
    @classmethod   
    def flood_gameid(cls):
        new_id = str(randint(100000, 999999))
        while new_id in cls.map_gameid.keys():      # checks if new_id is not already in use
            new_id = str(randint(100000, 999999))
        cls.available_gameids.append(new_id)


    @classmethod
    def get_gameid_instance(cls, id):        #returns the object maped to passed id, if it exists else it returns None
        return cls.map_gameid.get(id, None)


    @classmethod
    def delete_game(cls, id):
        del cls.map_gameid[id]

