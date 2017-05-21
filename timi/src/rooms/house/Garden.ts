import * as Ev from '../../Events';
import * as uuid from 'uuid';
import Room, { Link } from '../Room';
import Way from '../../Way';
import { CommandResult } from '../../Command';
import GameObject, { ItemContainer } from '../../items/Item';

let fd = new (class FrontDoor extends GameObject {
    actions = {
        examine(o) {
            return { output: `A dark oak door at the entrance to the house. Two panes of frosted glass are embedded into it, flanking the screwed-on number eight in it's centre. The letterbox is jammed shut.` }
        }
    }
})('door', null, 'front door')

let fdk = new (class FrontDoorKey extends GameObject {
    takeable = true
    actions = {
        examine(i) {
            return { output: 'The key is pretty.' }
        }
    }
})('key')

let rm = new (class Garden extends Room {
    enter(ev: Ev.RoomNavigationEvent): CommandResult {
        return {
            output: 'You are in the front garden of a very ordinary-looking terraced house.'
        }
    }
})('Garden', [fd])

export let links: Link[] = [{
    room1: rm.name, room2: 'Hallway', way: Way.South,
    description: 'a door leading into the house',
    reverseDescription: 'the door to the front garden'
}]


export default rm