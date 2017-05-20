import { CommandResult } from "./Command";
import Util from "./Util";
import { Game } from "./Game";
import { Parser } from "src/Parser";

export abstract class GameInterface {
    constructor(protected readonly game: Game) {
    }
    abstract commandCompleted(result: CommandResult)
}

export class StandardHTMLGameInterface extends GameInterface {
    private inputHistory: string[] = ['']
    private historyIndex: number = 0
    /**
     * Instantiates the standard interface
     * @param game The Game instance to attach to
     * @param input The HTML input element to accept input from 
     * @param roomsList The HTML list element to decorate with adjacent room names
     * @param inventory The HTML list element to display inventory on
     * @param main The HTML block element to output main content to
     */
    constructor(
        game: Game,
        private readonly input: HTMLInputElement,
        private readonly roomsList: HTMLUListElement,
        private readonly inventory: HTMLUListElement,
        private readonly main: HTMLElement,
    ) {
        super(game)
        input.addEventListener('keyup', this.keyDownEvent)
        input.addEventListener('keydown', this.keyUpEvent)
    }

    private keyDownEvent(ev: KeyboardEvent) {
        let str = this.input.value.trim().toLowerCase()
        if (ev.code == 'Enter') {
            if (Util.isStringEmpty(str))
                return
            this.putInput(str)
            let com = Parser.parse(str)
            this.input.value = ''
            let result = this.game.actOnCommand(com)
            let m = document.getElementById('main')
            m.scrollTop = m.scrollHeight
            let mostRecent = this.inputHistory[0]
            if (mostRecent !== str)
                this.inputHistory.unshift(str)
            this.historyIndex = -1
            this.commandCompleted(result)

        } else if (ev.code == 'ArrowUp') {
            this.historyIndex = Math.min(this.historyIndex + 1, this.inputHistory.length - 2)
            this.input.value = this.inputHistory[this.historyIndex] || ''
        } else if (ev.code == 'ArrowDown') {
            this.historyIndex = Math.max(this.historyIndex - 1, -1)
            this.input.value = this.inputHistory[this.historyIndex] || ''
        }
    }

    private putInput(text) {
        this.rule()
        let element = document.createElement('kbd')
        element.classList.add('inputQuote')
        element.innerText = '> ' + text
        this.main.appendChild(element)
    }

    private keyUpEvent(ev: KeyboardEvent) {

    }

    private updateNavigator() {
        let list = document.getElementById('map').getElementsByTagName('ul')[0]
        while (list.hasChildNodes())
            list.removeChild(list.lastChild)
        let rooms = this.game.currentMap.getRoomNavigations(this.game.currentRoom)

        rooms.forEach(navigation => {
            let roomname = navigation.to.name
            let element = document.createElement('li')
            element.innerText = `${navigation.way.value}:\n${roomname}`
            if (this.game.isNavigationAvailable(navigation))
                list.appendChild(element)
        })
    }

    private updateInventory() {
        let list = document.getElementById('inventory').getElementsByTagName('ul')[0]
        while (list.hasChildNodes())
            list.removeChild(list.lastChild)
        let items = this.game.inventory

        items.forEach(item => {
            let roomname = "???"
            let element = document.createElement('li')
            element.innerText = `${item.name}`
            list.appendChild(element)
        })
    }

    private rule() {
        document.getElementById('main').innerHTML +=
            `</br><hr/>`
    }

    commandCompleted(result: CommandResult) {

        this.updateInventory()
        this.updateNavigator()
    }
}
