import * as uuid from 'uuid'
import * as Ev from "../Events";
import { CommandResult } from "../Command";

export class Room {
    constructor(
        public readonly name: string,
        public readonly fullName: string = name) {
        this.identifier = uuid.v4()
    }
    /**
     * Unique identifier for this room
     */
    public readonly identifier: string

    examine(): CommandResult {
        return { output: '' }
    }

    enter(ev: Ev.RoomNavigationEvent) { }
    leave(ev: Ev.RoomNavigationEvent) { }
}

export default Room