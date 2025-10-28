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

@app.route("/get_players", methods = ['POST'])
def get_players():
    players = database.get_players()
    return render_template("main.html", players = players)

@app.route("/get_data", methods = ['GET'])
def get_data():
    data = random.random()
    rounds, rounds_players = database.get_from_top_grid()
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

@app.route("/cleen", methods = ['POST'])
def cleen():
    database.cleen()
    return redirect(url_for('home'))

@app.route("/set_top_grid", methods = ['POST'])
def set_top_grid():
    database.set_top_grid()
    # rounds, rounds_players = database.get_from_top_grid()
    return redirect(url_for('home'))

@app.route("/get_from_top_grid", methods = ['GET'])
def get_from_top_grid():
    rounds, rounds_players = database.get_from_top_grid()
    all_rounds = int(max(rounds))
    round_indexes = range(0, all_rounds)
    print(rounds_players)
    rows = []
    for round in rounds:
        row_index = 0
        for round_pl in rounds_players:
            if (round_pl[0] == round):
                round_pl_new = round_pl + (int(row_index), )
                rows.append(round_pl_new)
                row_index += all_rounds/round
    print(rows)
    return render_template("main.html", rounds_players = rounds_players, rounds = rounds, 
                           rows = rows, round_indexes = round_indexes, all_rounds = all_rounds)


@app.route("/set_winner", methods = ['POST'])
def set_winner():
    winner = 1
    bracket_id = 1
    database.set_winner(bracket_id, winner)
    return redirect(url_for('home'))

@app.route("/send_winner", methods = ['POST'])
def send_winner():
    data = request.get_json()
    winner = data.get('winner', '')
    round = int(data.get('round', ''))

    print(round)
    database.send_winner(winner, round)
    return redirect(url_for('home'))

if __name__ == "__main__":
    app.run(debug=True, host = "0.0.0.0")