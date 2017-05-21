import * as uuid from 'uuid';
import House from './rooms/House';
import Room from './rooms/Room';
import Way from './Way';
import {
    Edge,
    Graph,
    GraphOptions,
    Path
} from 'graphlib';
import { Game } from './Game';
import { RoomNavigationEvent } from './Events';
import { NavigationObject } from "./items/Item";


export function OppositeNavigation(nav: Navigation): Navigation {
    return {
        from: nav.to,
        to: nav.from,
        way: nav.way.opposite,
        available: nav.available,
        desc: ''
    }
}
export interface Navigation {
    from: Room
    way: Way
    to: Room
    available: boolean | ((n: Navigation, game: Game) => boolean)
    desc: string
}

export class GameMap {
    constructor() {
        this.addRoom(House.rooms)
        House.rooms.forEach(r => r.containedItems.array()
            .filter(e => e instanceof NavigationObject).forEach((e: NavigationObject) => {
                let rm = this.getRoomFromName(e.targetRoomName)
                this.linkRooms(r, rm, e.way, e.brief)
            }))
    }
    _defaultRoom: Room
    get defaultRoom(): Room {
        if (this._defaultRoom)
            return this.defaultRoom

        return this.map.node(this.map.nodes()[0])
    }
    map: Graph = new Graph({ directed: true, compound: false, multigraph: false })

    getRoomFromName(name: String) {
        return this.map.node(this.map.nodes().find(e => this.map.node(e).name === name))
    }

    addRoom(room: Room | Room[]) {
        if (Array.isArray(room)) {
            room.forEach(e => {
                this.addRoom(e)
            })
        } else {
            this.map.setNode(room.identifier, room)
            room.map = this
        }


    }

    linkRooms(r1: Room, r2: Room, direction: Way,
        desc: string,
        available: boolean | (() => boolean) = true,
        availableBackwards: boolean | (() => boolean) = available) {
        let nav: Navigation = {
            from: r1,
            to: r2,
            way: direction,
            available,
            desc: desc,
        }
        // let oppositeNav = OppositeNavigation(nav)
        this.map.setEdge(r1.identifier, r2.identifier, nav)
        // this.map.setEdge(r2.identifier, r1.identifier, oppositeNav)
        return this.map.edge(r1.identifier, r2.identifier)
    }

    getNavigationForEdge(edge: Edge): Navigation {
        return this.map.edge(edge)
    }

    getRoomNavigations(room: Room): Navigation[] {
        let ret: Navigation[] = []
        let edges = (this.map.outEdges(room.identifier) || [])
        edges.forEach(edge => {
            let nav = this.getNavigationForEdge(edge)
            ret.push(nav)
        })
        return ret
    }

    getRoom(room: string): Room {
        return this.map.node(room)
    }
}