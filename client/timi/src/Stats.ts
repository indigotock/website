import Meter from './Meter'

class Stat {
    private callBacks: ((s: Stat) => void)[] = [];
    private _value: number;

    addUpdateHandler(callback: (s: Stat) => void) {
        this.callBacks.push(callback)
    }

    private callUpdateCallbacks() {
        for (let i = 0; i < this.callBacks.length; i++) {
            this.callBacks[i].call(undefined)
        }
    }

    constructor(public readonly name: string,
        public readonly colour: string,
        public readonly icon: string,
        public max: number,
        _value: number) {
        this.value = _value;
    }

    get value() {
        return this._value
    }
    set value(v) {
        this._value = v
        this.callUpdateCallbacks()
    }

    createMeter(parent: HTMLElement): Meter {
        let m = new Meter(parent, this.name, this.max, this.value)
        m.icon = this.icon
        this.addUpdateHandler((s) => {
            m.value = this.value
            m.max = this.max
        })
        return m;
    }
}

const styles = document.head.appendChild(document.createElement('style'))

const Stats: { [key: string]: Stat } = {}

function addStyle(stat: Stat) {
    const template = `\n.statColor.${stat.name}{ color: ${stat.colour} }`
    styles.innerHTML += template
}

function makeStat(name: string, colour: string, icon: string, max: number) {
    Stats[name] = new Stat(name, colour, icon, max, max);
    addStyle(Stats[name])
}

makeStat('health', 'firebrick', '\uf004', 100)
makeStat('energy', 'goldenrod', '\uf0e7', 50)
// makeStat('magic', 'steelblue', '\uf005', 10)

export default Stats;