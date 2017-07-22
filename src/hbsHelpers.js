var emoji = require('node-emoji')
var path = require('path')

let exp = function (hbs) {
    hbs.handlebars.registerHelper('datetime', function (dt, f) {
        try {
            return dateFormat(new Date(dt), f)
        } catch (e) {
            return 'Unknown datetime: ' + e
        }
    })
    hbs.handlebars.registerHelper('emojify', function (str) {
        try {
            return emoji.emojify(str)
        } catch (e) {
            return str
        }
    })
    hbs.handlebars.registerHelper('timeofday', function () {
        let str;
        let hr = new Date().getHours();
        if (hr < 12)
            str = 'Morning'
        else if (hr < 17)
            str = 'Afternoon'
        else str = 'Evening'
        return str
    })
    hbs.registerPartials(path.join('..', 'views', 'partials'));
}
module.exports = exp