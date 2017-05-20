import Meter from './Meter'
import Stats from './Stats'
import { GameMap, Navigation } from './World'

import Way from './Way'
import { Thing, IThingContainer, ThingContainer } from './ItemDB'
import './Game.scss'
import { Rooms, Room } from './Rooms'
import * as loremIpsum from 'lorem-ipsum'
import { EnterRoomEventHandler } from "./Events";
import * as Prose from "./Prose";
import Parser from "./Parser";

import Util from './Util'

let gameMap = new GameMap()


export const enum CommandFailReason {
    NoTarget,
    UnknownVerb,
    AlreadyTakenItem,
    CannotPutInThing,
    CannotPutInSelf,
    CannotMove,
    CannotOpen,
    CannotClose,
    CannotUseItemAlone,
    CannotTake,
    UnknownThing,
    UnknownDirection
}

export class Game {
    public inventory: IThingContainer = new ThingContainer()
    /**
     * Player name
     */
    public Player: string;
    private currentRoom: Room;

    private roomVisitCount: Map<Room, number> = new Map()

    failCommand(reason: CommandFailReason, thing: string, verb: string = 'do that') {
        this.putText(Util.randomFrom(Prose.FAILURE_QUOTES[reason]).replace('THING', thing)
            .replace('VERB', verb))
    }


    actOnCommand(command: Parser.ParsedCommand) {
        let obj:Thing
        if(command.obj)
            obj = this.getThingFromContainerString(command.obj.obj, command.obj.container)
        let subject:Thing
        if(command.subject)
            subject = this.getThingFromContainerString(command.subject.obj, command.subject.container)
        // These commands require no things
        switch (command.verb) {
            case null:
                this.failCommand(CommandFailReason.UnknownVerb, command.obj.obj, command.verb)
                return;
            case 'look':
                this.lookAtRoom()
                return;
            case 'help':
                this.putText('Yeah, I need help too.')
                return;
        }

        // Special case for commands taking a way
        if (command.verb === 'go') {
            this.navigate(command.way)
            return
        }

        // These commands require a valid thing
        if (!obj)
            return this.failCommand(CommandFailReason.UnknownThing, command.obj.obj)
        switch (command.verb) {
            case 'examine':
                this.lookAt(obj)
                return;
            case 'open':
                this.openThing(obj)
                return;
            case 'move':
                this.moveThing(obj)
                return;
            case 'close':
                this.closeThing(obj)
                return;
            case 'take':
                this.takeThing(obj)
                return;
        }

        if(!subject)
            return this.failCommand(CommandFailReason.UnknownThing, command.subject.obj)

        switch(command.verb){
            case 'place':
                this.putThingInOther(obj, subject)
            return;
        }

    }


    findThingIn(thingName: string, container:IThingContainer): Thing {
        // Currently only one-word things are supported
        let item = (container).find(e => {
            let names = (e.aliases).slice()
            names.push(e.name)
            let ret: boolean = false;
            names.forEach(name => {
                ret = ((name.match(new RegExp('^' + thingName + '$', 'i')) || []).length >= 1) || ret
            });
            return ret
        })
        if(item){
            item.container = container
            return item
        }
        return null
    }

    getThingFromContainerString(obj:string, container:string): Thing {
        let actual: Thing
        if (!obj || !obj)
            return
        if (container === 'ambient'){
            let rt =  this.findThingIn(obj, this.currentRoom.things)
            let it =  this.findThingIn(obj, this.inventory)
            actual = rt || it
        }else if(container==='room'){
            actual = this.findThingIn(obj, this.currentRoom.things)
        }else if(container==='inventory'){
            actual = this.findThingIn(obj,  this.inventory)
        }else{
            let con = this.getThingFromContainerString(container, 'ambient')
            actual = this.findThingIn(obj, con['things'])
        }

        if (!actual) {
            return;
        }
        return actual
    }

    lookAt(item: Thing, fallback?: Thing) {
        if (!item)
            item = fallback
        if (item.onLookAt) {
            this.putText(item.onLookAt());
        }
    }

