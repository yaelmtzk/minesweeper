'use strict'

function renderBoard(board, selector) {
    const elContainer = document.querySelector(selector)
    var strHTML = '<table><tbody>'

    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            const cell = board[i][j]
            var cellContent

            if (cell.isMine === true) cellContent = `<i class="fa-solid fa-burst" style="color: rgb(237, 73, 86);></i>"`
            else {
                if (cell.minesAroundCount !== 0) cellContent = cell.minesAroundCount
                else cellContent = ''
            }

            const className = `cell cell-${i}-${j}`
            const revealOrHide = cell.isRevealed ? '' : 'class="hide"'
            var spanColor

            if (cell.minesAroundCount === 1) spanColor = 'style="color: rgb(116, 192, 252);"'
            else if (cell.minesAroundCount === 2) spanColor = 'style="color: #3d7563ff;"'
            else if (cell.minesAroundCount >= 3) spanColor = 'style="color: rgb(237, 73, 86);"'
            else spanColor = ''

            strHTML += `<td class="${className} ${cell.isRevealed? 'open-cell': ''}" 
                onclick="onCellClicked(this, ${i}, ${j})" 
                oncontextmenu="onCellMarked(this, ${i}, ${j}); 
                return false"><span ${revealOrHide} ${spanColor}>${cellContent}</span></td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    elContainer.innerHTML = strHTML
}

function getClassName(position) {
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

function startTimer() {
    gStartTime = new Date()
    gTimerInterval = setInterval(updateTimer, 1)
}

function stopTimer() {
    clearInterval(gTimerInterval)
}

function updateTimer() {
    const diff = Date.now() - gStartTime
    const ms = String(diff % 1000)
    const seconds = String((diff - ms) / 1000)

    const elTimer = document.querySelector('.timer span')
    elTimer.innerHTML = `${seconds.padStart(4, '0')}`
}

function changeLevel(levelIdx) {
    gLevel = gLevels[levelIdx]
    resetGame()
}

function toggleDarkMode() {
    const elBody = document.body
    elBody.classList.toggle('dark-mode')
}

function toggleOpenCellClr(elCell) {    
    elCell.classList.toggle('open-cell')
}