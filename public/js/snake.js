(function(){
  window.Entity = (function(element, target, parent){
		this.position = new window.Vector(0, 0)
		this.size = new window.Vector(30, 30)
		this.element = element
		this.target = target
		this.parent = parent
		this.unit = 'px'

		this.top = function(){
			return this.position.y - this.size.y/2
		}
		this.left = function(){
			return this.position.x - this.size.x/2
		}
		this.right = function(){
			return this.position.add(this.size.divS(2)).y
		}
		this.bottom = function(){
			return this.position.add(this.size.divS(2)).x
		}

		this.tick = function(){
			var scl = function(){
				var off = ((this.position.sub(this.target(this)).mag())-10)/100
				if(off<=0)
					return 0
				if(Math.pow(3,off)==Infinity && this.element.classList.contains('head')){
					console.log('inf',off)
				//	debugger
				}
				return off*50// Math.pow(3, off)
			}.bind(this)
			const MAX_SPEED = 5
			var move = this.position.sub(this.target(this)).norm().mulS(scl())
			move = move.norm().mulS(MAX_SPEED);
			this.position = this.position.add(move)
			this.element.style.top = this.top()+this.unit
			this.element.style.left = this.left()+this.unit
			this.element.style.width = this.size.x+this.unit
			this.element.style.height = this.size.y+this.unit
//			this.element.style.bottom = this.bottom()+this.unit
//			this.element.style.right = this.right()+this.unit
		}
	})
	window.addEventListener('DOMContentLoaded', function(){
		var container = document.createElement('div')
		function endEntity(){
			if(tail.length == 0)
				return head
			return tail[tail.length - 1]
		}
		function newTail(){
			var tailElement = document.createElement('div')
			tailElement.classList.add('snake')
			tailElement.classList.add('tail')
			container.appendChild(tailElement)
			tail.push(new Entity(tailElement, (e)=>e.parent.position, endEntity()));
		}
		var headElement = document.createElement('div');
		headElement.classList.add('snake')
		headElement.classList.add('head')
		container.appendChild(headElement)
		container.classList.add('snake-container')
		document.body.appendChild(container)
		var mouse = new Vector(0, 0)
		var head = new Entity(headElement, ()=>mouse)
		var tail = []
		newTail()
		newTail()
		newTail()
		newTail()
		newTail()
		newTail()
		newTail()
		newTail()
		newTail()
		newTail()
		newTail()
		newTail()
		newTail()
		newTail()
		newTail()
		newTail()
		newTail()

		newTail()

		window.addEventListener('mousemove', function(ev){
			mouse = new Vector(ev.clientX, ev.clientY);
		})

		var tick = function(){
			head.tick()
			tail.forEach(function(t){
				t.tick()
			})
			requestAnimationFrame(tick);
		}
		requestAnimationFrame(tick);
	})
})()
