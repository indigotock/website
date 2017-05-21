import * as Ev from '../../Events';
import * as uuid from 'uuid';
import Room from '../Room';
import Way from '../../Way';
import { CommandResult } from '../../Command';
import GameObject, { NavigationObject, ItemContainer } from '../../items/Item';

let fd = new (class FrontDoor extends NavigationObject {
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
    actions = {
        examine(i) {
            return { output: 'The key is pretty.' }
        }
    }
})('key')

let rm = new (class Garden extends Room {
    brief = 'You are in the front garden of a very ordinary-looking terraced house. All of the room lights, bar one upstairs, are switched on, but all of the curtains are closed.'
})('Garden', [fd,])

export default rm