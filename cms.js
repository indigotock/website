var Elemeno = require('elemeno');

var elemeno = new Elemeno(require('./apikey'), {
    cacheMaxAge: 20,
    cacheSize: 100
});

function get_and_save_data() {
    elemeno.getCollectionItems('techs').then((data) => {
        obj['site_techs'] = data
    })
    elemeno.getCollectionItems('ideas').then((data) => {
        obj['ideas'] = data
    })
    elemeno.getCollectionItems('posts').then((data) => {
        obj.posts = data
    })
}


var obj = {
    posts: [],
    ideas: [],
    site_techs: [],
    clearCache: function (cb) {
        elemeno.clearCache()
        get_and_save_data()
        cb()
    }
}
get_and_save_data()

module.exports = obj