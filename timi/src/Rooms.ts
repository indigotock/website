import {
    EnterRoomEventHandler,
    LeaveRoomEventHandler
} from "./Events";
import { Game } from "./Game";
import ItemDB, { Thing, IThingContainer,ThingContainer } from "./ItemDB";


export interface Room {
    name: string
    things: IThingContainer
    onLookAt: () => string
    onEnterRoom?: ((e: EnterRoomEventHandler) => void)
    [others: string]: any
}

abstract class RoomBase implements Room {
    readonly name: string
    things: IThingContainer = new ThingContainer()
    timesVisited: number
    timesLeft: number
    constructor(name: string) {
        this.name = name
            this.things.add(this.makeThings())
    }
    makeThings(): Thing[] { return [] }
    abstract onLookAt(): string
    onEnterRoom(e: EnterRoomEventHandler): string {
        return
    }
    onLeaveRoom(e: LeaveRoomEventHandler) {

    }
}
