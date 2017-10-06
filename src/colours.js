{
    let from = function(arr, ind){
        return arr[ind%arr.length]
    }

module.exports = new class {
    getGradientPair(seed){
        return from([
            [0xF761A1,0x8C1BAB],
            [0x43CBFF,0x9708CC]
        ], seed)
    }
    }()
}