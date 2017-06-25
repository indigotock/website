import './Meter.css'

export default class Meter {
    public static readonly iconMap: { [key: string]: string } = {
        energy: "\uf0e7",
        magic: "\uf004"
    }
    bar: HTMLElement;
    container: HTMLElement;
    constructor(public parent: HTMLElement, public kind = 'energy', public max = 100, defaultValue = Math.random() * max) {
        this.container = document.createElement('div')
        this.container.classList.add('bar')
        this.container.classList.add('statColor')

        this.instantiateTemplate()
        parent.appendChild(this.container)
        this.container.classList.add(kind)
        this.value = defaultValue
        this.bar.parentElement.addEventListener('click', e => {
            this.value = Math.random() * this.max
        })
    }

    private instantiateTemplate() {
        let temp = document.getElementById('template_meter') as HTMLTemplateElement
        let instance = document.importNode(temp.content, true);
        this.container.appendChild(instance);
        this.bar = this.container.getElementsByClassName('value')[0] as HTMLElement
    }

    private _value: number;

    set icon(icon: string) {
        this.container.setAttribute('data-icon', icon)
    }

    get value() {
        return Math.trunc(this._value)
    }

    set value(v) {
        this._value = v;

        this.bar.style.width = `${100 * (v / this.max)}%`
        this.container.setAttribute('data-valueString', `${this.value}/${this.max}`)
        this.container.setAttribute('data-value', `${100 * (v / this.max)}`)
    }
}