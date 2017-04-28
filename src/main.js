import 'whatwg-fetch';

fetch('http://google.com').then(e=>console.log(e))

// console.log('promise is',(Promise))



const main = document.getElementsByTagName('main')[0];

window.addEventListener('beforeunload', (e) => {
    main.classList.add('hidden');
})