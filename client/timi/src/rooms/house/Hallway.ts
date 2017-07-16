import * as Ev from '../../Events';
import * as uuid from 'uuid';
import Room from '../Room';
import Way from '../../Way';
import { CommandResult } from '../../Command';
import GameObject, { NavigationObject, ItemContainer } from '../../items/Item';


let fd = new (class FrontDoor extends NavigationObject {
    destinationDesc = 'the front garden'
    way = Way.North
    targetRoomName = 'Garden'
    actions = {
        examine(o) {
            return { output: `An oak door ` }
        }
    }
})('door', null, 'front door')

let rm = new (class Hallway extends Room {
})('Hallway', [fd])

// export default class Room {
//     public things: IItemContainer = new ItemContainer()
//     public readonly identifier: string

//     constructor(
//         public readonly name: string,
//         public readonly fullName: string = name) {
//         this.identifier = uuid.v4()
//     }
//     /**
//      * Unique identifier for this room
//      */

//     examine(): CommandResult {
//         return { output: '' }
//     }

//     enter(ev: Ev.RoomNavigationEvent): CommandResult { return }
//     leave(ev: Ev.RoomNavigationEvent): CommandResult { return }
// }


export default rm