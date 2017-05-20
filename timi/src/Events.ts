import Room from './rooms/Room'

export interface RoomNavigationEvent {
    from: Room,
    to: Room
}