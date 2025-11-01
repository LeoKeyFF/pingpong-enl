from flask import Flask, render_template, request, redirect, url_for, jsonify
import database
import random

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("main.html")

@app.route("/add_players", methods = ['POST'])
def add_players():
    names = request.form['names']
    if names:
        names = names.split(",")
        for name in names:
            database.add_players(name)
    
    return redirect(url_for('home'))


@app.route("/start_tour", methods = ['POST'])
def start_tour():
    # Players
    names = request.form['names']
    if names:
        names = names.split(",")
        for name in names:
            database.add_players(name)
    
    #Top Grid
    database.set_top_grid()

    #Bottom Grid
    database.set_bottom_grid()
    
    return redirect(url_for('home'))

@app.route("/get_data_top", methods = ['GET'])
def get_data_top():
    rounds, rounds_players = database.get_from_top_grid()
    all_rounds = 0
    if len(rounds) > 0:
        all_rounds = int(max(rounds))
    round_indexes = list(range(0, all_rounds))
    rows = []
    for round in rounds:
        row_index = 0
        for round_pl in rounds_players:
            if (round_pl[0] == round):
                round_pl_new = round_pl + (int(row_index), )
                rows.append(round_pl_new)
                row_index += all_rounds/round
    data = {
        'rows': rows, 
        'rounds_players': rounds_players,
        'rounds': rounds,
        'round_indexes': round_indexes,
        'all_rounds': all_rounds
    }
    return jsonify(data)

@app.route("/get_data_bottom", methods = ['GET'])
def get_data_bottom():
    rounds, rounds_players = database.get_from_bottom_grid()
    max_players = 0
    
    for round in rounds:
        max_for_round = 0
        for pl in rounds_players:
            if (pl[0] == round):
                max_for_round += 1
        if max_for_round >= max_players:
            max_players = max_for_round

    # if len(rounds) > 0:
    #     all_rounds = int(max(rounds))
    round_indexes = list(range(0, max_players))
    rows = []
    for round in rounds:
        max_players_in_round = 0
        for pl in rounds_players:
            if (pl[0] == round):
                max_players_in_round += 1
        row_index = 0
        for round_pl in rounds_players:
            if (round_pl[0] == round):
                round_pl_new = round_pl + (int(row_index), )
                rows.append(round_pl_new)
                row_index += max_players/max_players_in_round

    data = {
        'rows': rows, 
        'rounds_players': rounds_players,
        'rounds': rounds,
        'round_indexes': round_indexes,
        'all_rounds': max_players
    }
    return jsonify(data)


@app.route("/cleen", methods = ['POST'])
def cleen():
    database.cleen()
    return redirect(url_for('home'))

@app.route("/set_top_grid", methods = ['POST'])
def set_top_grid():
    database.set_top_grid()
    return redirect(url_for('home'))


@app.route("/send_winner", methods = ['POST'])
def send_winner():
    data = request.get_json()
    winner = data.get('winner', '')
    round = float(data.get('round', ''))
    grid = int(data.get('grid', ''))
    database.send_winner(winner, round, grid)
    return redirect(url_for('home'))

@app.route("/set_bottom_grid", methods = ['POST'])
def set_bottom_grid():
    database.set_bottom_grid()
    return redirect(url_for('home'))

if __name__ == "__main__":
    app.run(debug=True, host = "0.0.0.0")