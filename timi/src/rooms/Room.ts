import * as Ev from '../Events';
import * as uuid from 'uuid';
import Way from '../Way';
import { CommandResult } from '../Command';
import { IItemContainer, ItemContainer } from '../items/Item';


export interface Link {
    room1: string
    room2: string
    way: Way
}

export default class Room {
    public things: IItemContainer = new ItemContainer()
    public readonly identifier: string

    constructor(
        public readonly name: string,
        public readonly fullName: string = name) {
        this.identifier = uuid.v4()
    }
    /**
     * Unique identifier for this room
     */

    examine(): CommandResult {
        return { output: '' }
    }

    enter(ev: Ev.RoomNavigationEvent): CommandResult { return { output: 'You enter ' + this.fullName + '.' } }
    leave(ev: Ev.RoomNavigationEvent): CommandResult { return { output: '' } }
}
