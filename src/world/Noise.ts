/*
 * Based on javascript code from Joseph Gentle, which is based on
 * on public domain code from Stefan Gustavson of Linköping University,
 * later optimised by Peter Eastman of Stanford.
 * 
 * Translated to TypeScript by Kyle Hughes on 2017/04/18
 */


/**
 * Base class for noise generators
 */

var sum = function (arr) {
    return arr.reduce((a, b) => a + b);
}

export abstract class Noise {
    protected readonly grad3: Grad[];
    protected readonly p: number[];
    protected readonly perm: number[];
    protected readonly gradP: Grad[];

    protected static readonly F2 = (Math.sqrt(3) - 1) / 2;
    protected static readonly F3 = (Math.sqrt(4) - 1) / 3;
    protected static readonly F4 = (Math.sqrt(5) - 1) / 4;

    protected static readonly G2 = (3 - Math.sqrt(3)) / 6;
    protected static readonly G3 = (4 - Math.sqrt(4)) / 12;
    protected static readonly G4 = (5 - Math.sqrt(5)) / 20;

    public grads(dimensions: number): Grad[] {
        var ret = new Array()
        return
    }

    /**
     * Samples the generated noise texture, returning the value in range
     * -1 to +1.
     * @param x X-coordinate to sample from the noise texture
     * @param y Y-coordinate to sample from the noise texture, optional
     * @param z Z-coordinate to sample from the noise texture, optional
     */
    public abstract get(x: number, y?: number, z?: number): number;
    public getNormalised(x: number, y?: number, z?: number): number {
        return (this.get(x, y, z) + 1) / 2;
    }

    /**
     * Constructs a new noise generator with given initial seed value
     * @param seed The initial seed value to use
     */
    constructor(seed?: number) {
        if (!seed) {
            seed = new Date().getTime();
        }
        this.grad3 =
            [new Grad(1, 1, 0), new Grad(-1, 1, 0), new Grad(1, -1, 0), new Grad(-1, -1, 0),
            new Grad(1, 0, 1), new Grad(-1, 0, 1), new Grad(1, 0, -1), new Grad(-1, 0, -1),
            new Grad(0, 1, 1), new Grad(0, -1, 1), new Grad(0, 1, -1), new Grad(0, -1, -1)];

        this.p = [151, 160, 137, 91, 90, 15,
            131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23,
            190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
            88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166,
            77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244,
            102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196,
            135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123,
            5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42,
            223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
            129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228,
            251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107,
            49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
            138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];

        this.perm = [];
        this.gradP = [];
        this.reseed(seed);
    }

    /**
     * Reseeds this noise generator
     * @param seed The seed value to use
     */
    public reseed(seed: number) {
        if (seed > 0 && seed < 1) {
            seed *= 65536;
        }

        seed = Math.floor(seed);
        if (seed < 256) {
            seed |= seed << 8;
        }

        var p = this.p;
        for (var i = 0; i < 256; i++) {
            var v: number;
            if (i & 1) {
                v = this.p[i] ^ (seed & 255);
            } else {
                v = this.p[i] ^ ((seed >> 8) & 255);
            }

            var perm = this.perm;
            var gradP = this.gradP;
            perm[i] = perm[i + 256] = v;
            gradP[i] = gradP[i + 256] = this.grad3[v % 12];
        }
    }
}

class Grad {
    public readonly values: number[];
    public get x(): number {
        return this.values[0];
    }
    public get y(): number {
        return this.values[1];
    }
    public get z(): number {
        return this.values[2];
    }
    public get w(): number {
        return this.values[3];
    }
    constructor(...ins: number[]) {
        this.values = ins;
    }
    public static fromArray(ins: number[]): Grad {
        return new Grad(...ins);
    }

    public dot2(x: number, y: number): number {
        return this.x * x + this.y + y;
    }

    public dot3(x: number, y: number, z: number): number {
        return this.x * x + this.y * y + this.z * this.z;
    }

    public dotN(...ins: number[]): number {
        const len = Math.min(ins.length, this.values.length);
        var products = new Array(len);

        for (var i = 0; i < len; i++) {
            products.push(this.values[i] * ins[i]);
        }

        return sum(products);
    }
}

