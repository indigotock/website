import Way from '../Way';
import Room from './Room';

let roomNames = ['Garden', 'Hallway']
let rooms: Room[] = []
let nameIdMap = {}


roomNames.forEach(name => {
    let imported = require(`./house/${name}.ts`)
    let rm = imported.default as Room
    rooms.push(rm)
    nameIdMap[rm.name] = rm.identifier
});

export default { rooms, nameIdMap }