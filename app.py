from flask import Flask, render_template, request, redirect, url_for, jsonify, make_response
import database
import argparse

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("main.html")

@app.route("/start_tour", methods = ['POST'])
def start_tour():
    # Players
    names = request.form['names']
    if names and len(names) != 0 and len(names.split(",")) < 129:
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


@app.route("/send_winner", methods = ['POST'])
def send_winner():
    password = request.cookies.get('password')
    if password:
        pass
    data = request.get_json()
    winner = data.get('winner', '')
    round = float(data.get('round', ''))
    grid = int(data.get('grid', ''))
    database.send_winner(winner, round, grid)
    return redirect(url_for('home'))


@app.route("/create_base_tables", methods = ['POST'])
def create_base_tables():
    database.create_base_tables()
    return redirect(url_for('home'))

@app.route("/account", methods = ['POST'])
def account():
    password = request.form['password']
    resp = make_response(redirect(url_for('home')))
    resp.set_cookie('password', password, max_age=300)
    return resp

@app.route("/get_account", methods = ['GET'])
def get_account():
    password = request.cookies.get('password')
    right_password = "12300"
    data = {
        'password_correct': password ==  right_password, 
    }
    return jsonify(data)

@app.route("/cleen_password", methods = ['POST'])
def cleen_password():
    resp = make_response(redirect(url_for('home')))
    resp.set_cookie('password', '', max_age=0)
    return resp

@app.route("/history_cancel", methods = ['POST'])
def history_cancel():
    database.history_cancel()
    return redirect(url_for('home'))

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="The backend for enl ping pong")
    parser.add_argument('db_path', help='The path of the database')
    try:
        args = parser.parse_args()
        database.database_path = args.db_path
        app.run(debug=False, host = "0.0.0.0")
    except:
        parser.print_help()
        database.database_path = 'local_database.db'
        app.run(debug=False, host = "0.0.0.0")
