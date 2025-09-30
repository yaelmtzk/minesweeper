'use strict'

var currBoardMinesSum = gLevel.mines

function setMines(pos, board){

    // board[0][0].isMine = true
    // board[2][2].isMine = true

    // adds bombs in random locations
    for (let i = 0; i < gLevel.mines; i++) {
        var location = getRandEmptyLocation(board)
        //sets the location again if equal to 
        //first clicked cell pos
        while(location.i === pos.i && location.j === pos.j){
            location = getRandEmptyLocation(board)
        }
        
        board[location.i][location.j].isMine  = true      
    }
    
    setMinesNegsCount(board)

    renderBoard(board, '.board-container')
}

//Count mines around a single cell 
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

//Sets minesAroundCount for all the cells of the board
function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var neighborMinesSum = countMinesAroundCell(i, j, board)
            board[i][j].minesAroundCount = neighborMinesSum
        }
	}
}

function mineExterminatorOn(elBtn) {
    if (gGame.exterminator.amount <1) return
    if (gGame.isOn === false) return

    elBtn.innerHTML = 'Mines Exterminator <b>Used</b>'
    gGame.exterminator.isOn = true
}

function exterminateMines(rowIdx, colIdx) {

    var randMinesIdx = []
    //adds collects all mines indexes to randMinesIdx array
    for (var i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[i].length; j++) {
            //skips the index of the clicked cell
            //if the cell is a mine diesn't add to randMinesIdx 
            if (i === rowIdx && j === colIdx) continue

            if(gBoard[i][j].isMine === true) randMinesIdx.push({i, j})
        }
    }

    //checks if the list is empty            
    if(randMinesIdx.length<1) return

    //chooses 3 rand mines from array and set isMine to false
    //Model
    for (let a = 0; a < 3; a++) {

        const randIdx = getRandomIntInclusive(0, randMinesIdx.length - 1)
        const randMinePos = randMinesIdx[randIdx]

        gBoard[randMinePos.i][randMinePos.j].isMine = false
        //removes from the array to not sort it twice
        randMinesIdx.splice(randIdx, 1)

    }

    //updates mines num
    currBoardMinesSum -= 3

    //displays the new number of mines on DOM
    const elMinesNumSpan = document.querySelector('.mines-num span')
    elMinesNumSpan.innerHTML = `${currBoardMinesSum} - ${gGame.markedCount}`

    //updates mines around cells count
    setMinesNegsCount(gBoard)

    //renders board again - DOM
    renderBoard(gBoard, '.board-container')
    //decreases from exterminator usage amount
    gGame.exterminator.amount--
   
}
