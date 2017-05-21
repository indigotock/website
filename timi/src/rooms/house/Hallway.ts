import * as Ev from '../../Events';
import * as uuid from 'uuid';
import Room, { Link } from '../Room';
import { CommandResult } from '../../Command';
import { ItemContainer } from '../../items/Item';


let rm = new (class Hallway extends Room {
})('Hallway')

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