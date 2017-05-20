// import Konsol from './Konsol'
import {
    Game
} from './Game'
import Parser from "./Parser"
import './styles/reset.css'
import './styles/index.css'


let g = new Game()

let input = document.getElementById('input')

function putText(text) {
    if (Util.isStringEmpty(text)) {
        return
    }
    let main = document.getElementById('main')
    main.innerHTML += `${text}`
}

function rule() {
    document.getElementById('main').innerHTML +=
        `</br><hr/>`
}

function putInput(text) {
    rule()
    let main = document.getElementById('main')
    let element = document.createElement('kbd')
    element.classList.add('inputQuote')
    element.innerText = '> ' + text
    main.appendChild(element)
}

function processResult(result) {
    putText(result.output || '')
}


let inputHistory = ['']
let historyIndex = 0
input.addEventListener('keyup', (ev) => {
    let str = input.value.toLowerCase().trim()
    if (ev.code == 'Enter') {
        if (Util.isStringEmpty(str))
            return
        g.putInput(str)
        let com = Parser.parse(str, this)
        input.value = ''
        let result = g.actOnCommand(com)
        let m = document.getElementById('main')
        m.scrollTop = m.scrollHeight
        let mostRecent = inputHistory[0]
        if (mostRecent !== str)
            inputHistory.unshift(str)
        historyIndex = -1
        update()

    } else if (ev.code == 'ArrowUp') {
        historyIndex = Math.min(historyIndex + 1, inputHistory.length - 2)
        input.value = inputHistory[historyIndex] || ''
    } else if (ev.code == 'ArrowDown') {
        historyIndex = Math.max(historyIndex - 1, -1)
        input.value = inputHistory[historyIndex] || ''
    }
})

function updateNavigator() {
    let list = document.getElementById('map').getElementsByTagName('ul')[0]
    while (list.hasChildNodes())
        list.removeChild(list.lastChild)
    let rooms = gameMap.getRoomNavigations(this.currentRoom)

    rooms.forEach(navigation => {
        let roomname = "???"
        if (this.roomVisitCount.get(navigation.to) >= 1)
            roomname = navigation.to.name
        let element = document.createElement('li')
        element.innerText = `${navigation.way.value}:\n${roomname}`
        if (this.isNavigationAvailable(navigation))
            list.appendChild(element)
    })
}

function updateInventory() {
    let list = document.getElementById('inventory').getElementsByTagName('ul')[0]
    while (list.hasChildNodes())
        list.removeChild(list.lastChild)
    let items = this.inventory

    items.forEach(item => {
        let roomname = "???"
        let element = document.createElement('li')
        element.innerText = `${item.name}`
        list.appendChild(element)
    })
}

function update() {
    this.updateNavigator()
    this.updateInventory()
}