    lookAtRoom() {
        this.putText(this.currentRoom.onLookAt());
    }
    moveThing(item: Thing) {
        console.log('moving', item)
        let moveresult = item.onMove(this.currentRoom)
        if (moveresult) {
            this.putText(moveresult)
        } else {
            this.failCommand(CommandFailReason.CannotMove, item.name)
        }
    }
    closeThing(item: Thing) {
        let result = item.onClose()
        if (result) {
            this.putText(result)
        } else {
            this.failCommand(CommandFailReason.CannotClose, item.name)
        }
    }
    openThing(item: Thing) {
        let result = item.onOpen()
        if (result) {
            this.putText(result)
        } else {
            this.failCommand(CommandFailReason.CannotOpen, item.name)
        }
    }
    putThingInOther(thing: Thing, other:Thing) {
        if(!(other instanceof ThingContainer))
            this.failCommand(CommandFailReason.CannotPutInThing, thing.name)
        if(thing.container==<ThingContainer>other){
            this.failCommand(CommandFailReason.CannotPutInSelf, thing.name)
        }
        let result = thing.onPutInto(other)
        if (result ) {
            this.putText(result)
            thing.moveToContainer(other)
        } else {
            this.failCommand(CommandFailReason.CannotPutInThing, thing.name)
        }
    }
    takeThing(item: Thing) {
        let container = item.container
        if(container===this.inventory){
            this.failCommand(CommandFailReason.AlreadyTakenItem, item.name)
        }
        if (item.canPickUp) {
            this.putText(item.onTake())
            item.moveToContainer(this.inventory)
        } else {
            this.failCommand(CommandFailReason.CannotTake, item.name, 'take')
        }
    }
    useThing(item: Thing, item2: Thing) {
        if (item.onUse) {
            if (item.useRequiresSubject && !item2) {
                this.failCommand(CommandFailReason.CannotUseItemAlone, item.name, 'use')
            } else {

                this.putText(item.onUse(item2))
            }
        } else {
            this.failCommand(CommandFailReason.CannotTake, item.name, 'use')
        }
    }

    inputHistory: string[] = ['']
    historyIndex = 0;
    constructor() {
        const that = this
        let input = document.getElementById('input') as HTMLInputElement
        let keyevent = (ev: KeyboardEvent) => {
            let str = input.value.toLowerCase().trim()
            if (ev.code == 'Enter') {
                if (Util.isStringEmpty(str))
                    return
                this.putInput(str)
                let com = Parser.parse(str, this)
                input.value = ''
                this.actOnCommand(com)
                let m = document.getElementById('main')
                m.scrollTop = m.scrollHeight
                let mostRecent = this.inputHistory[0]
                if (mostRecent !== str)
                    this.inputHistory.unshift(str)
                this.historyIndex = -1
                this.update()

            } else if (ev.code == 'ArrowUp') {
                this.historyIndex = Math.min(this.historyIndex + 1, this.inputHistory.length - 2)
                input.value = this.inputHistory[this.historyIndex] || ''
            } else if (ev.code == 'ArrowDown') {
                this.historyIndex = Math.max(this.historyIndex - 1, -1)
                input.value = this.inputHistory[this.historyIndex] || ''
            }
        }
        input.addEventListener('keyup', keyevent)

        // Stats['health'].createMeter(document.getElementById('meters'))
        // Stats['energy'].createMeter(document.getElementById('meters'))

        this.enterRoom(gameMap.defaultRoom)

        this.update()
    }

    putInput(text: string) {
        this.rule()
        let main = document.getElementById('main')
        let element = document.createElement('kbd') as HTMLSpanElement
        element.classList.add('inputQuote')
        element.innerText = '> ' + text;
        main.appendChild(element)

    }

    putText(text: string) {
        if (Util.isStringEmpty(text)) {
            return
        }
        let main = document.getElementById('main')
        text = '<p>' + (text.trim() || '').split(/[\r\n\t]+/gm).join('</p><p>') + '</p>'
        main.innerHTML += `${text}`
    }

    rule() {
        document.getElementById('main').innerHTML +=
            `</br><hr/>`
    }

    navigate(way: Way) {
        if (!way) {
            this.failCommand(CommandFailReason.UnknownDirection, way.lowercase)
            return
        }
        let dir = gameMap.getRoomNavigations(this.currentRoom)
            .find(e => e.way === way)
        if (dir === undefined) {
            this.putText(`I cannot go ${way.lowercase} from here.`)
            return;
        }
        if (this.isNavigationAvailable(dir)) {
            this.enterRoom(dir.to)
        }
    }

    enterRoom(room: Room) {
        this.currentRoom = room
        let main = document.getElementById('main')
        main.innerHTML = ''
        let heading = `<h1>${this.currentRoom.name}</h1><br/>`
        main.innerHTML += heading
        let v = this.roomVisitCount.get(this.currentRoom) || 0
        this.roomVisitCount.set(this.currentRoom, v + 1)

        if (this.currentRoom.onEnterRoom)
            this.putText(this.currentRoom.onEnterRoom.call(this.currentRoom,
                { timesEnteredThisRoom: this.roomVisitCount.get(this.currentRoom) }))

    }

    isNavigationAvailable(navigation: Navigation) {
        let avail = false
        if (navigation.available instanceof Function) {
            avail = navigation.available.call(navigation, this)
        } else {
            avail = navigation.available
        }
        return avail
    }

    updateNavigator() {
        let list = document.getElementById('map').getElementsByTagName('ul')[0] as HTMLUListElement
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
        });
    }

    updateInventory() {
        let list = document.getElementById('inventory').getElementsByTagName('ul')[0] as HTMLUListElement
        while (list.hasChildNodes())
            list.removeChild(list.lastChild)
        let items = this.inventory

        items.forEach(item => {
            let roomname = "???"
            let element = document.createElement('li')
            element.innerText = `${item.name}`
            list.appendChild(element)
        });
    }

    update() {
        this.updateNavigator()
        this.updateInventory()
    }
}
