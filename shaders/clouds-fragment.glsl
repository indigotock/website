uniform float radius;
uniform float time;
uniform float seed1;
uniform float seed2;
varying vec3 pos;


const int numFreq = 5;
const int octaves = 2 ;

float noise(vec3 position) {
    float frequency = 1.;
    float total = 0.0;
    float maxAmplitude = 0.0;
    float amplitude = 1.0;
    for (int i = 0; i < octaves; i++) {
        total += snoise((position * frequency)) * amplitude;
        frequency *= 2.0;
        maxAmplitude += amplitude*1.5;
        amplitude *= .7;
    }
    return total / maxAmplitude;
}

float turb (vec3 P)
{
    float val = 0.0;
    float freq = 1.0;
    for (int i=0; i<numFreq; i++) {
        val += ((noise (P*freq) / freq)*3.);
        freq *= 2.07;
    }
    return val;
}

vec4 mixcol(vec4 t0, vec4 t1){
    return t0.a * t0 + (1.0 - t0.a) * t1;
}

void main() {
    vec3 pos2 = (pos/150.) + (vec3(.3,.7, .3)*(-time/20.));

    float mno = (noise(-pos2 + seed1) + 1.) / 2.;
    float mask = (mno * 3.1) - .98;

    float xmod = snoise(pos2 +seed1);
    float ymod = snoise(pos2 +seed2);
    float zmod = snoise(pos2 +(seed2+seed1));

    vec3 timediff = pos2;// + (vec3(.1,0,0)*xmod) + (vec3(0,.1,0)*ymod)+ (vec3(0,.1,0)*ymod);
	
    float noise = (turb(timediff) + 1.) / 2.;

	vec4 color = vec4(1,1,1, .7)*(noise*mask);
    color.a = min(color.a, .87);
	gl_FragColor = color;
}