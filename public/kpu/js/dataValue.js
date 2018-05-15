export class DataValue {
    constructor(value) {
        this.value = value;
    }
    get length() {
        return 1;
    }
    compute(cpu) {
        return this.value;
    }
    write(cpu, index, setFunction = function (array, index, value) {
        array[index] = value
    }) {
        setFunction(cpu.memory, index, this.value)
        return 1;
    }
}