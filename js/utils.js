'use strict'

//Render the board as a <table> to the page
function renderBoard(board, selector) {

    var strHTML = '<table><tbody>'
    for (var i = 0; i < board.length; i++) {

        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {

            const cell = board[i][j]
            var cellContent

            if (cell.isMine === true) cellContent = BOMB
            else{
                if (cell.minesAroundCount !== 0) cellContent = cell.minesAroundCount
                else cellContent = ''
            } 

            const className = `cell cell-${i}-${j}`

            strHTML += `<td class="${className}" onclick="onCellClicked(this, ${i}, ${j})"><span class = "hide">${cellContent}</span></td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}

// location is an object like this - { i: 2, j: 7 }
function renderCell(location, value) {
    // Select the elCell and set the value
    const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)
    elCell.innerHTML = value
}

function getClassName(position) { // { i: 2, j: 7 } ==> .cell-2-7
    return `.cell-${position.i}-${position.j}`
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandEmptyLocation(board) {

    const emptyCells = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (board[i][j].isMine === false) {
                emptyCells.push({ i, j })
            }
        }
    }    

    const randIdx = getRandomIntInclusive(0, emptyCells.length - 1)
    return emptyCells[randIdx]
}

