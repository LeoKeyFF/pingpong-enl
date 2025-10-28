let player1
let player2
let round

let winner

let get_from_top_grid = {
        'rows': Array(), 
        'rounds_players': Array(),
        'rounds': Array(),
        'round_indexes': Array(),
        'all_rounds': String
}

function openChooseWinner(r, p1, p2){
    player1 = p1;
    player2 = p2;
    round = r;
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
        round: round
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

    // try {
    //     const response = await fetch('/send_winner', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify(dataToSend)
    //     });

    //     if (!response.ok) {
    //         throw new Error(`HTTP error! status: ${response.status}`);
    //     }

    //     const result = await response.json();
    //     document.getElementById('response').innerText = result.message;
    // } catch (error) {
    //     console.error('Error calling Flask function:', error);
    //     document.getElementById('response').innerText = 'Error: ' + error.message;
    // }
    
}

function createTopGridTable(){

    const table = $('<table>', {
        id: 'topGridTable',
        class: 'grid-table'
    });
    const thead = $('<thead>');
    const headerRow = $('<tr>');

    for (const round of get_from_top_grid.rounds){
        th = $('<th>');
        divHead =  $('<div>',{
            class: 'round-header',
            text: "1/" + round + " Финала"
        });
        th.append(divHead)
        headerRow.append(th);
    };
    thead.append(headerRow);
    table.append(thead);

    const tbody = $('<tbody>');
    for (let round of get_from_top_grid.round_indexes){
        const tr = $('<tr>');
        for (let row of get_from_top_grid.rows){
            if (row[4] == round){
                td = $('<td>', {
                    rowspan: get_from_top_grid.all_rounds/row[0]
                });
                if (row[3] == ''){
                    if (row[1] == '' || row[2] == ''){
                        divPlayerBox = $('<div>',{
                            class: 'player-box'
                        }); 
                    }
                    else{
                        divPlayerBox = $('<div>',{
                            class: 'player-box'
                        }).on("click", function() {openChooseWinner(row[0] ,row[1], row[2])}); 
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
    $('#topgrid').append(table);
}

function updateDynamicContent() {
    $.ajax({
        url: '/get_data',  // Flask route URL
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            get_from_top_grid = data;
            $('#dynamic-content').text('Value: ' + get_from_top_grid.rounds);

            $('#topGridTable').remove();
            createTopGridTable()
        },
        error: function() {
            console.error('Error fetching data.');
        }
    });
}










