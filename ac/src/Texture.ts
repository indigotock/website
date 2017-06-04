import * as THREE from 'three'
declare var require: any


module Texture {
    function textureKindToString(tk: TextureKind) {
        switch (tk) {
            case TextureKind.Characters:
                return 'characters'
            case TextureKind.Items:
                return 'items'
            case TextureKind.Particles:
                return 'particles'
            case TextureKind.Tiles:
                return 'tiles'
        }
    }
    export enum TextureKind {
        Characters = 0, Items = 1, Particles = 2, Tiles = 3
    }

    interface SpriteSec {
        name: string
        x: number, y: number, w: number, h: number
    }

    function parseAtlas(name: string): SpriteSec[] {
        let ret = []
        let src = require(`./textures/spritesheet_tiles.xml`)

        let p = new DOMParser()
        let doc = p.parseFromString(src, 'text/xml');


        return ret
    }

    function initialise() {
        console.log('initialising textures')
        let sets = ['tiles']
        // let sets = ['characters', 'items', 'particles', 'tiles']
        sets.forEach(element => {
            let parsedSprites = parseAtlas(element)
        });
    }

    initialise()

    let textures: Map<TextureKind, Map<string, THREE.Texture>> = new Map()


    export function get(tk: TextureKind, name: string) {
        let tm = textures.get(tk)
        if (!tm)
            return undefined
        return tm.get(name) || undefined
    }
}

export default Texture