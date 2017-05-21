import * as Ev from '../Events';
import * as uuid from 'uuid';
import Way from '../Way';
import { CommandResult } from '../Command';
import GameObject, { ItemContainer } from '../items/Item';
import Util from "../Util";
import { GameMap } from "../World";


export interface Link {
    room1: string
    room2: string
    way: Way
    description: string
    reverseDescription: string
}

export default abstract class Room extends GameObject {
    public readonly identifier: string
    public map: GameMap
    constructor(
        public readonly name: string,
        items: GameObject[] = [],
        public readonly fullName: string = name) {
        super(name, items, fullName)
        this.aliases = ['surroundings', 'environment', 'room']
    }
    examine() {
        let ret = super.examine()
        let navs = this.map.getRoomNavigations(this)
        let fillers = ['takes you to', 'is', 'leads towards']
        let parts = navs.map(e => `${e.way.toString()} ${Util.randomFrom(fillers)} ${e.desc}`)
        ret.output += '\n' + Util.toSentenceCase(Util.toTextualList(parts)) + '.'
        return ret
    }
    enter(ev: Ev.RoomNavigationEvent): CommandResult { return { output: 'You enter ' + this.fullName + '.' } }
    leave(ev: Ev.RoomNavigationEvent): CommandResult { return { output: '' } }
}
