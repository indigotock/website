export default class Way {
    public static readonly North = new Way("North")
    public static readonly West = new Way("West")
    public static readonly South = new Way("South")
    public static readonly East = new Way("East")
    public static readonly Up = new Way("Up")
    public static readonly Down = new Way("Down")
    private static stringMap: Map<string, Way>

    public static fromString(inp: string): Way {
        if (!inp)
            return
        console.log('parsing way', inp)
        inp = inp.trim().toLowerCase()
        return Way.stringMap.get(inp)
    }
    private constructor(public readonly value: string) {
        if (!Way.stringMap)
            Way.stringMap = new Map()
        Way.stringMap.set(value.substr(0, 1).toLowerCase(), this)
        Way.stringMap.set(value.toLowerCase(), this)
    }
    get lowercase() {
        return this.value.toLowerCase()
    }
    get short() {
        return this.value.substr(0, 1)
    }
    get opposite(): Way {
        switch (this) {
            case Way.North:
                return Way.South
            case Way.East:
                return Way.West
            case Way.South:
                return Way.North
            case Way.West:
                return Way.East
            case Way.Up:
                return Way.Down
            case Way.Down:
                return Way.Up
        }
    }
}