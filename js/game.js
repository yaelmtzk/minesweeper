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

/*Step3 – click to reveal: 
1. When clicking a cell, call the onCellClicked() function. ✅
2. Reveal the cell. ✅
*/

/* Step4 – randomize mines' location: 
1. Add some randomicity for mines locations. ✅
2. After you have this functionality working– it's best to 
comment the code and switch back to static location to help 
you focus during the development phase ✅
*/

/* Further Tasks:
The first clicked cell is never a mine ✅
Add support for “LIVES” - The user has 3 LIVES  ✅
When a MINE is clicked: 
• Show an indication to the user that he clicked a mine  ✅
• The LIVES counter decreases ✅
• The cell is being unrevealed  ✅
• The user can mark it and continue playing ✅
*/

/* Add the smiley button - clicking the smiley resets the game  ✅
here are some smiley states: 
● Normal 😃 ✅
● Sad & Dead – LOSE 🤯 (stepped on a mine and have 
no life left)  ✅
● Sunglasses – WIN 😎 ✅
*/

/* Bonus Tasks  
Add support for HINTS 
The user has 3 hints 
When a hint is clicked, it changes its look, example:  
Now, when an unrevealed cell is clicked, the cell and its 
neighbors are revealed for 1.5 seconds, and the clicked hint 
disappears. 
*/

const BOMB = '💣'
const FLAG = '🚩'
const NORMAL ='😃'
const SAD = '🤯'
const WIN = '😎'

var gBoard
var gBoardCell = {}

var gLevels = [
{
    level: 'beginner',
    size: 4, 
    mines: 5,
    lives: 2
},

{
    level: 'intermediate',
    size: 6, 
    mines: 7,
    lives: 3
},

{
    level: 'expert',
    size: 9, 
    mines: 10,
    lives: 5
}
]

var gLevel = gLevels[0]

var gGame = { 
    isOn: false, 
    revealedCount: 0, 
    markedCount: 0, 
    secsPassed: 0
} 
var gCurrentLives = gLevel.lives
var gMarkedMines = 0
var gStartTime
var gTimerInterval


onInit()


//Called when page loads 
function onInit() {
    gBoard = buildBoard()

    const elLivesSpan = document.querySelector('.lives span')
    elLivesSpan.innerText = gLevel.lives

    const elMinesNumSpan = document.querySelector('.mines-num span')
    elMinesNumSpan.innerHTML = gLevel.mines

    setLevelBtns()

    renderBoard(gBoard, '.board-container')
}

//Builds the board and returns it
function buildBoard(){
    const board = []
    for (var i = 0; i < gLevel.size; i++) {
        board.push([])
        for (var j = 0; j < gLevel.size; j++) {
            gBoardCell = {
                minesAroundCount: 0, 
                isRevealed: false, 
                isMine: false, 
                isMarked: false,
            }           
            board[i][j] = gBoardCell
        }
    }

    return board
}

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

//reveals the cell when its clicked
function onCellClicked(elCell, i, j) {

    var pos = { i: i, j: j }
    var currCell = gBoard[i][j]

    var className = getClassName(pos)
    const elCellSpan = document.querySelector(`${className} span`)

    //prevents from revealing a marked cell
    if (currCell.isMarked === true) return
    //prevents from clicking on a revealed cell
    if (currCell.isRevealed === true) return
    //prevents from clicking if there are no more lives left
    if (gCurrentLives === 0) return

    // checks if it is the first click
    // fill the board and turn game on
    if (gGame.isOn === false){
        currCell.isRevealed = true

        gGame.isOn = true
        console.log('game is on')

        setMines(pos, gBoard)
        startTimer()
    }

    //if elCell is a mine
    if(currCell.isMine === true){
        currCell.isRevealed = true
        gGame.revealedCount++ 

        elCell.style.backgroundColor = '#C24641'

        gCurrentLives--
        const elLivesSpan = document.querySelector('.lives span')
        elLivesSpan.innerText = gCurrentLives

        if (gCurrentLives === 0){
            const elPanelButton = document.querySelector('.panel button')
            elPanelButton.innerHTML = SAD
            gGame.isOn = false
            stopTimer()
        }
        
    }

    currCell.isRevealed = true
    gGame.revealedCount++ 

    elCell.style.borderColor = '#77a8a8'
    elCellSpan.classList.remove('hide')

    //checks for victory
    checkGameOver()

}

