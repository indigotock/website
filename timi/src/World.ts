import { Graph, Edge, GraphOptions, Path } from 'graphlib'
import * as uuid from 'uuid'
import { EnterRoomEventHandler } from "./Events";
import {Room,Rooms} from './Rooms'
import { Game } from "./Game";
import Way from './Way'


export function OppositeNavigation(nav: Navigation): Navigation {
    return {
        from: nav.to,
        to: nav.from,
        way: nav.way.opposite,
        available: nav.available
    }
}
export interface Navigation {
    from: Room
    way: Way
    to: Room
    available: boolean | ((n: Navigation, game: Game) => boolean)
}

export class GameMap {
    constructor(){
        this.addRoom(Rooms.Garden)
    }
    _defaultRoom:Room
    get defaultRoom():Room{
        if(this._defaultRoom)
            return this.defaultRoom
        
        return this.map.node(this.map.nodes()[0])
    }
    map: Graph = new Graph({ directed: true, compound: false, multigraph: false })

    addRoom(room: Room) {
        this.map.setNode(room.name, room)
        return room;
    }

    linkRooms(r1: Room, r2: Room, direction: Way,
        available: boolean | (() => boolean) = true,
        availableBackwards: boolean | (() => boolean) = available) {
        let nav: Navigation = {
            from: r1,
            to: r2,
            way: direction,
            available
        }
        let oppositeNav = OppositeNavigation(nav)
        this.map.setEdge(r1.name, r2.name, nav)
        this.map.setEdge(r2.name, r1.name, oppositeNav)
        return this.map.edge(r1.name, r2.name)
    }

    getNavigationForEdge(edge: Edge): Navigation {
        return this.map.edge(edge)
    }

    getRoomNavigations(room: Room): Navigation[] {
        let ret: Navigation[] = []
        let edges = (this.map.outEdges(room.name) || [])
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