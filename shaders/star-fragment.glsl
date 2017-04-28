uniform sampler2D texture;
uniform float radius;
uniform float time;
uniform float maxTemp;
varying vec3 pos;

const int octaves = 2;

/*

The noise() function was adapted from Ben Podgursky's work from the
wonderful Uncharted project.

Adadpted code found on lines 105-121 at
https://github.com/bpodgursky/uncharted/blob/c9c11431074dad6d7cf1d50069b1b634e2b143e8/src/main/www/com/bpodgursky/uncharted/www/resources/noise/noise-grainy-fragment.glsl#L105

Project information at https://github.com/bpodgursky/uncharted,
you should really check it out.

That code is licensed under the Apache License Version 2.0, available
here: http://www.apache.org/licenses/LICENSE-2.0

*/
float noise(vec4 position) {
    float frequency = 1.;
    float total = 0.0;
    float maxAmplitude = 0.0;
    float amplitude = 1.0;
    for (int i = 0; i < octaves; i++) {
        total += snoise(position * frequency) * amplitude;
        frequency *= 2.0;
        maxAmplitude += amplitude*1.5;
        amplitude *= .7;
    }
    return total / maxAmplitude;
}

vec4 mixcol(vec4 t0, vec4 t1){
    return t0.a * t0 + (1.0 - t0.a) * t1;
}

vec4 fuzzNoise(){
    float v = snoise(vec4(pos*-30.,time));

    return vec4(v,v,v,((snoise(pos)+1.)/2.)*.2);
}

void main() {
    float noiseBase = (noise(vec4(pos, time*.25))+1.0)/2.0;

    float minTemp = maxTemp/5.;

    float t1 = snoise(vec4(pos * .035, time*((.0125/20.)*radius)))*2.7 -  2.;
    vec3 pos2 = pos * vec3(1.,.25,1.);
    float brightNoise= snoise(vec4(pos2 /((30./20.)*radius), time*.0125))*1.4- .95;

    float brightSpot = max(0.0, brightNoise);
    float total = noiseBase - max(0.0, t1) + brightSpot;

    float temp = (maxTemp * (total) + (1.0-total) * minTemp);

    float i =(temp - 400.0)*(1./12000.)*.70-.0775;

    vec4 col = texture2D(texture,vec2(i,0));

    col = mixcol(fuzzNoise(), col);

    gl_FragColor = col;

}