//Called when a cell is right-clicked  
function onCellMarked(elCell,  i, j) {

    var pos = { i: i, j: j }
    var currCell = gBoard[i][j]
    var className = getClassName(pos)
    const elCellSpan = document.querySelector(`${className} span`)

    //can't flag before first left click
    if (gGame.isOn === false) return

    //unmarks the marked cell, sets back the old content
    //and hides it again
    if (currCell.isMarked === true){
        gGame.markedCount--
        currCell.isMarked = false

        if (currCell.isMine === true){
            elCellSpan.innerHTML = BOMB
            gMarkedMines--
        } 
        else if (currCell.minesAroundCount>0) elCellSpan.innerHTML = currCell.minesAroundCount
        else elCellSpan.innerHTML = ''

        elCellSpan.classList.add('hide')
    }
    else{
        //flags the cell

        if (gGame.markedCount === gLevel.mines) return

        gGame.markedCount++
        currCell.isMarked = true

        if (currCell.isRevealed === true) gGame.revealedCount--
        currCell.isRevealed = false
        
        elCellSpan.innerHTML = FLAG
        elCellSpan.classList.remove('hide')

        if (currCell.isMine === true) gMarkedMines++
    }

        elCell.style.borderColor = '#c5d5c5'
        elCell.style.backgroundColor = '#77a8a8'
}

function setLevelBtns() {
    const elLevelsDiv = document.querySelector('.levels')
    var strHtml = ''
    for (var i = 0; i < gLevels.length; i++) {
        strHtml += `<button class = "${gLevels[i].level}-btn" onclick="changeLevel(${i})">${gLevels[i].level}</button>`
    }
    elLevelsDiv.innerHTML = strHtml
    
}

function resetGame () {
    gGame = { 
        isOn: false, 
        revealedCount: 0, 
        markedCount: 0, 
        secsPassed: 0
    }
    gCurrentLives = gLevel.lives
    gMarkedMines = 0

    stopTimer()

    const elTimer = document.querySelector('.timer span')
    elTimer.innerHTML = '000'

    const elPanelButton = document.querySelector('.panel button')
    elPanelButton.innerHTML = NORMAL

    onInit()
}

//The game ends when all mines are marked, and all the other cells are revealed 
function checkGameOver() {
    // console.log('gMarkedMines', gMarkedMines)
    // console.log('gGame.revealedCount', gGame.revealedCount)
    // console.log(gLevel.SIZE*gLevel.SIZE - gLevel.MINES)
    if (gMarkedMines === gLevel.mines 
        && gGame.revealedCount === gLevel.size*gLevel.size - gLevel.mines){
            const elPanelButton = document.querySelector('.panel button')
            elPanelButton.innerHTML = WIN
            gGame.isOn = false
            stopTimer()
            console.log('victory')
            return
        }
}

//When the user clicks a cell with no mines around, reveal not only that cell, but also its neighbors
//NOTE: start with a basic implementation that only reveals the non-mine 1st degree neighbors 
//BONUS: Do it like the real algorithm (see description at the Bonuses section below)
function expandReveal(board, elCell, i, j) {}

//When the user clicks a cell with no mines around, reveal not only that cell, but also its neighbors
//NOTE: start with a basic implementation that only reveals the non-mine 1st degree neighbors 
//BONUS: Do it like the real algorithm (see description at the Bonuses section below)

function expandReveal(board, elCell, i, j) {}
