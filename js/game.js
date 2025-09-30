'use strict'

//const FLAG = 'flag'
const HAPPY ='happy'
const LOST = 'lost'
const WIN = 'win'

var gBoard
var gBoardCell = {}

var gLevels = [
{
    level: 'beginner',
    size: 4, 
    mines: 5, //5
    lives: 2, 
    hints: 1
},

{
    level: 'intermediate',
    size: 6, 
    mines: 7, //7
    lives: 3,
    hints:2
},

{
    level: 'expert',
    size: 9, 
    mines: 10, //10
    lives: 5,
    hints:3
}
]
var gLevel = gLevels[0]

var gGame = { 
    isOn: false, 
    revealedCount: 0, 
    markedCount: 0, 
    secsPassed: 0,
    isHint: false,
    exterminator: {
        amount:1,
        isOn: false
    }
} 
var gCurrentLives = gLevel.lives
var gMarkedMines = 0
var gBestScore = 99999

var gStartTime
var gTimerInterval

var gSafeClick = 3

//sets best score local variable for all levels
for (let i = 0; i < gLevels.length; i++) {
    var levelName = gLevels[i].level
    localStorage.setItem(`${levelName}BestScore`, `${gBestScore}`)
}


//Called when page loads 
function onInit() {

    gBoard = buildBoard()

    //displays lives left on DOM
    const elLivesSpan = document.querySelector('.lives span')
    elLivesSpan.innerText = gLevel.lives

    //displays the number of mines on DOM
    const elMinesNumSpan = document.querySelector('.mines-num span')
    elMinesNumSpan.innerHTML = `${currBoardMinesSum} - 0`

    //displays the best score at that level on DOM
    const elBestScoreSpan = document.querySelector('.best-score span')

    console.log(localStorage.getItem(`${gLevel.level}BestScore`));
    
    elBestScoreSpan.innerText = localStorage.getItem(`${gLevel.level}BestScore`)

    //displays level btns
    setLevelBtns()

    //displays hint btns
    setHints()

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

        elCell.style.backgroundColor = 'rgb(255, 130, 130)'

        gCurrentLives--
        const elLivesSpan = document.querySelector('.lives span')
        elLivesSpan.innerText = gCurrentLives

        if (gCurrentLives === 0){
            const elPanelButton = document.querySelector('.panel button')
            elPanelButton.innerHTML = `<img class="lost icon" src="./img/lost.png" alt="lost png">`
            gGame.isOn = false
            stopTimer()
        }
        
    }

    currCell.isRevealed = true
    gGame.revealedCount++ 

    elCell.style.borderColor = 'rgb(86, 143, 135)' 
    elCellSpan.classList.remove('hide')

    //displays no mine neighbors
    expandReveal(gBoard, i, j)

    //if the hint btn was pressed
    if (gGame.isHint === true){
        showHint(pos)
        setTimeout(() => hideHint(pos), 1500)
        gGame.isHint = false
    }

    //if the mine exterminator btn was pressed
    if (gGame.exterminator.isOn === true){
        exterminateMines(i, j)
        gGame.exterminator.isOn = false
    }

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
            elCellSpan.innerHTML = `<img class="mine icon" src="./img/mine.png" alt="mine png">`
            gMarkedMines--
        } 
        else if (currCell.minesAroundCount>0) elCellSpan.innerHTML = currCell.minesAroundCount
        else elCellSpan.innerHTML = ''

        elCellSpan.classList.add('hide')
        //updates mines panel
        const elMinesNumSpan = document.querySelector('.mines-num span')
        elMinesNumSpan.innerHTML = `${currBoardMinesSum}-${gGame.markedCount}`
    }
    else{
        //flags the cell
        //checks if the num of put flags is equal to mines num
        //if it is it stops the function
        if (gGame.markedCount === currBoardMinesSum) return

        gGame.markedCount++
        currCell.isMarked = true

        if (currCell.isRevealed === true) gGame.revealedCount--
        currCell.isRevealed = false
        
        elCellSpan.innerHTML =  `<img class="icon flag" src="img/flag.png" alt="flag png">`
        elCellSpan.classList.remove('hide')

        if (currCell.isMine === true) gMarkedMines++

        const elMinesNumSpan = document.querySelector('.mines-num span')
        elMinesNumSpan.innerHTML = `${currBoardMinesSum}-${gGame.markedCount}`
    }

    elCell.style.borderColor = 'rgb(162, 213, 198)'
    elCell.style.backgroundColor = 'rgb(86, 143, 135)'

    //checks if user won
    checkGameOver()
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
        secsPassed: 0,
        isHint: false,
        exterminator: {
            amount:1,
            isOn: false
        }
    } 
    gCurrentLives = gLevel.lives
    gMarkedMines = 0
    gHints = []
    gSafeClick = 3
    currBoardMinesSum = gLevel.mines

    stopTimer()

    const elSafeClickBtnSpan = document.querySelector('.safe-click span')
    elSafeClickBtnSpan.innerHTML = gSafeClick

    const elTimer = document.querySelector('.timer span')
    elTimer.innerHTML = '000'

    const elPanelButton = document.querySelector('.panel button')
    elPanelButton.innerHTML = `<img class="happy icon" src="./img/happy.png" alt="happy png">`

    const elExterminatorBtn = document.querySelector('.mine-exterminator')
    elExterminatorBtn.innerHTML = 'Mines Exterminator Unused'

    onInit()
}

