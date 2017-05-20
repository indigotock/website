import * as Ev from '../Events';
import * as uuid from 'uuid';
import Way from '../Way';
import { CommandResult } from '../Command';
import Item, { ItemContainer } from '../items/Item';


export interface Link {
    room1: string
    room2: string
    way: Way
}

export default class Room {
    public things: ItemContainer = new ItemContainer()
    public readonly identifier: string

    constructor(
        public readonly name: string,
        items: Item[] = [],
        public readonly fullName: string = name) {
        this.identifier = uuid.v4()
        this.things.add(items)
    }

    examine(): CommandResult {
        return { output: `The ${this.name} is empty.` }
    }

    enter(ev: Ev.RoomNavigationEvent): CommandResult { return { output: 'You enter ' + this.fullName + '.' } }
    leave(ev: Ev.RoomNavigationEvent): CommandResult { return { output: '' } }
}
