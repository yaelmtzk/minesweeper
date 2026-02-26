'use strict'

var currBoardMinesSum = gLevel.mines

function setMines(pos, board) {
    for (let i = 0; i < gLevel.mines; i++) {
        var location = getRandEmptyLocation(board)

        while (location.i === pos.i && location.j === pos.j) {
            location = getRandEmptyLocation(board)
        }

        board[location.i][location.j].isMine = true
    }
    setMinesNegsCount(board)
    renderBoard(board, '.board-container')
}

function countMinesAroundCell(rowIdx, colIdx, mat) {
    var minesCount = 0

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= mat.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {

            if (i === rowIdx && j === colIdx) continue

            if (j < 0 || j >= mat[i].length) continue

            if (mat[i][j].isMine === true) minesCount++
        }
    }
    return minesCount
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var neighborMinesSum = countMinesAroundCell(i, j, board)
            board[i][j].minesAroundCount = neighborMinesSum
        }
    }
}

function mineExterminatorOn(elBtn) {
    if (gGame.exterminator.amount < 1) return
    if (!gGame.isOn) return

    gGame.exterminator.isOn = true
    exterminateMines()
}

function exterminateMines() {
    var randMinesIdx = []

    for (var i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[i].length; j++) {
            if (gBoard[i][j].isMine === true && gBoard[i][j].isRevealed === false)
                randMinesIdx.push({ i, j })
        }
    }

    if (randMinesIdx.length < 1) return

    //Model
    for (let a = 0; a < 3; a++) {
        const randIdx = getRandomIntInclusive(0, randMinesIdx.length - 1)
        const randMinePos = randMinesIdx[randIdx]

        gBoard[randMinePos.i][randMinePos.j].isMine = false
        randMinesIdx.splice(randIdx, 1)

    }

    currBoardMinesSum -= 3
    //DOM
    const elMinesNumSpan = document.querySelector('.mines-num span')
    elMinesNumSpan.innerHTML = `${currBoardMinesSum} - ${gGame.markedCount}`

    setMinesNegsCount(gBoard)
    //DOM
    renderBoard(gBoard, '.board-container')
    gGame.exterminator.amount--
}
