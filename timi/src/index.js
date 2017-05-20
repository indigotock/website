// import Konsol from './Konsol'
import {
    Game
} from './Game'
import {
    StandardHTMLGameInterface
} from './GameInterface'
import Parser from "./Parser"
import './styles/reset.css'
import './styles/index.css'


let g = new Game()

let intf = new StandardHTMLGameInterface(
    g,
    document.getElementById('input'),
    document.getElementById('map').children[0],
    document.getElementById('inventory').children[0],
    document.getElementById('main'),
)