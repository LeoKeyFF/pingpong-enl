let player1
let player2
let round
let grid

let winner
let winner_bottom

let password_correct = false

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
}

function createGridTable(id, data, div_id, grid_){
    const table = $('<table>', {
        id: id,
        class: 'grid-table'
    });
    const thead = $('<thead>');
    const headerRow = $('<tr>');

    for (const round of data.rounds){
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
                    if (row[1] != '' && row[2] != ''  && password_correct == true){
                        divPlayerBox = $('<div>',{
                            class: 'player-box'
                        }).on("click", function() {openChooseWinner(row[0] ,row[1], row[2], grid_)}); 
                    }
                    else{
                        divPlayerBox = $('<div>',{
                            class: 'player-box'
                        }); 
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

function grand_final_table(players){
    local_grid = 2
    const table = $('<table>', {
        id: 'grandFinalTable',
        class: 'grid-table-final'
    });

    const trhead = $('<tr>');
    const tbody = $('<tbody>');

    divHead =  $('<div>',{
        class: 'round-header',
        text: "Финал"
    });

    trhead.append(divHead)
    tbody.append(trhead)

    const tr = $('<tr>');
    td = $('<td>');


    if (players[2] == ''){
        if (players[0] != '' && players[1] != ''  && password_correct == true){
            divPlayerBox = $('<div>',{
                class: 'player-box'
            }).on("click", function() {openChooseWinner(0 ,players[0], players[1], local_grid)}); 
        }
        else{
            divPlayerBox = $('<div>',{
                class: 'player-box'
            }); 
        }                    
        divRow1 = $('<div>',{
            class: 'player-name',
            text: players[0]
        });
        divRow2 = $('<div>',{
            class: 'player-name',
            text: players[1]
        });
        divPlayerBox.append(divRow1)
        divPlayerBox.append($('<hr>'))
        divPlayerBox.append(divRow2)
        td.append(divPlayerBox);
    }
    else{
        if (players[0] ==  players[2]){
            divRow1 = $('<div>',{
                class: 'player-name-winner',
                text: players[0]
            });
            divRow2 = $('<div>', {
                class: 'player-name',
                text: players[1]
            });
        }
        else{
            divRow1 = $('<div>', {
                class: 'player-name',
                text: players[0]
            });
            divRow2 = $('<div>',{
                class: 'player-name-winner',
                text: players[1]
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
    tbody.append(tr);   
    table.append(tbody);
    $('#grand_final_page').append(table);
}

function updateDynamicContent() {
    check_passwors()
    $.ajax({
        url: '/get_data_top',  // Flask route URL
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            $('#topGridTable').remove();
            if (data.rounds.length == 0){
                $("#bottom_grid_page").css("display", "none");
                $("#add_players_page").css("display", "block");
                $("#top_grid_page").css("display", "none");
                $("#not_in_start").css("display", "none");
                $("#cleen_button").css("display", "none");
                $("#history_cancel").css("display", "none");
            }
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
            $('#bottomGridTable').remove();
            createGridTable(id='bottomGridTable', data = data, div_id = '#bottomgrid', grid_ = '1');
        },
        error: function () {
            console.error('Error fetching data.');
        }
    });

    $.ajax({
        url: '/get_data_grand',  // Flask route URL
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            $('#grandFinalTable').remove();
            
            grand_final_table(data.players)
        },
        error: function () {
            console.error('Error fetching data.');
        }
    });
}

function check_passwors(){
    $.ajax({
        url: '/get_account',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            password_correct = data.password_correct
            if (password_correct){
                $("#acc_button").text("Выйти");
                $("#acc_button").removeClass("btn btn-primary");
                $("#acc_button").addClass("btn btn-tertiary");

                $("#start").prop('disabled', false);
                $("#cleen_button").prop('disabled', false);

            } else {
                $("#acc_button").removeClass("btn btn-tertiary");
                $("#acc_button").addClass("btn btn-primary");
                $("#acc_button").text("Войти");

                $("#start").prop('disabled', true);
                $("#cleen_button_itself").prop('disabled', true);
                $('.player-box').on("click", function() {return false})
            }
        },
        error: function () {
            console.error('Error fetching data.');
        }
    });
}

function showPage(page) {
    if (page == 0){
        $("#bottom_grid_page").css("display", "none");
        $("#add_players_page").css("display", "none");
        $("#top_grid_page").css("display", "block");
        $("#grand_final_page").css("display", "none");
        $("#history_cancel").css("display", "block");
        
    } 
    else if (page == 1){
        $("#bottom_grid_page").css("display", "block");
        $("#add_players_page").css("display", "none");
        $("#top_grid_page").css("display", "none");
        $("#grand_final_page").css("display", "none");
        $("#history_cancel").css("display", "block");
        
    } 
    else if (page == 2){
        $("#bottom_grid_page").css("display", "none");
        $("#add_players_page").css("display", "none");
        $("#top_grid_page").css("display", "none");
        $("#grand_final_page").css("display", "block");
        $("#history_cancel").css("display", "block");
    }
    $('.tab').removeClass('active');
    $('.tab').eq(page).addClass('active')

}

async function createDatabaseTables(){

    $.ajax({
        type: "POST",
        url: '/create_base_tables',
        success: function (response, status, jqXHR) {
        },
        error: function (jqXHR, textStatus, errorThrown) {
        },
        complete: function (jqXHR, textStatus) {
        }
    });
}

function openAccDialog(){
    const dialog = document.getElementById("account");

    if(password_correct){ 
        $.ajax({
            type: "POST",
            url: '/cleen_password',
            success: function (response, status, jqXHR) {
                updateDynamicContent()
            },
            error: function (jqXHR, textStatus, errorThrown) {
            },
            complete: function (jqXHR, textStatus) {
            }
        });

    } else {
        dialog.addEventListener('click', function (e) {
            if (e.target === this) {
                this.close();
            }
        });

        dialog.showModal();   
    }
}

function closeAccount(){
    const dialog = document.getElementById("account");
    dialog.close();
}

function history_cancel(){
    if (password_correct){
        $.ajax({
            type: "POST",
            url: '/history_cancel',
            success: function (response, status, jqXHR) {
                updateDynamicContent()
            },
            error: function (jqXHR, textStatus, errorThrown) {
            },
            complete: function (jqXHR, textStatus) {
            }
        });
    }
}










