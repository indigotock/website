import Meter from './Meter'
import Stats from './Stats'
import { GameMap, Navigation } from './World'

import Way from './Way'
import './styles/Game.scss'
import Room from './rooms/Room'
import GameObject, { ItemAction, ItemContainer } from './items/Item'
import * as loremIpsum from 'lorem-ipsum'
import { RoomNavigationEvent } from "./Events";
import * as Prose from "./Prose";
import Parser from "./Parser";

import Util from './Util'
import { CommandResult } from "./Command";


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
    public inventory: GameObject = new (class Inventory extends GameObject {
        isOpen = true

    })('inventory', [GameObject.getItemFromDb('keys')], 'backpack'['bag'])
    currentRoom: Room;
    currentMap = new GameMap()
    globalActions: { [action: string]: ItemAction } = {
        take: function (other, game) {
            console.log('taking', this, other, game)
            if (!this.takeable)
                return { output: 'You can\' take that.', failure: true }

            if (this.container === game.inventory)
                return { output: 'You already have the ' + this.name, failure: true }
            let ft = game.currentRoom == this.container ? '' : ' from the ' + this.container.name
            this.moveToContainer(game.inventory)
            return { output: 'You take the ' + this.name.toLowerCase() + ft + '.' }
        },
        place: function (other, game) {
            console.log('putting', this, other, game)
            if (!this.takeable)
                return { output: 'You can\' do that.', failure: true }

            if (!other.isContainer)
                return { output: `You can't put anything in the ${other.name}`, failure: true }

            if (!other.isOpen) {
                return { output: `The ${other.name} is closed.`, failure: true }
            }

            this.moveToContainer(other)
            return { output: `You put the ${this.name} in the ${other.name}.` }
        }
    }

    private roomVisitCount: Map<Room, number> = new Map()


    actOnCommand(command: Parser.ParsedCommand): CommandResult {
        let obj: GameObject
        let ret: CommandResult
        if (command.obj)
            obj = this.getThingFromContainerString(command.obj.obj, command.obj.container)
        let subject: GameObject
        if (command.subject)
            subject = this.getThingFromContainerString(command.subject.obj, command.subject.container)


        console.debug('Running command', command)
        // Special verbs
        if (command.verb == 'go') {
            let pWay = Way.fromString(command.way)
            if (pWay)
                ret = this.navigate(pWay)
            else
                ret = {
                    failure: true,
                    output: 'Which direction should I go?'
                }
        } else if (command.verb === 'help') {
            ret = { output: 'Examine your surroundings closely.' }
        }


        if (obj) {
            let func: ItemAction = this.globalActions[command.verb] || obj.actions[command.verb] || obj[command.verb]
            if (func)
                ret = func.call(obj, subject, this)
        } else if (!command.obj) {
            obj = this.currentRoom
            let func: ItemAction = this.globalActions[command.verb] || obj.actions[command.verb] || obj[command.verb]
            if (func)
                ret = func.call(obj, subject, this)
        }

        //todo: replace old crappy switch with ref to item action array
        return ret || { output: 'What did you want to do?', failure: true }
    }

    hasVisitedRoom(room: Room) {
        return this.roomVisitCount.get(room) && this.roomVisitCount.get(room) >= 0
    }


    findThingIn(thingName: string, container: GameObject): GameObject {
        // Currently only one-word things are supported
        if (!container)
            return null
        if (!container.isContainer)
            return null
        if (!container.isOpen)
            return null
        //Try to match room
        let roomNames = this.currentRoom.aliases.slice()
        roomNames.push(this.currentRoom.name.toLowerCase())
        roomNames.push(this.currentRoom.fullName.toLowerCase())
        if (roomNames.indexOf(thingName) !== -1)
            return this.currentRoom

        let item = container.containedItems.find(e => {
            let names = (e.aliases).slice()
            names.push(e.fullName)
            names.push(e.name)
            names = names.map(e => e.toLowerCase())
            return names.indexOf(thingName) !== -1
        })
        if (item) {
            item.container = container
            return item
        }
        return null
    }

    getThingFromContainerString(obj: string, container: string): GameObject {
        let actual: GameObject
        if (!obj)
            return
        if (container === 'ambient') {
            let potentialThings = this.currentRoom.containedItems.array().map(e =>
                this.findThingIn(obj, e)).filter(e => e != null) || []
            let rt = this.findThingIn(obj, this.currentRoom)
            let it = this.findThingIn(obj, this.inventory)
            actual = potentialThings[0] || rt || it
            console.log('matched', obj, potentialThings, rt, it, actual)
        } else if (container === 'room') {
            actual = this.findThingIn(obj, this.currentRoom)
        } else if (container === 'inventory') {
            actual = this.findThingIn(obj, this.inventory)
        } else {
            let con = this.getThingFromContainerString(container, 'ambient')
            actual = this.findThingIn(obj, con)
        }

        if (!actual) {
            return;
        }
        return actual
    }

    start(): CommandResult {
        return this.enterRoom(this.currentMap.defaultRoom)
    }

    navigate(way: Way) {
        if (!way) {
            // this.failCommand(CommandFailReason.UnknownDirection, way.lowercase)
            return
        }
        let dir = this.currentMap.getRoomNavigations(this.currentRoom)
            .find(e => e.way === way)
        if (dir === undefined) {
            // this.putText(``)
            return {
                output: `I cannot go ${way.lowercase} from here.`,
                failure: true
            };
        }
        if (this.isNavigationAvailable(dir)) {
            return this.enterRoom(dir.to)
        }
    }

    enterRoom(room: Room) {
        let v = this.roomVisitCount.get(this.currentRoom) || 0
        this.roomVisitCount.set(this.currentRoom, v + 1)
        let navEvent: RoomNavigationEvent = {
            from: this.currentRoom,
            to: room,
            timedEnteredNextRoom: this.roomVisitCount.get(this.currentRoom)
        }
        this.currentRoom = room
        let res = this.currentRoom.enter(navEvent)

        res.outputHeading = this.currentRoom.fullName

        return res
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
}
