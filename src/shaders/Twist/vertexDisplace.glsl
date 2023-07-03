#include <begin_vertex>

//vec3 transformed = vec3(normal);

//transformed.z += noise * uNoiseIntensity;

// float t = uTime * uSpeed;
//   // You can also use classic perlin noise or simplex noise,
//   // I'm using its periodic variant out of curiosity
float noise = pnoise((normal + sin(t)) * uNoiseDensity, vec3(10.0)) * uNoiseIntensity;

//float noise = cnoise(normal + t);
//transformed.z += noise * uNoiseIntensity;
//   // Disturb each vertex along the direction of its normal
transformed = position + (normal * noise);

//float angle = sin(uv.y * uFrequency + t) * uAmplitude;

transformed = rotateY(transformed, angle);

// vNormal = normal;
vNoise = noise;
vUvs = uv;