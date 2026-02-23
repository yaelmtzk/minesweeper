'use strict'

const HAPPY = 'happy'
const LOST = 'lost'
const WIN = 'win'

var gBoard
var gBoardCell = {}

var gLevels = [
    {
        level: 'beginner',
        size: 4,
        mines: 5,
        lives: 2,
        hints: 1
    },

    {
        level: 'intermediate',
        size: 6,
        mines: 7,
        lives: 3,
        hints: 2
    },

    {
        level: 'expert',
        size: 9,
        mines: 10,
        lives: 5,
        hints: 3
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
        amount: 1,
        isOn: false
    },
    megaHint: {
        isOn: false,
        cellsPos: []
    }
}
var gCurrentLives = gLevel.lives
var gMarkedMines = 0
var gBestScore = 99999

var gStartTime
var gTimerInterval

var gSafeClick = 3

for (let i = 0; i < gLevels.length; i++) {
    var levelName = gLevels[i].level
    localStorage.setItem(`${levelName}BestScore`, `${gBestScore}`)
}


function onInit() {

    gBoard = buildBoard()

    const elLivesSpan = document.querySelector('.lives span')
    elLivesSpan.innerText = gLevel.lives

    const elMinesNumSpan = document.querySelector('.mines-num span')
    elMinesNumSpan.innerHTML = `${currBoardMinesSum} - 0`

    const elBestScoreSpan = document.querySelector('.best-score span')

    elBestScoreSpan.innerText = localStorage.getItem(`${gLevel.level}BestScore`)

    setLevelBtns()

    setHints()

    renderBoard(gBoard, '.board-container')
}

