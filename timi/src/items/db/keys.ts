import GameObject from '../Item'
import { fd } from '../../rooms/house/Garden'


let keyset = new (class FrontDoorKey extends GameObject {
    takeable = true
    examine() {
        return { output: 'A pair of keys you were given to get into the property. One has a green key cap.' }
    }
    use(other, game) {
        if (!other)
            return { output: 'Use the keys with what?', failure: true }
        if (other === fd) {
            return { output: 'Neither of the keys fit the lock. Strange.' }
        }
        return { output: 'Nothing happens.', failure: true }
    }
})('keys', null, 'set of keys')

export default keyset