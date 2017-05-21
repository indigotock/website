import * as Ev from '../Events';
import * as uuid from 'uuid';
import Way from '../Way';
import { CommandResult } from '../Command';
import GameObject, { ItemContainer } from '../items/Item';
import Util from "../Util";
import { GameMap } from "../World";

export default abstract class Room extends GameObject {
    public readonly identifier: string
    public map: GameMap
    public readonly isOpen = true
    get isContainer() {
        return true
    }
    constructor(
        public readonly name: string,
        items: GameObject[] = [],
        public readonly fullName: string = name) {
        super(name, items, fullName)
        this.aliases = ['surroundings', 'environment', 'room']
    }
    enter(ev: Ev.RoomNavigationEvent): CommandResult { return { output: 'You enter the ' + this.fullName.toLocaleLowerCase() + '. ' + this.brief } }
}
