import {
    WorldRenderer
} from "./WorldRenderer"
import {
    Biomes
} from "./Biome"

import World from "./World"

const world = new World(600, [Biomes.Ocean, Biomes.Mountains])

let wr = new WorldRenderer(world, document.getElementById('canvasContainer'), {})