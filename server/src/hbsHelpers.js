let exp = function (hbs) {
    hbs.handlebars.registerHelper('datetime', function (dt, f) {
        try {
            return dateFormat(new Date(dt), f)
        } catch (e) {
            return ''
        }
    })
}
module.exports = exp