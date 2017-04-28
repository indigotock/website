uniform sampler2D texture;
uniform float radius;
uniform float minHeight;
uniform float maxHeight;
uniform float seed;
varying vec3 pos;

float map(float value, float inMin, float inMax, float outMin, float outMax) {
  return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

void main() {
    vec3 pos2 = pos;//vec3(axis * vec4(pos,1.));
    vec3 norm = normalize(pos2);
    vec3 sealevel = norm * radius;
    vec3 posseed = pos2*.5 + (vec3(2,2,2)*seed);
    float dist = length(pos2-sealevel);
    
    float scaled = map(dist, minHeight, maxHeight, 0., 2.);
    float polesmap = sealevel.y + snoise(pos2*.125)*map(abs(norm.y),0.,1.,8.,3.);
    float poles = map(abs(polesmap),0.,radius,0.,1.);

    gl_FragColor = texture2D(texture, vec2(poles,scaled));
}