//The game ends when all mines are marked, and all the other cells are revealed 
function checkGameOver() {   
    if (gMarkedMines === currBoardMinesSum
        && gGame.revealedCount === gLevel.size*gLevel.size - currBoardMinesSum){
            
            const elPanelButton = document.querySelector('.panel button')
            elPanelButton.innerHTML = `<img class="win icon" src="./img/${WIN}.png" alt="${WIN} png">`
            
            gGame.isOn = false
            
            //saves if it is the best score at that level
            setsBestScore()

            stopTimer()
            
            console.log('victory')
            return
        }
}

function setsBestScore() {

    const elTimerSpan = document.querySelector('.timer span')
    //saves current score in variable
    var gScore = +elTimerSpan.innerHTML
    //extracts local variable best score value
    gBestScore = +localStorage.getItem(`${gLevel.level}BestScore`)
    //if time taken to wi smaller than best score:
    if (gScore<gBestScore){
        //saves new best score in the local variable
        localStorage.setItem(`${gLevel.level}BestScore`, `${gScore}`)
        //updates best score in the DOM
        const elBestScoreSpan = document.querySelector('.best-score span')
        elBestScoreSpan.innerText = localStorage.getItem(`${gLevel.level}BestScore`)
    }    
}

function showSafeClick() {
    //can't be used before first click
    if (gGame.isOn === false) return

    //rand choice of mine free unrevealed cell
    if (gSafeClick>0 && gSafeClick<=3) {
        const safeCells = []
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[i].length; j++) {

                if (gBoard[i][j].isMine === false && gBoard[i][j].isRevealed === false) {                    
                    safeCells.push({ i, j })
                }
            }
        }    

        if(safeCells.length<1) return

        const safeCellIdx = safeCells[getRandomIntInclusive(0, safeCells.length - 1)]
                
        const elSafeCell =  document.querySelector(`${getClassName(safeCellIdx)}`)
        //change its background color
        elSafeCell.style.backgroundColor = 'rgb(245, 186, 187)'
        //updates safe clicks num - DOM
        gSafeClick--
        //updates button - Model
        const elSafeClickBtnSpan = document.querySelector('.safe-click span')
        elSafeClickBtnSpan.innerHTML = gSafeClick
        //changes background color back after 1.5 sec
        setTimeout(() => elSafeCell.style.backgroundColor = 'rgb(86, 143, 135)', 1500)

    }
}

//check if there are neighbor mines; if not reveal the neighbor cells and their non mine neighbors
function expandReveal(mat, rowIdx, colIdx){

    //doesn't expand if the cell is a mine 
    if (mat[rowIdx][colIdx].isMine === true) return

    var neighborMinesSum = countMinesAroundCell(rowIdx, colIdx, mat)

    //doesn't expand if has mine neighbors
    if (neighborMinesSum >0) return

    var neighbors = []

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {

        if (i < 0 || i >= mat.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {

            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= mat[i].length) continue
            
            //saves cell location in array
            neighbors.push({i:i, j:j})
            // console.log({i:i, j:j})

            //Model
            if (mat[i][j].isRevealed === false){
                mat[i][j].isRevealed = true
                gGame.revealedCount++
            }
            else{
                continue
            }
            
            //DOM
            const neighborCellSpan = document.querySelector(`${getClassName({i:i, j:j})} span`)
            neighborCellSpan.classList.remove('hide')

            const elNeighborCell =  document.querySelector(`${getClassName({i:i, j:j})}`)
            elNeighborCell.style.borderColor = 'rgb(86, 143, 135)'

            //reveal non mine neighbors of neighbor cells
            for (var a = 0; a < neighbors.length; a++) {
                expandReveal(mat, neighbors[a].i, neighbors[a].j)
            }
        }
    }
}

function toggleScreenColorMode() {

    const elBody = document.body

    elBody.classList.toggle('dark-mode')

    const isDark = elBody.classList.contains('dark-mode')

    const darkLightBtnSpan = document.querySelector('.dark-light-mode-btn span')
    if (isDark){
        darkLightBtnSpan.innerHTML = 'Light'
    }
    else{
        darkLightBtnSpan.innerHTML = 'Dark'
    }  
}