/**
 */
export class SimplexNoise extends Noise {
    getN(...ins: number[]): number {
        //TODO: complete
        var dimensions = ins.length;
        var contrs = new Array(dimensions + 1);

        const n = dimensions;

        const F = Math.abs((Math.sqrt(n + 1) - 1) / n);
        const G = Math.abs((1 / (Math.sqrt(n + 1)) - 1) / n);

        var skewed = ins.map(x => x + sum(ins) * F);

        var floored = skewed.map((e, i) => Math.floor(e));

        function compare(num: number): number {
            return 1;
        }

        var internal = floored.map((e, i) => skewed[i] - e);
        var simplex: number[];
        for (var i = 0; i < dimensions; i++) {
            var result = compare(internal[i]);
            for (var j = 0; j < dimensions; j++) {
                simplex[j] = result;
            }
        }
        return internal.length;
    }

    get(x: number, y?: number, z?: number): number {
        var n0, n1, n2, n3; // Noise contributions from the four corners

        // Skew the input space to determine which simplex cell we're in
        var s = (x + y + z) * Noise.F3; // Hairy factor for 2D
        var i = Math.floor(x + s);
        var j = Math.floor(y + s);
        var k = Math.floor(z + s);

        var t = (i + j + k) * Noise.G3;
        var x0 = x - i + t; // The x,y distances from the cell origin, unskewed.
        var y0 = y - j + t;
        var z0 = z - k + t;

        // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
        // Determine which simplex we are in.
        var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords
        var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords
        if (x0 >= y0) {
            if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
            else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
            else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
        } else {
            if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
            else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
            else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
        }
        // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
        // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
        // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
        // c = 1/6.
        var x1 = x0 - i1 + Noise.G3; // Offsets for second corner
        var y1 = y0 - j1 + Noise.G3;
        var z1 = z0 - k1 + Noise.G3;

        var x2 = x0 - i2 + 2 * Noise.G3; // Offsets for third corner
        var y2 = y0 - j2 + 2 * Noise.G3;
        var z2 = z0 - k2 + 2 * Noise.G3;

        var x3 = x0 - 1 + 3 * Noise.G3; // Offsets for fourth corner
        var y3 = y0 - 1 + 3 * Noise.G3;
        var z3 = z0 - 1 + 3 * Noise.G3;

        // Work out the hashed gradient indices of the four simplex corners
        i &= 255;
        j &= 255;
        k &= 255;

        var perm = this.perm;
        var gradP = this.gradP;
        var gi0 = gradP[i + perm[j + perm[k]]];
        var gi1 = gradP[i + i1 + perm[j + j1 + perm[k + k1]]];
        var gi2 = gradP[i + i2 + perm[j + j2 + perm[k + k2]]];
        var gi3 = gradP[i + 1 + perm[j + 1 + perm[k + 1]]];

        // Calculate the contribution from the four corners
        var t0 = 0.5 - x0 * x0 - y0 * y0 - z0 * z0;
        if (t0 < 0) {
            n0 = 0;
        } else {
            t0 *= t0;
            n0 = t0 * t0 * gi0.dot3(x0, y0, z0);  // (x,y) of grad3 used for 2D gradient
        }
        var t1 = 0.5 - x1 * x1 - y1 * y1 - z1 * z1;
        if (t1 < 0) {
            n1 = 0;
        } else {
            t1 *= t1;
            n1 = t1 * t1 * gi1.dot3(x1, y1, z1);
        }
        var t2 = 0.5 - x2 * x2 - y2 * y2 - z2 * z2;
        if (t2 < 0) {
            n2 = 0;
        } else {
            t2 *= t2;
            n2 = t2 * t2 * gi2.dot3(x2, y2, z2);
        }
        var t3 = 0.5 - x3 * x3 - y3 * y3 - z3 * z3;
        if (t3 < 0) {
            n3 = 0;
        } else {
            t3 *= t3;
            n3 = t3 * t3 * gi3.dot3(x3, y3, z3);
        }
        // Add contributions from each corner to get the final noise value.
        // The result is scaled to return values in the interval [-1,1].
        return 32 * (n0 + n1 + n2 + n3);
    }

}

