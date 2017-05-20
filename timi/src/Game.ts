import Meter from './Meter'
import Stats from './Stats'
import { GameMap, Navigation } from './World'

import Way from './Way'
import './styles/Game.scss'
import Room from './rooms/Room'
import Item, { ItemContainer, IItemContainer } from './items/Item'
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
    public inventory: IItemContainer = new ItemContainer()
    /**
     * Player name
     */
    public Player: string;
    currentRoom: Room;
    currentMap = new GameMap()

    private roomVisitCount: Map<Room, number> = new Map()


    actOnCommand(command: Parser.ParsedCommand): CommandResult {
        let obj: Item
        if (command.obj)
            obj = this.getThingFromContainerString(command.obj.obj, command.obj.container)
        let subject: Item
        if (command.subject)
            subject = this.getThingFromContainerString(command.subject.obj, command.subject.container)

        //todo: replace old crappy switch with ref to item action array
        return null
    }


    findThingIn(thingName: string, container: IItemContainer): Item {
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
        if (item) {
            item.container = container
            return item
        }
        return null
    }

    getThingFromContainerString(obj: string, container: string): Item {
        let actual: Item
        if (!obj || !obj)
            return
        if (container === 'ambient') {
            let rt = this.findThingIn(obj, this.currentRoom.things)
            let it = this.findThingIn(obj, this.inventory)
            actual = rt || it
        } else if (container === 'room') {
            actual = this.findThingIn(obj, this.currentRoom.things)
        } else if (container === 'inventory') {
            actual = this.findThingIn(obj, this.inventory)
        } else {
            let con = this.getThingFromContainerString(container, 'ambient')
            actual = this.findThingIn(obj, con['things'])
        }

        if (!actual) {
            return;
        }
        return actual
    }

    constructor() {

        // Stats['health'].createMeter(document.getElementById('meters'))
        // Stats['energy'].createMeter(document.getElementById('meters'))

        this.enterRoom(this.currentMap.defaultRoom)

    }

    navigate(way: Way) {
        if (!way) {
            // this.failCommand(CommandFailReason.UnknownDirection, way.lowercase)
            return
        }
        let dir = this.currentMap.getRoomNavigations(this.currentRoom)
            .find(e => e.way === way)
        if (dir === undefined) {
            // this.putText(`I cannot go ${way.lowercase} from here.`)
            return;
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

        return this.currentRoom.enter(navEvent)
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
