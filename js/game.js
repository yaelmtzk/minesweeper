'use strict'

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
    lockBtns(true)
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
    var pos = { i, j }
    var currCell = gBoard[i][j]

    var className = getClassName(pos)
    const elCellSpan = document.querySelector(`${className} span`)

    if (currCell.isMarked) return

    if (currCell.isRevealed) return

    if (gCurrentLives === 0) return

    if (!gGame.isOn) {
        lockBtns(false)
        unlockHints()
        currCell.isRevealed = true
        gGame.isOn = true
        console.log('game is on')
        setMines(pos, gBoard)
        startTimer()
    }

    if (gGame.megaHint.isOn) {
        elCell.style.backgroundColor = 'rgb(245, 186, 187)'
        if (gGame.megaHint.cellsPos.length === 0) {
            gGame.megaHint.cellsPos.push({ i, j })
        } else if (gGame.megaHint.cellsPos.length === 1) {
            gGame.megaHint.cellsPos.push({ i, j })
            showMegaHint()
            setTimeout(() => hideMegaHint(), 2000)
            gGame.megaHint.isOn = false
        }
        return
    }

    if (currCell.isMine) {
        gCurrentLives--
        const elLivesSpan = document.querySelector('.lives span')
        elLivesSpan.innerText = gCurrentLives

        if (gCurrentLives === 0) {
            const elPanelButton = document.querySelector('.panel button')
            elPanelButton.innerHTML = `<i class="fa-solid fa-heart-crack"></i>`
            gGame.isOn = false
            stopTimer()
        }
    }

    currCell.isRevealed = true
    gGame.revealedCount++
    toggleOpenCellClr(elCell)
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
    var pos = { i, j }
    var currCell = gBoard[i][j]
    var className = getClassName(pos)
    const elCellSpan = document.querySelector(`${className} span`)

    if (!gGame.isOn) return

    if (currCell.isMarked) {
        gGame.markedCount--
        currCell.isMarked = false

        if (currCell.isMine) {
            elCellSpan.innerHTML = `<i class="fa-solid fa-burst" style="color: rgb(237, 73, 86);></i>`
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

        if (currCell.isRevealed) {
            toggleOpenCellClr(elCell)
            gGame.revealedCount--
        }

        currCell.isRevealed = false

        elCellSpan.innerHTML = `<i class="fa-regular fa-flag" style="color: rgb(237, 73, 86);"></i>`
        elCellSpan.classList.remove('hide')

        if (currCell.isMine) gMarkedMines++

        const elMinesNumSpan = document.querySelector('.mines-num span')
        elMinesNumSpan.innerHTML = `${currBoardMinesSum}-${gGame.markedCount}`
    }
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
    elTimer.innerHTML = '0000'

    const elPanelButton = document.querySelector('.panel button')
    elPanelButton.innerHTML = `<i class="fa-regular fa-face-grin-beam"></i>`

    onInit()
}

function checkGameOver() {
    if (gMarkedMines === currBoardMinesSum
        && gGame.revealedCount === gLevel.size * gLevel.size - currBoardMinesSum) {

        const elPanelButton = document.querySelector('.panel button')
        elPanelButton.innerHTML = `<i class="fa-solid fa-trophy"></i>`

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
    if (!gGame.isOn) return

    const elSafeClickBtn = document.querySelector('.safe-click')
    const elSafeClickBtnSpan = elSafeClickBtn.querySelector('span')

    if (gSafeClick <= 0) return

    const safeCells = []

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (!gBoard[i][j].isMine && !gBoard[i][j].isRevealed) {
                safeCells.push({ i, j })
            }
        }
    }

    if (safeCells.length === 0) return

    gSafeClick--

    const safeCellPos = safeCells[getRandomIntInclusive(0, safeCells.length - 1)]
    const elSafeCell = document.querySelector(getClassName(safeCellPos))
    elSafeCell.style.backgroundColor = 'rgb(245, 186, 187)'
    elSafeClickBtnSpan.innerHTML = gSafeClick

    if (gSafeClick === 0) {
        elSafeClickBtn.disabled = true
    }

    setTimeout(() => {
        elSafeCell.style.backgroundColor = ''
    }, 1000)
}

function expandReveal(mat, rowIdx, colIdx) {
    if (mat[rowIdx][colIdx].isMine) return

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
            if (!mat[i][j].isRevealed) {
                mat[i][j].isRevealed = true
                gGame.revealedCount++
            }
            else {
                continue
            }

            //DOM
            const neighborCell = document.querySelector(`${getClassName({ i: i, j: j })}`)
            const neighborCellSpan = document.querySelector(`${getClassName({ i: i, j: j })} span`)
            neighborCellSpan.classList.remove('hide')
            toggleOpenCellClr(neighborCell)

            for (var a = 0; a < neighbors.length; a++) {
                expandReveal(mat, neighbors[a].i, neighbors[a].j)
            }
        }
    }
}

function lockBtns(value) {
    const elMegaHinBtn = document.querySelector('.mega-hint')
    const elSafeClickBtn = document.querySelector('.safe-click')
    const elExterminatorBtn = document.querySelector('.mine-exterminator')
    elMegaHinBtn.disabled = value
    elSafeClickBtn.disabled = value
    elExterminatorBtn.disabled = value
}

