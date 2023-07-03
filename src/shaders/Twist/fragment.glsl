#include <map_fragment>

float distort = vNoise * 7.0;

vec3 brightness = vec3(0.5, 0.5, 0.5);
vec3 contrast = vec3(0.5, 0.5, 0.5);
vec3 oscilation = vec3(1.0, 1.0, 1.0);
//vec3 phase = vec3(0.30, 0.20, 0.20);
vec3 phase = uColorPhase;

vec3 customColor = diffuseColor.rgb;
// customColor.r = distort;

if(uColorful > 0.0) {
customColor = cosPalette(distort, brightness, contrast, oscilation, phase);
}

diffuseColor = vec4(customColor, 1.0);