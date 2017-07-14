var Elemeno = require('elemeno');

var elemeno = new Elemeno(require('./apikey'), {
    cacheMaxAge: 20,
    cacheSize: 100
});


var obj = {
    ideas: [],
    clearCache: function (cb) {
        elemeno.clearCache()
        elemeno.getCollectionItems('ideas').then((data) => {
            obj['ideas'] = data
            cb()
        })
    }
}


elemeno.getCollectionItems('ideas').then((data) => {
    obj['ideas'] = data
})

module.exports = obj