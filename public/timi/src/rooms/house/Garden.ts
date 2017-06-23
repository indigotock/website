import * as Ev from '../../Events';
import * as uuid from 'uuid';
import Room from '../Room';
import Way from '../../Way';
import { CommandResult } from '../../Command';
import GameObject, { NavigationObject, ItemContainer } from '../../items/Item';

export let fd = new (class FrontDoor extends NavigationObject {
    destinationDesc = 'the house'
    way = Way.South
    targetRoomName = 'Hallway'
    actions = {
        examine(o) {
            return { output: `A dark oak door at the entrance to the house. Two panes of frosted glass are embedded into it, flanking the screwed-on number eight in it's centre. The letterbox is jammed shut.` }
        }
    }
})('door', null, 'front door')

let fdk = new (class FrontDoorKey extends GameObject {
    takeable = true
    brief = 'A standard silver cylinder key. Strangely, it does not match any of the keys to the property you were given.'
    use(other, game) {
        if (!other)
            return { output: 'Use the key on what?', failure: true }
        if (other === fd) {
            this.consume()
            return { output: 'You open the front door with the key, curious as to what the keys you were given do.' }
        }
        return { output: 'Nothing happens.', failure: true }
    }
})('key')

let wb = new (class Bin extends GameObject {
    brief = 'A standard black wheelie bin. The top reads \'Rubbish for disposal only\', and the front sports the logo for Halton Council.'
})('bin', [fdk], 'wheelie bin')

let rm = new (class Garden extends Room {
    brief = 'You are in the front garden of a very ordinary-looking terraced house. All of the room lights, bar one upstairs, are switched on, but all of the curtains are closed.'
})('Garden', [fd, wb])

export default rm