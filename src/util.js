module.exports = {
    randomFrom: function (array) {
        return array[Math.trunc(Math.random() * array.length)]
    }
}