let player1
let player2
let round
let grid

let winner
let winner_bottom

// let get_from_top_grid = {
//         'rows': Array(), 
//         'rounds_players': Array(),
//         'rounds': Array(),
//         'round_indexes': Array(),
//         'all_rounds': String
// }

// let get_from_bottom_grid = {
//         'rows': Array(), 
//         'rounds_players': Array(),
//         'rounds': Array(),
//         'round_indexes': Array(),
//         'all_rounds': String
// }

function openChooseWinner(r, p1, p2, grid_){
    player1 = p1;
    player2 = p2;
    round = r;
    grid = grid_;

    const dialog = document.getElementById("chooseWinner");

    const contentElementP1 = document.getElementById('dialogPlayer1');
    const contentElementP2 = document.getElementById('dialogPlayer2');
    contentElementP1.textContent = player1;
    contentElementP2.textContent = player2;

    dialog.addEventListener('click', function (e) {
        if (e.target === this) {
            this.close();
        }
    });

    dialog.showModal();
    
}

function closeChooseWinner(w){
    const dialog = document.getElementById("chooseWinner");

    dialog.close();
    if (w == 0)
        winner = player1
    else
        winner = player2;

    sendWinners()
}

async function sendWinners(){
    const dataToSend = { 
        winner: winner,
        round: round,
        grid: grid
    };

    $.ajax({
        type: "POST",
        url: '/send_winner',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(dataToSend),
        dataType: 'json',
        success: function (response, status, jqXHR) {
            updateDynamicContent()
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // Error handling
        },
        complete: function (jqXHR, textStatus) {
            updateDynamicContent()
        }
    });

    $.ajax({
        type: "POST",
        url: '/set_bottom_grid',
        contentType: 'application/json; charset=utf-8',
        success: function (response, status, jqXHR) {
            updateDynamicContent()
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // Error handling
        },
        complete: function (jqXHR, textStatus) {
            updateDynamicContent()
        }
    });
}

function createGridTable(id, data, div_id, grid_){
    const table = $('<table>', {
        id: id,
        class: 'grid-table'
    });
    const thead = $('<thead>');
    const headerRow = $('<tr>');

    for (const round of data.rounds){
        if (grid_ == 0){
            th = $('<th>');
            if (round != 1){
                divHead =  $('<div>',{
                    class: 'round-header',
                    text: "1/" + round + " Финала"
                });
            } else {
                divHead =  $('<div>',{
                    class: 'round-header',
                    text: "Финал"
                });
            }
        } else{
            th = $('<th>');
            divHead = $('<div>', {
                class: 'round-header',
                text: "Раунд " + round
            });
        }


        th.append(divHead)
        headerRow.append(th);
    };
    thead.append(headerRow);
    table.append(thead);

    const tbody = $('<tbody>');
    for (let round of data.round_indexes){
        const tr = $('<tr>');
        for (let row of data.rows){
            if (row[4] == round){
                if (grid_ == 0){
                    td = $('<td>', {
                        rowspan: data.all_rounds/row[0]
                    });
                } else {
                    players_in_column = 0
                    for (let pl of data.rows){
                        if (pl[0] == row[0]){
                            players_in_column += 1
                        }
                    }
                    td = $('<td>', {
                        rowspan: data.all_rounds/players_in_column
                    });                    
                }

                if (row[3] == ''){
                    if (row[1] == '' || row[2] == ''){
                        divPlayerBox = $('<div>',{
                            class: 'player-box'
                        }); 
                    }
                    else{
                        divPlayerBox = $('<div>',{
                            class: 'player-box'
                        }).on("click", function() {openChooseWinner(row[0] ,row[1], row[2], grid_)}); 
                    }
                    divRow1 = $('<div>',{
                        class: 'player-name',
                        text: row[1]
                    });
                    divRow2 = $('<div>',{
                        class: 'player-name',
                        text: row[2]
                    });
                    divPlayerBox.append(divRow1)
                    divPlayerBox.append($('<hr>'))
                    divPlayerBox.append(divRow2)
                    td.append(divPlayerBox);
                }
                else{
                    if (row[3] ==  row[1]){
                        divRow1 = $('<div>',{
                            class: 'player-name-winner',
                            text: row[1]
                        });
                        divRow2 = $('<div>', {
                            class: 'player-name',
                            text: row[2]
                        });
                    }
                    else{
                        divRow1 = $('<div>', {
                            class: 'player-name',
                            text: row[1]
                        });
                        divRow2 = $('<div>',{
                            class: 'player-name-winner',
                            text: row[2]
                        });
                    }
                    divPlayerBox = $('<div>',{
                        class: 'player-box'
                    }); 

                    divPlayerBox.append(divRow1)
                    divPlayerBox.append($('<hr>'))
                    divPlayerBox.append(divRow2)
                    td.append(divPlayerBox);
                }
                tr.append(td)
            }
        }
        tbody.append(tr);
    }  
    table.append(tbody);
    $(div_id).append(table);
}

function updateDynamicContent() {
    $.ajax({
        url: '/get_data_top',  // Flask route URL
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            // get_from_top_grid = data;
            $('#topGridTable').remove();
            createGridTable(id='topGridTable', data = data, div_id = '#topgrid', grid_ = '0');
        },
        error: function() {
            console.error('Error fetching data.');
        }
    });

    $.ajax({
        url: '/get_data_bottom',  // Flask route URL
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            // get_from_bottom_grid = data;
            $('#bottomGridTable').remove();
            createGridTable(id='bottomGridTable', data = data, div_id = '#bottomgrid', grid_ = '1');
        },
        error: function () {
            console.error('Error fetching data.');
        }
    });
}










