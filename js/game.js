'use strict'

/*Step1 – the seed app: 
1. Create a 4x4 gBoard Matrix containing Objects. ✅
2. Set 2 of them to be mines. 💣 ✅
3. Present the board using renderBoard() function. ✅*/

/*Step2 – counting neighbors: 
1. Create setMinesNegsCount() and store the 
minesAroundCount property in each cell ✅    
2. Update the renderBoard() function to also display the 
neighbors count and the mines ✅*/

/*
Step3 – click to reveal: 
1. When clicking a cell, call the onCellClicked() function. ✅
2. Reveal the cell. ✅
*/

/*
Step4 – randomize mines' location: 
1. Add some randomicity for mines locations. ✅
2. After you have this functionality working– it's best to 
comment the code and switch back to static location to help 
you focus during the development phase ✅
*/

/*

*/

const BOMB = '💣'
var gBoard

var gBoardCell = {}
var gLevel = { 
    SIZE: 4, 
    MINES: 2 
}
var gGame = { 
    isOn: false, 
    revealedCount: 0, 
    markedCount: 0, 
    secsPassed: 0 
} 

onInit()



//Called when page loads 
function onInit() {
    gBoard = buildBoard()
    renderBoard(gBoard, '.board-container')

}

//Builds the board, Set some mines, Call setMinesNegsCount(), Return the created board 
function buildBoard(){
    const board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board.push([])
        for (var j = 0; j < gLevel.SIZE; j++) {
            gBoardCell = {
                minesAroundCount: 0, 
                isRevealed: false, 
                isMine: false, 
                isMarked: false,
            }           
            board[i][j] = gBoardCell
        }
    }

    board[0][0].isMine = true
    board[2][2].isMine = true

    //adds bombs in random locations
    // for (let i = 0; i < gLevel.MINES; i++) {
    //     var pos = getRandEmptyLocation(board)        
    //     board[pos.i][pos.j].isMine  = true
    // }
    
    setMinesNegsCount(board)

    return board
}

//Count mines around a cell 
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

//reveals the cell when its clicked
function onCellClicked(elCell, i, j) {
    var pos = { i: i, j: j }
    var className = getClassName(pos)
    var elCellSpan = document.querySelector(`${className} span`)
    elCellSpan.classList.remove('hide')
    gBoard[i][j].isRevealed = true
    
    // if (gBoard[i][j].isRevealed === false) {
    //     elCellSpan.classList.remove('hide')
    //     gBoard[i][j].isRevealed = true
    // }
    // else {
    //     elCellSpan.classList.add('hide')
    //     gBoard[i][j].isRevealed = false
    // }
}

//Called when a cell is right-clicked  
function onCellMarked(elCell,  i, j) {}

//The game ends when all mines are marked, and all the other cells are revealed 
function checkGameOver() {}

//When the user clicks a cell with no mines around, reveal not only that cell, but also its neighbors
//NOTE: start with a basic implementation that only reveals the non-mine 1st degree neighbors 
//BONUS: Do it like the real algorithm (see description at the Bonuses section below)
function expandReveal(board, elCell, i, j) {}