export class PerlinNoise extends Noise {
    private fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    private lerp(a, b, t) {
        return (1 - t) * a + t * b;
    }
    public getN(...ins: number[]): number {
        if (ins.length == 1) {
            // Just use 2D noise with a fixed Y coordinate in the
            // 1D instance
            ins.push(0);
        }
        var dimensions = ins.length;

        var floored = ins.map(Math.floor);
        const offsets = ins.map((e, i) => { return e - floored[i] });
        floored = floored.map(e => e & 255);

        var perm = this.perm;
        var gradP = this.gradP;

        var corners = new Array<number>(Math.pow(2, dimensions));

        function offset(corner: number, dim: number = 0): number {
            const P = ((corner & (1 << dim)) > 0) ? 1 : 0;

            if (dim <= 0) {
                return floored[dim] + P;
            }
            return floored[dim] + P + perm[offset(corner, dim - 1)]
        }


        for (var i = 0; i < corners.length; i++) {
            function P(dim) {
                return ((corners[i] & (1 << dim)) > 0) ? 1 : 0;
            }

            var dotdims = ins.map((e, i) => {
                return e - P(i)
            });

            corners[i] = this.gradP[offset(i, dimensions - 1)].dotN(
                ...dotdims
            );
        }

        const faded = ins.map(this.fade);

        //  return lerp(
        //         lerp(
        //           lerp(n000, n100, u),
        //           lerp(n001, n101, u), w),
        //         lerp(
        //           lerp(n010, n110, u),
        //           lerp(n011, n111, u), w),
        //        v);

        var total = 0;
        const that = this;
        function ilerp(dim, c = 0) {
            var first = 0;
            var second = 0;
            if (dim >= 0) {
                first = ilerp(dim - 1, c);
                second = ilerp(dim - 1, c + 1);
            } else {
                return that.lerp(first, second, ins[dim]);
            }
        }

        return ilerp(dimensions);
    }
    public get(x: number, y?: number, z?: number): number {
        // Find unit grid cell containing point
        var X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z);
        // Get relative xyz coordinates of point within that cell
        x = x - X; y = y - Y; z = z - Z;
        // Wrap the integer cells at 255 (smaller integer period can be introduced here)
        X = X & 255; Y = Y & 255; Z = Z & 255;

        // Calculate noise contributions from each of the eight corners
        var perm = this.perm;
        var gradP = this.gradP;
        var n000 = gradP[X + perm[Y + perm[Z]]].dot3(x, y, z);
        var n001 = gradP[X + perm[Y + perm[Z + 1]]].dot3(x, y, z - 1);
        var n010 = gradP[X + perm[Y + 1 + perm[Z]]].dot3(x, y - 1, z);
        var n011 = gradP[X + perm[Y + 1 + perm[Z + 1]]].dot3(x, y - 1, z - 1);
        var n100 = gradP[X + 1 + perm[Y + perm[Z]]].dot3(x - 1, y, z);
        var n101 = gradP[X + 1 + perm[Y + perm[Z + 1]]].dot3(x - 1, y, z - 1);
        var n110 = gradP[X + 1 + perm[Y + 1 + perm[Z]]].dot3(x - 1, y - 1, z);
        var n111 = gradP[X + 1 + perm[Y + 1 + perm[Z + 1]]].dot3(x - 1, y - 1, z - 1);

        // Compute the fade curve value for x, y, z
        var u = this.fade(x);
        var v = this.fade(y);
        var w = this.fade(z);

        // Interpolate
        return this.lerp(
            this.lerp(
                this.lerp(n000, n100, u),
                this.lerp(n001, n101, u), w),
            this.lerp(
                this.lerp(n010, n110, u),
                this.lerp(n011, n111, u), w),
            v);


        // return lerp(
        //     lerp(n00, n10, u),
        //     lerp(n01, n11, u),
        //     fade(y));
    }

}