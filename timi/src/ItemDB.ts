import { Game } from './Game'
import {Room} from './Rooms'
import IndefiniteArticle from './indefinite_article.js'
import Util from './Util'
export interface IThingContainer{
    add(t:Thing[]|Thing)
    find(p:(this:void, value:Thing)=>boolean):Thing|undefined
    forEach(action:(t:Thing)=>void)  
    has(t:Thing)
    remove(t:Thing)   
    count()
    array():Thing[]
}
export class ThingContainer{
    private set:any
    constructor(){
        this.set = {}
    }
    add(t:Thing[]|Thing){
        if(Array.isArray(t))
            t.forEach(thing => {
                this.set[thing.name] = thing
            });
        else
            this.set[t.name] = t
    }
    find(predicate: (this: void, value: Thing) => boolean): Thing | undefined{
        for (var key in this.set) {
            if (this.set.hasOwnProperty(key)) {
                var thing = this.set[key];
                if(predicate(thing))
                    return thing
            }
        }
        return undefined
    }
    forEach(action:(t:Thing)=>void){
        for (var key in this.set) {
            if (this.set.hasOwnProperty(key)) {
                var thing = this.set[key];
                action(thing)
                
            }
        }
    }
    has(t:Thing){
        return this.set[t.name]!=undefined
    }
    remove(t:Thing){
        delete this.set[t.name]
    }
    count(){
        return this.set.size
    }
    array():Thing[]{
        let ret = []
        this.forEach(item=>{
            console.log('a',item);
            ret.push(item)})
        return ret
    }       
}

export class Thing{
    container?:IThingContainer
    canPickUp?: boolean
    aliases?: string[]
    useRequiresSubject?: boolean
    onUse(thingToUseOn: Thing):string{return null}
    onMove(room:Room):string{return null}
    props:any={}
    name:string
    onClose():string|null{return null}
    onOpen():string|null{return null}
    onPutInto(other:Thing):string|null{return `You put the ${this.name} into the ${other.name}`}
    indefiniteArticle():"a"|"an"{
        return IndefiniteArticle(this.name)
    }
    onTake():string|null{
        return 
    }
    removeFromContainer(){
        this.container.remove(this)
        this.container = null
    }
    moveToContainer(cont:IThingContainer){
        if(this.container){
            this.removeFromContainer()
        }
        this.container = cont
        if(cont)
            cont.add(this)
    }
    onLookAt(){return 'A THING HAS NO LOOK AT FUNCTION'}
}

class ContainerThing extends Thing implements IThingContainer{
    private things:ThingContainer
    public isOpen=false
    get isClosed(){
        return !this.isOpen
    }
    constructor(){
        super()
        this.things = new ThingContainer()
        console.log(this.makeThings(), this.things)
        this.things.add(this.makeThings())
    }
    makeThings():Thing[]{return []}
    add(t:Thing[]|Thing){
        this.things.add(t)
    }
    find(predicate: (this: void, value: Thing) => boolean): Thing | undefined{
        return this.things.find(predicate)
    }
    forEach(action:(t:Thing)=>void){
        this.things.forEach(action)
    }
    has(t:Thing){
        return this.things.has(t)
    }
    remove(t:Thing){
        return this.things.remove(t)
    }
    count(){
        return this.things.count()
    }
    array(){
        return this.things.array()
    }
    _onOpen(){
        if(this.isOpen)
            return false
        this.isOpen = true
        return true
    }
    _onClose(){
        if(this.isClosed)
            return false
        this.isOpen = false
        return true
    }
    onLookAt(){
        if(this.isClosed)return ""
        if(this.count()===0)return "\nIt is empty."

        console.log('len', this.things, this.count())
        let itemnames = []
        this.things.forEach(e=>{
            console.log('x')
            let n = e.name
            itemnames.push( `${IndefiniteArticle(e.name)} ${e.name}`)
        })
        let listSentence = 'it contains ' + (Util.toTextualList(itemnames)||"nothing")
        
        return '\n'+Util.toSentenceCase(listSentence) + '.'

    }
}

export module ItemDB {
    export let Doormat = new (class _ extends Thing {
        name = 'doormat'
        aliases = ['mat']
        onMove(room:Room){
            let retstr = ''
            let keyinroom = !ItemDB.FrontDoorKey.props.takenFromDoormat
            if(this.props.moved){
                if(keyinroom){
                    retstr = 'You put the doormat back in place, concealing the key.'
                    ItemDB.FrontDoorKey.moveToContainer(null)
                }else{
                    retstr = 'You put the doormat back in place.'
                }
            }else{
                if(keyinroom){
                    retstr = 'You move the doormat to the side, revealing a strange silver key.'
                    ItemDB.FrontDoorKey.moveToContainer(room.things)
                }else{
                    retstr = 'You move the doormat to the side.'
                }
            }
            this.props.moved = !(this.props.moved===true)
            return retstr
        }
        onLookAt() {
            return "A brown doormat, made from the finest woven coir, probably. It reads 'Welcome'."
        }
    })()
    export let FrontDoor = new (class _ extends Thing {
        name = 'door'
        aliases = []
        onLookAt() {
            return "A dark oak door at the entrance to the house. Two panes of frosted glass are embedded into it, flanking the screwed-on number eight in it's centre. The letterbox is jammed shut."
        }
    })()
    export let FrontDoorKey = new (class _ extends Thing {
        name = 'key'
        aliases = []
        canPickUp = true
        useRequiresSubject=true
        onTake(){
            this.props.takenFromDoormat = true
            return super.onTake()
        }
        onUse(other: Thing) {
            return null
        }
        onLookAt() {
            return "A silver cylinder key found under the front doormat. Strangely, it doesn't match any of the keys you have for the property."
        }
    })()
    export let WheelieBin = new(class _ extends ContainerThing{
        name='bin'
        aliases = ['trashcan','trash','dumpster']
        onLookAt(){
            return 'A standard black wheelie bin. The top reads \'Rubbish for disposal only\', and the front sports the logo for Halton Council.'+super.onLookAt()
        }
        onOpen(){
            if(super._onOpen())
                return 'You flip the lid of the bin, revealing it to be empty.'
        }
        onClose(){
            if(super._onClose())
                return 'You close the wheelie bin.'
        }
    })()
}
export default ItemDB;