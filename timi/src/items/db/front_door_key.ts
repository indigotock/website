import Item from '../Item'


let rm = new (class FrontDoorKey extends Item {
    actions = {
        look(i, i2) {
            return { output: 'THe key is pretty.' }
        }
    }
})('Key')

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

//     enter(ev: Ev.RoomNavigationEvent): CommandResult { return {} }
//     leave(ev: Ev.RoomNavigationEvent): CommandResult { return {} }
// }



export default rm