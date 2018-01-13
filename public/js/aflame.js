(function(){
      var mouseX = 0
      var mouseY = 0

      window.addEventListener('DOMContentLoaded', function(loadEvent){
        function animate(){
          var x = Date.now()
          var wave = Math.sin(x*51*(Math.sin(x)/2))
                      /8
                      +(
                         Math.cos(x*8)/8
                       )
          var first = 30-((window.innerWidth-mouseX)/120) * (5+wave)
          var second = 70+((window.innerHeight-mouseY)/120) * (5+wave)
          document.querySelector('.lg-first').setAttribute('offset', first+'%')
          document.querySelector('.lg-second').setAttribute('offset', second+'%')
          requestAnimationFrame(animate)
        }
        requestAnimationFrame(animate)
      })
      window.addEventListener('mousemove', function(ev){
      	mouseX = ev.clientX,
	mouseY = ev.clientY
      })

})()
