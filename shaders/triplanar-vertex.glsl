varying vec3 pos;
varying mat4 vM;
varying mat4 mM;
varying mat4 pM;


void main()
{
    pM = projectionMatrix;
    vM = viewMatrix;
    mM = modelMatrix;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    pos = position;
}