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
                $("#acc_button").css("display", "none");
                $("#menuToggle").css("display", "none");
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
            $('#topPlayers').remove();
            
            grand_final_table(data.players)
            if (data.top.length > 0) {
                top_players(data.top)
            }
            
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

                $("#cleen_button_itself").prop('disabled', false);
                $("#change_password_btn").prop('disabled', false);

                $("#cleen_button_itself").css("display", "block");
                $("#change_password_btn").css("display", "block");
                $("#history_cancel").css("display", "block");

            } else {
                $("#acc_button").text("Войти");
                $("#acc_button").removeClass("btn btn-tertiary");
                $("#acc_button").addClass("btn btn-primary");
                

                $("#cleen_button_itself").prop('disabled', true);
                $("#change_password_btn").prop('disabled', true);
                $('.player-box').on("click", function() {return false})

                $("#cleen_button_itself").css("display", "none");
                $("#change_password_btn").css("display", "none");
                $("#history_cancel").css("display", "none");
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
        $("#acc_button").css("display", "inline"); 
        $("#menuToggle").css("display", "flex");
    } 
    else if (page == 1){
        $("#bottom_grid_page").css("display", "block");
        $("#add_players_page").css("display", "none");
        $("#top_grid_page").css("display", "none");
        $("#grand_final_page").css("display", "none");
        $("#acc_button").css("display", "inline");
        $("#menuToggle").css("display", "flex");
    }
    else if (page == 2){
        $("#bottom_grid_page").css("display", "none");
        $("#add_players_page").css("display", "none");
        $("#top_grid_page").css("display", "none");
        $("#grand_final_page").css("display", "block");
        $("#acc_button").css("display", "inline");
        $("#menuToggle").css("display", "flex");
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

function openChangePasswordDialog(){
    const dialog = document.getElementById("change_password_dialog");
    dialog.showModal(); 
    dialog.addEventListener('click', function (e) {
        if (e.target === this) {
            this.close();
        }
    });
}

function closeChangePasswordDialog(){
    const dialog = document.getElementById("change_password_dialog");
    dialog.close();
}


function top_players(top){

    const divPlayer1 = $('<div>',{
        class: 'top-player',
        text: top[0]
    });

    const divPlayer2 = $('<div>',{
        class: 'top-player',
        text: top[1]
    });

    const divPlayer3 = $('<div>',{
        class: 'top-player',
        text: top[2]
    });

    const gold = $('<img>',{
        class: 'megal-img',
        src: '/static/pictures/medal_gold.png',
        alt: 'gold'
    });

    const silver = $('<img>',{
        class: 'megal-img',
        src: '/static/pictures/medal_silver.png',
        alt: 'silver'
    });

    const bronse = $('<img>',{
        class: 'megal-img',
        src: '/static/pictures/medal_bronse.png',
        alt: 'bronse'
    });

    const text_lable = 'Поздравляем победителя и призёров турнира!'
    const lable = $('<lable>',{
        text: text_lable,
        class: 'top-div-element top-lable'
    });

    const place1 = $('<lable>',{
        text: 'Первое место:',
        class: 'top-place'
    });
    const place2 = $('<lable>',{
        text: 'Второе место:',
        class: 'top-place'
    });
    const place3 = $('<lable>',{
        text: 'Третье место:',
        class: 'top-place'
    });

    const table = $('<table>', {
        class: 'top-table',
        id: 'topPlayers'
    })
    table.append(
        $('<tr>', {class: 'table-lable-row'}).append(
            $('<td>', {class: 'table-lable-td', colspan: 3, text: text_lable})
        )
    )
    table.append(
        $('<tr>').append(
            $('<td>', {class: 'big'}).append(place1)
        ).append(
            $('<td>', {class: 'small'}).append(divPlayer1)
        ).append(
            $('<td>', {class: 'big'}).append(gold)
        )
    )
    table.append(
        $('<tr>').append(
            $('<td>', {class: 'big'}).append(place2)
        ).append(
            $('<td>', {class: 'small'}).append(divPlayer2)
        ).append(
            $('<td>', {class: 'big'}).append(silver)
        )
    )
    table.append(
        $('<tr>').append(
            $('<td>', {class: 'big'}).append(place3)
        ).append(
            $('<td>', {class: 'small'}).append(divPlayer3)
        ).append(
            $('<td>', {class: 'big'}).append(bronse)
        )
    )
    $('#grand_final_page').append(table);

}

function openMenu() {
    const body = $('body');
    body.toggleClass('menu-open');

    $(document).on('keydown', function(event) {
        if (event.key === 'Escape' && body.hasClass('menu-open')) {
            body.toggleClass('menu-open');
        }
    });
};


function openConfCleen() {
    const dialog = document.getElementById("confirm_cleen");
    dialog.showModal(); 
    dialog.addEventListener('click', function (e) {
        if (e.target === this) {
            this.close();
        }
    });
}

function closeConfCleen() {
    const dialog = document.getElementById("confirm_cleen");
    dialog.close(); 
}


