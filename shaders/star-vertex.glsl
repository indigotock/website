varying vec3 pos;
uniform float time;
uniform float radius;


void main() {
    pos = position;
    
    float displacement = (radius/20.)*snoise( 0.005 * position + vec3(  time/30. ) );

    vec3 newPosition = position + normal * displacement;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );

}