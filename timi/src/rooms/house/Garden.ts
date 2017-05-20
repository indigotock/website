import * as Ev from '../../Events';
import * as uuid from 'uuid';
import Room, { Link } from '../Room';
import Way from '../../Way';
import { CommandResult } from '../../Command';
import { IItemContainer, ItemContainer } from '../../items/Item';



let rm = new (class Garden extends Room {

})('Garden')

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

export let links: Link[] = [{ room1: rm.name, room2: 'Hallway', way: Way.South }]


export default rm