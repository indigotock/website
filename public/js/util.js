   window.Vector = (function(x, y){
        this.x = x || 0
        this.y = y || 0
        var arith = [
            {o: 'add', f: (a,b)=>a+b},
            {o: 'mul', f: (a,b)=>a*b},
            {o: 'div', f: (a,b)=>a/b},
            {o: 'sub', f: (a,b)=>a-b}
        ]
        arith.forEach(d=>{
            this[d.o] = other =>
                new window.Vector(
                    d.f(other.x, this.x),
                    d.f(other.y, this.y))

            this[d.o+'X'] = oX =>
                new window.Vector(
                    d.f(this.x, oX), this.y)
            
            this[d.o+'Y'] = oY =>
                new window.Vector(
                    this.x, d.f(this.y, oY))

            this[d.o+'S'] = oS =>
                new window.Vector(
                    d.f(this.x, oS), d.f(this.y, oS))
        })
				this.mag = function(){
					return Math.sqrt(this.x*this.x+this.y*this.y)
				}.bind(this)
				this.norm = function(){
					var m = this.mag()
					if(m == 0)
						return this.mul(1)
					return this.divS(m)
				}
        this.clamp = function(x1,y1,x2,y2){
            this.x = Math.max(this.x, x1)
            this.x = Math.min(this.x, x2)
            this.y = Math.max(this.y, y1)
            this.y = Math.min(this.y, y2)
            return this
        }.bind(this)

    })
