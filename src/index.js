import '../node_modules/normalize.css/normalize.css'
import './css/style.scss'
import './css/print.css'

let grt = document.getElementById('greeting')
if (grt) {
    let str;
    let hr = new Date().getHours();
    if (hr < 12)
        str = 'Morning'
    else if (hr < 17)
        str = 'Afternoon'
    else str = 'Evening'
    grt.textContent = str
}