function buildBoard() {
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

function onCellClicked(elCell, i, j) {

    var pos = { i: i, j: j }
    var currCell = gBoard[i][j]

    var className = getClassName(pos)
    const elCellSpan = document.querySelector(`${className} span`)

    if (currCell.isMarked === true) return

    if (currCell.isRevealed === true) return

    if (gCurrentLives === 0) return

    if (gGame.isOn === false) {
        currCell.isRevealed = true

        gGame.isOn = true
        console.log('game is on')

        setMines(pos, gBoard)
        startTimer()
    }

    if (gGame.megaHint.isOn === true) {

        if (gGame.megaHint.cellsPos.length === 0) {
            gGame.megaHint.cellsPos.push({ i: i, j: j })
            elCell.style.backgroundColor = 'rgb(245, 186, 187)'
        } else if (gGame.megaHint.cellsPos.length === 1) {
            gGame.megaHint.cellsPos.push({ i: i, j: j })

            showMegaHint()
            setTimeout(() => hideMegaHint(), 2000)
            gGame.megaHint.isOn = false
        }
        return
    }

    if (currCell.isMine === true) {

        elCell.style.backgroundColor = 'rgb(255, 130, 130)'

        gCurrentLives--
        const elLivesSpan = document.querySelector('.lives span')
        elLivesSpan.innerText = gCurrentLives

        if (gCurrentLives === 0) {
            const elPanelButton = document.querySelector('.panel button')
            elPanelButton.innerHTML = `<img class="lost icon" src="./assets/img/lost.png" alt="lost-icon">`
            gGame.isOn = false
            stopTimer()
        }
    }

    currCell.isRevealed = true
    gGame.revealedCount++

    elCell.style.borderColor = 'rgb(86, 143, 135)'
    elCellSpan.classList.remove('hide')

    expandReveal(gBoard, i, j)

    if (gGame.isHint === true) {
        showHint(pos)
        setTimeout(() => hideHint(pos), 1500)
        gGame.isHint = false
    }
    checkGameOver()
}

function onCellMarked(elCell, i, j) {
    var pos = { i: i, j: j }
    var currCell = gBoard[i][j]
    var className = getClassName(pos)
    const elCellSpan = document.querySelector(`${className} span`)

    if (gGame.isOn === false) return

    if (currCell.isMarked === true) {
        gGame.markedCount--
        currCell.isMarked = false

        if (currCell.isMine === true) {
            elCellSpan.innerHTML = `<img class="mine icon" src="./assets/img/mine.png" alt="mine png">`
            gMarkedMines--
        }
        else if (currCell.minesAroundCount > 0) elCellSpan.innerHTML = currCell.minesAroundCount
        else elCellSpan.innerHTML = ''

        elCellSpan.classList.add('hide')

        const elMinesNumSpan = document.querySelector('.mines-num span')
        elMinesNumSpan.innerHTML = `${currBoardMinesSum}-${gGame.markedCount}`
    } else {

        if (gGame.markedCount === currBoardMinesSum) return

        gGame.markedCount++
        currCell.isMarked = true

        if (currCell.isRevealed === true) gGame.revealedCount--
        currCell.isRevealed = false

        elCellSpan.innerHTML = `<img class="icon flag" src="assets/img/flag.png" alt="flag png">`
        elCellSpan.classList.remove('hide')

        if (currCell.isMine === true) gMarkedMines++

        const elMinesNumSpan = document.querySelector('.mines-num span')
        elMinesNumSpan.innerHTML = `${currBoardMinesSum}-${gGame.markedCount}`
    }

    elCell.style.borderColor = 'rgb(162, 213, 198)'
    elCell.style.backgroundColor = 'rgb(86, 143, 135)'

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

function resetGame() {
    gGame = {
        isOn: false,
        revealedCount: 0,
        markedCount: 0,
        secsPassed: 0,
        isHint: false,
        exterminator: {
            amount: 1,
            isOn: false
        },
        megaHint: {
            isOn: false,
            chosenCellsNum: 0,
            cellsPos: []
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
    elPanelButton.innerHTML = `<img class="happy icon" src="./assets/img/happy.png" alt="happy png">`

    const elExterminatorBtn = document.querySelector('.mine-exterminator')
    elExterminatorBtn.innerHTML = 'Mines Exterminator Unused'

    const elMegaHintBtn = document.querySelector('.mega-hint')
    elMegaHintBtn.innerHTML = '1 Mega Hint Available: Unused'

    onInit()
}

function checkGameOver() {
    if (gMarkedMines === currBoardMinesSum
        && gGame.revealedCount === gLevel.size * gLevel.size - currBoardMinesSum) {

        const elPanelButton = document.querySelector('.panel button')
        elPanelButton.innerHTML = `<img class="win icon" src="./img/${WIN}.png" alt="${WIN} png">`

        gGame.isOn = false

        setsBestScore()

        stopTimer()

        console.log('victory')
        return
    }
}

function setsBestScore() {
    const elTimerSpan = document.querySelector('.timer span')
    var gScore = +elTimerSpan.innerHTML
    gBestScore = +localStorage.getItem(`${gLevel.level}BestScore`)

    if (gScore < gBestScore) {
        localStorage.setItem(`${gLevel.level}BestScore`, `${gScore}`)
        const elBestScoreSpan = document.querySelector('.best-score span')
        elBestScoreSpan.innerText = localStorage.getItem(`${gLevel.level}BestScore`)
    }
}

function showSafeClick() {
    if (gGame.isOn === false) return

    if (gSafeClick > 0 && gSafeClick <= 3) {
        const safeCells = []
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[i].length; j++) {

                if (gBoard[i][j].isMine === false && gBoard[i][j].isRevealed === false) {
                    safeCells.push({ i, j })
                }
            }
        }

        if (safeCells.length < 1) return

        const safeCellIdx = safeCells[getRandomIntInclusive(0, safeCells.length - 1)]
        const elSafeCell = document.querySelector(`${getClassName(safeCellIdx)}`)
        elSafeCell.style.backgroundColor = 'rgb(245, 186, 187)'

        gSafeClick--

        const elSafeClickBtnSpan = document.querySelector('.safe-click span')
        elSafeClickBtnSpan.innerHTML = gSafeClick

        setTimeout(() => elSafeCell.style.backgroundColor = 'rgb(86, 143, 135)', 1500)
    }
}

function expandReveal(mat, rowIdx, colIdx) {

    if (mat[rowIdx][colIdx].isMine === true) return

    var neighborMinesSum = countMinesAroundCell(rowIdx, colIdx, mat)

    if (neighborMinesSum > 0) return

    var neighbors = []

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {

        if (i < 0 || i >= mat.length) continue

        for (var j = colIdx - 1; j <= colIdx + 1; j++) {

            if (i === rowIdx && j === colIdx) continue
            if (j < 0 || j >= mat[i].length) continue

            neighbors.push({ i: i, j: j })

            //Model
            if (mat[i][j].isRevealed === false) {
                mat[i][j].isRevealed = true
                gGame.revealedCount++
            }
            else {
                continue
            }

            //DOM
            const neighborCellSpan = document.querySelector(`${getClassName({ i: i, j: j })} span`)
            neighborCellSpan.classList.remove('hide')

            const elNeighborCell = document.querySelector(`${getClassName({ i: i, j: j })}`)
            elNeighborCell.style.borderColor = 'rgb(86, 143, 135)'

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

    if (isDark) {
        darkLightBtnSpan.innerHTML = 'Light'
    } else {
        darkLightBtnSpan.innerHTML = 'Dark'
    }
}
