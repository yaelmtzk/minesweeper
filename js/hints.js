'use strict'

const HINT = '💡'
var gHints = []

//sets hints obj list (Model) and buttons (DOM)
function setHints() {
    for (var i = 0; i < gLevel.hints; i++) {
        gHints.push({
            hintNum: i+1,
            used: false
        })
    }

    const elHintsDiv = document.querySelector('.hints')
    var strHtml = ''

    for (var i = 0; i < gHints.length; i++) {
        strHtml += `<button class = "hint-btn" onclick="giveHint(this, ${i})">${HINT}</button>`
    }
    elHintsDiv.innerHTML = strHtml
}

//changes hint button color 
function giveHint(elBtn, i) {
    if (gHints[i].used === true) return
    if (gGame.isOn === false) return

    elBtn.style.backgroundColor = '#f18973'
    gHints[i].used = true

    gGame.isHint = true
    
    console.log('hint')
    
}

function showHint(location) {
    for (var i = location.i - 1; i <= location.i + 1; i++) {

        if (i < 0 || i >= gBoard.length) continue

        for (var j = location.j - 1; j <= location.j + 1; j++) {

            if (i === location.i && j === location.j) continue
            if (j < 0 || j >= gBoard[i].length) continue
            
            const elCell =  document.querySelector(`${getClassName({i:i, j:j})}`)
            elCell.style.backgroundColor = 'beige'

            const neighborCellSpan = document.querySelector(`${getClassName({i:i, j:j})} span`)
            
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
            
            const elCell =  document.querySelector(`${getClassName({i:i, j:j})}`)
            elCell.style.backgroundColor = '#77a8a8'

            const neighborCellSpan = document.querySelector(`${getClassName({i:i, j:j})} span`)

            if (gBoard[i][j].isRevealed !== true && gBoard[i][j].isMarked !== true){
                neighborCellSpan.classList.add('hide')
            }
        }
    }
}
