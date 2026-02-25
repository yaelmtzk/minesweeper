'use strict'

var gHints = []

function setHints() {
    for (var i = 0; i < gLevel.hints; i++) {
        gHints.push({
            hintNum: i + 1,
            used: false
        })
    }
    const elHintsDiv = document.querySelector('.hints')
    var strHtml = ''

    for (var i = 0; i < gHints.length; i++) {
        strHtml += `<button
                        class = "hint-btn"
                        title="Hint"
                        onclick="giveHint(this, ${i})">
                        <i class="fa-solid fa-lightbulb" style="color: rgb(116, 192, 252);"></i>
                    </button>`
    }
    elHintsDiv.innerHTML = strHtml
}

function giveHint(elBtn, i) {
    const elIcon = elBtn.querySelector('i')

    if (gHints[i].used === true) {
        return
    }
    if (gGame.isOn === false) {
        return
    }
    elIcon.style.color = 'rgb(255, 212, 59)'
    gHints[i].used = true
    gGame.isHint = true
}

function showHint(location) {
    for (var i = location.i - 1; i <= location.i + 1; i++) {

        if (i < 0 || i >= gBoard.length) continue

        for (var j = location.j - 1; j <= location.j + 1; j++) {
            if (i === location.i && j === location.j) continue
            if (j < 0 || j >= gBoard[i].length) continue

            const elCell = document.querySelector(`${getClassName({ i: i, j: j })}`)
            elCell.style.backgroundColor = 'rgb(116, 192, 252)'

            const neighborCellSpan = document.querySelector(`${getClassName({ i: i, j: j })} span`)
            neighborCellSpan.classList.remove('hide')
        }
    }
}

function hideHint(location) {
    for (var i = location.i - 1; i <= location.i + 1; i++) {

        if (i < 0 || i >= gBoard.length) continue

        for (var j = location.j - 1; j <= location.j + 1; j++) {
            if (i === location.i && j === location.j) continue

            if (j < 0 || j >= gBoard[i].length) continue

            const elCell = document.querySelector(`${getClassName({ i: i, j: j })}`)
            

            const neighborCellSpan = document.querySelector(`${getClassName({ i: i, j: j })} span`)

            if (!gBoard[i][j].isRevealed && !gBoard[i][j].isMarked) {
                neighborCellSpan.classList.add('hide')
                elCell.style.backgroundColor = 'var(--cell-bg)'
            } else elCell.style.backgroundColor = 'var(--open-cell-bg)'

            
        }
        const elIcon = document.querySelector('.hint-btn i')
        elIcon.style.color = 'rgb(116, 192, 252)'
    }
}

function megaHint(elBtn) {
    if (gGame.isOn === false) return
    if (gGame.megaHint.cellsPos.length > 2) return

    gGame.megaHint.isOn = true
}

function showMegaHint() {
    if (gGame.isOn === false) return
    if (gGame.megaHint.chosenCellsNum > 2) return

    const firstCellPos = gGame.megaHint.cellsPos[0]
    const secCellPos = gGame.megaHint.cellsPos[1]

    if (firstCellPos.i > secCellPos.i) {
        const elFirstCell = document.querySelector(`${getClassName({ i: firstCellPos.i, j: firstCellPos.j })}`)
        elFirstCell.style.backgroundColor = 'rgb(86, 143, 135)'
    }

    for (var i = firstCellPos.i; i <= secCellPos.i; i++) {
        for (var j = firstCellPos.j; j <= secCellPos.j; j++) {
            const elCell = document.querySelector(`${getClassName({ i: i, j: j })}`)
            elCell.style.backgroundColor = 'rgb(255, 245, 242)'

            const elCellSpan = document.querySelector(`${getClassName({ i: i, j: j })} span`)
            elCellSpan.classList.remove('hide')
        }
    }
}

function hideMegaHint() {
    const firstCellPos = gGame.megaHint.cellsPos[0]
    const secCellPos = gGame.megaHint.cellsPos[1]

    for (var i = firstCellPos.i; i <= secCellPos.i; i++) {
        for (var j = firstCellPos.j; j <= secCellPos.j; j++) {
            const elCell = document.querySelector(`${getClassName({ i: i, j: j })}`)
            elCell.style.backgroundColor = 'rgb(86, 143, 135)'

            const elCellSpan = document.querySelector(`${getClassName({ i: i, j: j })} span`)
            elCellSpan.classList.add('hide')
        }
    }
}
