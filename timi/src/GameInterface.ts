import Util from './Util';
import { CommandResult } from './Command';
import { Game } from './Game';
import { Parser } from './Parser';

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
     * @param navigation The HTML list element to decorate with adjacent room names
     * @param inventory The HTML list element to display inventory on
     * @param main The HTML block element to output main content to
     */
    constructor(
        game: Game,
        private readonly input: HTMLInputElement,
        private readonly navigation: HTMLUListElement,
        private readonly inventory: HTMLUListElement,
        private readonly main: HTMLElement,
    ) {
        super(game)
        input.addEventListener('keydown', this.keyDownEvent.bind(this))
        main.addEventListener('click', (e) => {
            input.focus()
        })
        this.commandCompleted(game.start())
        this.updateInventory()
        this.updateNavigator()
    }

    private keyDownEvent(ev: KeyboardEvent) {
        let str = this.input.value.trim().toLowerCase()
        if (ev.code == 'Enter' || ev.code == 'NumpadEnter') {
            this.input.value = ''
            if (Util.isStringEmpty(str))
                return
            if (str === 'clear' || str === 'cls') {
                this.main.innerHTML = ''
                return
            }
            this.putInput(str)
            let com = Parser.parse(str)
            let result = this.game.actOnCommand(com)
            if (com.verb === 'go' && !result.failure)
                this.main.innerHTML = ''
            let mostRecent = this.inputHistory[0]
            if (mostRecent !== str)
                this.inputHistory.unshift(str)
            this.historyIndex = -1
            this.commandCompleted(result)
            this.main.scrollTop = this.main.scrollHeight
            return
        } else if (ev.code == 'ArrowUp') {
            this.historyIndex = Math.min(this.historyIndex + 1, this.inputHistory.length - 2)
            this.input.value = this.inputHistory[this.historyIndex] || ''
            this.input.selectionEnd = this.input.value.length - 1
            this.input.selectionStart = this.input.value.length
            ev.preventDefault()
        } else if (ev.code == 'ArrowDown') {
            this.historyIndex = Math.max(this.historyIndex - 1, -1)
            this.input.value = this.inputHistory[this.historyIndex] || ''
            this.input.selectionEnd = this.input.value.length - 1
            this.input.selectionStart = this.input.value.length - 1
        }
    }

    private putInput(text) {
        this.rule()
        let element = document.createElement('kbd')
        element.classList.add('inputQuote')
        element.innerText = '> ' + text
        this.main.appendChild(element)
        this.main.innerHTML += '</br>'
    }

    private updateNavigator() {
        while (this.navigation.hasChildNodes())
            this.navigation.removeChild(this.navigation.lastChild)
        let rooms = this.game.currentMap.getRoomNavigations(this.game.currentRoom)

        rooms.forEach(navigation => {
            let roomname = navigation.to.name
            if (!this.game.hasVisitedRoom(navigation.to))
                roomname = '???'
            let element = document.createElement('li')
            element.innerText = `${navigation.way.value}:\n${roomname}`
            if (this.game.isNavigationAvailable(navigation))
                this.navigation.appendChild(element)
        })
    }

    private updateInventory() {
        while (this.inventory.hasChildNodes())
            this.inventory.removeChild(this.inventory.lastChild)
        let items = this.game.inventory

        items.forEach(item => {
            let roomname = "???"
            let element = document.createElement('li')
            element.innerText = `${item.name}`
            this.inventory.appendChild(element)
        })
    }

    private rule() {
        this.main.innerHTML +=
            `</br><hr/>`
    }

    commandCompleted(result: CommandResult) {
        let outputHTML = ''
        if (result.failure) {
            outputHTML += Util.toParagraphs(result.output)
            this.main.innerHTML += outputHTML
        } else {
            if (result.outputHeading)
                outputHTML += `<h1>${result.outputHeading}</h1>`
            if (result.outputSubheading)
                outputHTML += `<h2>${result.outputSubheading}</h2>`

            outputHTML += Util.toParagraphs(result.output)
            this.main.innerHTML += outputHTML
        }

        this.updateInventory()
        this.updateNavigator()
    }
}
