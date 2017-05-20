import Way from '../Way';
import Room, { Link } from './Room';

let roomNames = ['Garden', 'Hallway']
let rooms = []
let nameIdMap = {}
let links: Link[] = []


roomNames.forEach(name => {
    let imported = require(`./house/${name}.ts`)
    let rm = imported.default as Room
    rooms.push(rm)
    nameIdMap[rm.name] = rm.identifier
    if (imported.links)
        links = links.concat(imported.links)
});



console.log('all rooms = ', rooms, links)

export default { rooms, links, nameIdMap }