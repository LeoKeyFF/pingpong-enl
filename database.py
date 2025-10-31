import sqlite3
import random
import math
from datetime import datetime

def init_db():
    connection = sqlite3.connect('database.db')
    cursor = connection.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS Players (
    PlayerID INTEGER PRIMARY KEY,
    Name varchar(255)
    )
    ''')

def add_players(name_):
    name = name_
    connection = sqlite3.connect('database.db')
    cursor = connection.cursor()
    [x.replace(" ", "") for x in name]
    a = f"INSERT INTO Players (Name) VALUES (\"{name}\");"
    cursor.execute(a)
    
    connection.commit()
    connection.close()

def get_players():
    connection = sqlite3.connect('database.db')
    cursor = connection.cursor()

    select_players = cursor.execute(f"SELECT Name FROM Players")
    players = select_players.fetchall()

    connection.close()
    
    return players

def set_top_grid():
    connection = sqlite3.connect('database.db')
    cursor = connection.cursor()

    players_orign = list()
    for player in get_players():
         players_orign.append(player[0].replace(" ", ""))

    players = players_orign[:]
    random.shuffle(players)

    first_round = 1
    while len(players) != first_round:
         first_round = first_round*2
         if first_round > len(players):
              first_round = first_round
              break   
         
    first_round = first_round / 2

    cursor.execute(
        f"CREATE TABLE IF NOT EXISTS TopGrid ( BracketID INTEGER PRIMARY KEY," 
          "RoundNumber INT, Player1ID INT, Player2ID INT, Winner INT, NextBracketID INT,"
          " FOREIGN KEY (NextBracketID) REFERENCES TopGrid (BracketID), FOREIGN KEY (Player2ID) REFERENCES Players(PlayerID),"
          " FOREIGN KEY (Player1ID) REFERENCES Players(PlayerID), FOREIGN KEY (Winner) REFERENCES Players(PlayerID))"
    )

    # for i in range (0, int(first_round)):
    #     if int(first_round) + i < len(players):
    #         cursor.execute(
    #             f"INSERT INTO TopGrid (Player1ID, Player2ID) VALUES ({players_orign.index(players[i]) + 1}, {players_orign.index(players[int(first_round) + i]) + 1})"
    #         )
    #     else:
    #         cursor.execute(
    #             f"INSERT INTO TopGrid (Player1ID) VALUES ({players_orign.index(players[i]) + 1})"
    #             )  
    #         bracket_id_win = cursor.execute(
    #             f"SELECT BracketID FROM TopGrid WHERE Player1ID = {players_orign.index(players[i]) + 1}"
    #             ).fetchall()[0][0]
    #         print(bracket_id_win, int(players_orign.index(players[i]) + 1))
    #         #set_winner_logic(bracket_id_win , int(players_orign.index(players[i]) + 1), connection, cursor)
    #         cursor.execute(
    #             f"UPDATE TopGrid SET Winner = {int(players_orign.index(players[i]) + 1)} WHERE BracketID = {bracket_id_win}"
    #         )
        

    counter_next = 0
    counter_id = 1
    for n in range(1, int(first_round)):
        for bracket in range(0, int(first_round/(2**n))):
            counter_next += 1
            if(int(first_round/(2**n)) < 1):
                break

            is_last = cursor.execute(f"SELECT COUNT(*) FROM TopGrid WHERE BracketID = {counter_id} ").fetchall()[0]
            if is_last[0] == 0:
                cursor.execute(
                    f"INSERT INTO TopGrid (NextBracketID) VALUES ({counter_next + first_round})"
                )
                cursor.execute(
                    f"INSERT INTO TopGrid (NextBracketID) VALUES ({counter_next + first_round})"
                )
            else:
                cursor.execute(
                    f"UPDATE TopGrid SET NextBracketID = {counter_next + first_round} WHERE BracketID = {counter_id}"
                )
                cursor.execute(
                    f"UPDATE TopGrid SET NextBracketID = {counter_next + first_round} WHERE BracketID = {counter_id + 1}"
                )
            counter_id += 2

    for i in range (0, int(first_round)):
        if int(first_round) + i < len(players):
            cursor.execute(
                f"UPDATE TopGrid SET Player1ID = {players_orign.index(players[i]) + 1}, Player2ID = {players_orign.index(players[int(first_round) + i]) + 1} WHERE BracketID = {i + 1}"
            )
        else:
            cursor.execute(
                f"UPDATE TopGrid SET Player1ID = {players_orign.index(players[i]) + 1} WHERE BracketID = {i + 1}"
                )  
            bracket_id_win = cursor.execute(
                f"SELECT BracketID FROM TopGrid WHERE Player1ID = {players_orign.index(players[i]) + 1}"
                ).fetchall()[0][0]
            set_winner_logic(bracket_id_win , int(players_orign.index(players[i]) + 1), connection, cursor, 0)


    m = 0
    counter = 0
    while (first_round / (2**m)) >= 1:
        for bracket_id in range(1, int(first_round / (2**m) )+ 1):
             counter += 1
             cursor.execute(
                f"UPDATE TopGrid SET RoundNumber = {int(first_round / (2**m) )} WHERE BracketID = {counter}"
            )
             if cursor.execute(f"SELECT COUNT(*) FROM TopGrid WHERE BracketID = {counter} ").fetchall()[0][0] == 0:
                cursor.execute(
                    f"INSERT INTO TopGrid (RoundNumber) VALUES ({int(first_round / (2**m) )})"
                )
        m+=1

    connection.commit()
    connection.close()


def get_from_top_grid():
    connection = sqlite3.connect('database.db')
    cursor = connection.cursor()
    rounds_ = list(set(cursor.execute(f"SELECT RoundNumber FROM TopGrid").fetchall()))
    rounds = []
    for r in rounds_:
        if r[0] not in rounds:
            rounds.append(r[0])
    rounds.sort(reverse= True)
    rounds_players = cursor.execute(
         f"SELECT r.RoundNumber, COALESCE(p1.Name, ''),COALESCE(p2.Name, ''), COALESCE(w.Name, '') "
         "FROM TopGrid r "
         "LEFT JOIN Players p1 ON r.Player1ID = p1.PlayerID "
         "LEFT JOIN Players p2 ON r.Player2ID = p2.PlayerID "
        "LEFT JOIN Players w ON r.Winner = w.PlayerID "
         "ORDER BY r.RoundNumber"
    ).fetchall()
    connection.close()
    return rounds, rounds_players

def get_from_bottom_grid():
    connection = sqlite3.connect('database.db')
    cursor = connection.cursor()
    rounds_ = list(set(cursor.execute(f"SELECT RoundNumber FROM BottomGrid").fetchall()))
    rounds = []
    for r in rounds_:
        if r[0] not in rounds:
            rounds.append(r[0])
    rounds.sort(reverse= False)
    rounds_players = cursor.execute(
         f"SELECT r.RoundNumber, COALESCE(p1.Name, ''),COALESCE(p2.Name, ''), COALESCE(w.Name, '') "
         "FROM BottomGrid r "
         "LEFT JOIN Players p1 ON r.Player1ID = p1.PlayerID "
         "LEFT JOIN Players p2 ON r.Player2ID = p2.PlayerID "
        "LEFT JOIN Players w ON r.Winner = w.PlayerID "
         "ORDER BY r.RoundNumber"
    ).fetchall()
    connection.close()
    return rounds, rounds_players


def set_winner(bracket_id , winner):
    connection = sqlite3.connect('database.db')
    cursor = connection.cursor()


    set_winner_logic(bracket_id , winner, connection, cursor, 0)

    connection.commit()
    connection.close()

def set_winner_logic(bracket_id , winner, connection, cursor, grid):
    if grid == 0:
        cursor.execute(
            f"UPDATE TopGrid SET Winner = {winner} WHERE BracketID = {bracket_id}"
        )
        next_bracket_id = cursor.execute(
            f"SELECT NextBracketID FROM TopGrid WHERE BracketID = {bracket_id}"
        ).fetchall()[0][0]
        if (next_bracket_id  != None):
            cursor.execute(
            f"UPDATE TopGrid SET Player1ID = CASE WHEN BracketID = {next_bracket_id} AND (Player1ID IS NULL OR Player1ID = '') THEN {winner} ELSE Player1ID END, Player2ID = CASE WHEN Player1ID IS NOT NULL AND Player1ID != '' AND (Player2ID IS NULL OR Player2ID = '') AND BracketID = {next_bracket_id} THEN {winner} ELSE Player2ID END"
            )
    else:
        cursor.execute(
        f"UPDATE BottomGrid SET Winner = {winner} WHERE BracketID = {bracket_id}"
        )
    

def send_winner(winner, round, grid):
    connection = sqlite3.connect('database.db')
    cursor = connection.cursor()
    winner_id = cursor.execute(
        f"SELECT PlayerID FROM Players WHERE Players.Name = '{winner}'"
    ).fetchall()[0][0]
    bracket_id = 0
    if grid == 0:
        bracket_id = cursor.execute(
            f"SELECT BracketID FROM TopGrid WHERE RoundNumber = {int(round)} AND (Player1ID = {winner_id} OR Player2ID = {winner_id})"
        ).fetchall()[0][0]
    else:
        bracket_id = cursor.execute(
        f"SELECT BracketID FROM BottomGrid WHERE RoundNumber = {round} AND (Player1ID = {winner_id} OR Player2ID = {winner_id})"
        ).fetchall()[0][0]
    # cursor.execute(
    #     f"UPDATE TopGrid SET Winner = (SELECT PlayerID FROM Players WHERE Players.Name = '{winner}') WHERE RoundNumber = {round}"
    # )

    set_winner_logic(bracket_id , winner_id, connection, cursor, grid)

    connection.commit()
    connection.close()

def set_bottom_grid():
    connection = sqlite3.connect('database.db')
    cursor = connection.cursor()

    cursor.execute(
        f"CREATE TABLE IF NOT EXISTS BottomGrid ( BracketID INTEGER PRIMARY KEY," 
          "RoundNumber REAL, Player1ID INT, Player2ID INT, Winner INT,"
          " FOREIGN KEY (Player2ID) REFERENCES Players(PlayerID),"
          " FOREIGN KEY (Player1ID) REFERENCES Players(PlayerID), FOREIGN KEY (Winner) REFERENCES Players(PlayerID))"
    )
    rounds_ = list(set(cursor.execute(f"SELECT RoundNumber FROM TopGrid").fetchall()))
    rounds = []
    for r in rounds_:
        if r[0] not in rounds:
            rounds.append(r[0])
    rounds.sort(reverse = True)
    bottom_round = 0
    for round in rounds:
        bottom_round = rounds.index(round) + 1
        winners = cursor.execute(
        f"SELECT Winner FROM TopGrid WHERE RoundNumber = {round}"
        ).fetchall()
        set_grid = True
        for winner in winners:
            if winner[0] == None:
                set_grid = False
        
        is_full = cursor.execute(
        f"SELECT COUNT(*) FROM BottomGrid WHERE RoundNumber = {bottom_round}"
        ).fetchall()[0][0]
        if is_full != 0:
            set_grid = False
        

        bottom_winners_before = cursor.execute(
        f"SELECT Winner FROM BottomGrid WHERE RoundNumber = {bottom_round - 1}"
        ).fetchall()
        for a in bottom_winners_before:
            if a[0] == None:
               set_grid = False
        if len(bottom_winners_before) == 0 and bottom_round != 1:
            set_grid = False

        losers = cursor.execute(
        f"SELECT Player1ID FROM TopGrid WHERE Player1ID != Winner AND RoundNumber = {round} UNION ALL SELECT Player2ID FROM TopGrid WHERE Player2ID != Winner AND RoundNumber = {round}"
        ).fetchall()

        pre_round = cursor.execute(
        f"SELECT COUNT(*) FROM BottomGrid WHERE RoundNumber = {bottom_round - 0.5}"
        ).fetchall()[0][0]


        if pre_round != 0:
            pre_winners = cursor.execute(
            f"SELECT Winner FROM BottomGrid WHERE RoundNumber = {bottom_round - 0.5}"
            ).fetchall()
            for a in pre_winners:
                if a[0] == None and len(pre_winners) == 0:
                     set_grid = False
                     break
                else:
                    set_grid = True


            is_full = cursor.execute(
            f"SELECT COUNT(*) FROM BottomGrid WHERE RoundNumber = {bottom_round}"
            ).fetchall()[0][0]
            if is_full != 0:
                set_grid = False


            pre_players = cursor.execute(
            f"SELECT Player1ID FROM BottomGrid WHERE RoundNumber = {bottom_round - 0.5} "
            ).fetchall() + cursor.execute(
            f"SELECT Player2ID FROM BottomGrid WHERE RoundNumber = {bottom_round - 0.5} "
            ).fetchall()

            for player in pre_players:
                if player in losers:
                    losers.remove(player)
            losers += pre_winners
            bottom_winners_before = pre_winners
        else:
            losers += bottom_winners_before
        
        if (len(bottom_winners_before) > len(winners)) or (len(losers) % 2 != 0 and (len(losers) != 1)):
            bottom_round = bottom_round - 0.5
            if len(bottom_winners_before) > len(winners):
                losers = bottom_winners_before[:(len(bottom_winners_before) -  len(winners) + 2)]
            else:
                random.shuffle(losers)
                losers = losers[:2]
        
        print("роунд: ", round, "losers: ", losers, "bottom_winners_before: ", bottom_winners_before)
        
        random.shuffle(losers)
        if set_grid:
            for i in range (0, math.ceil(len(losers)/2)):
                if math.ceil(len(losers)/2) + i < len(losers):
                    cursor.execute(
                    f"INSERT INTO BottomGrid (RoundNumber, Player1ID, Player2ID) VALUES ({bottom_round}, {losers[i][0]}, {losers[math.ceil(len(losers)/2) + i][0]})"
                    )  
                else:
                    cursor.execute(
                    f"INSERT INTO BottomGrid (RoundNumber, Player1ID) VALUES ({bottom_round}, {losers[i][0]})"
                    ) 
                    bracket_id_win = cursor.execute(
                    f"SELECT BracketID FROM BottomGrid WHERE Player1ID = {losers[i][0]}"
                    ).fetchall()[0][0]
                    set_winner_logic(bracket_id_win , losers[i][0], connection, cursor, 1)
        

    connection.commit()
    connection.close()



def cleen():
    connection = sqlite3.connect('database.db')
    cursor = connection.cursor()

    cursor.execute(f"DELETE FROM Players")
    cursor.execute(f"DELETE FROM TopGrid")
    cursor.execute(f"DELETE FROM BottomGrid")

    connection.commit()
    connection.close()

