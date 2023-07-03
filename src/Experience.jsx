import * as THREE from "three";
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls, useEnvironment, Environment } from "@react-three/drei";
import { useControls, button } from "leva";
import { Perf } from "r3f-perf";
//Shaders
import twistVertexShaderCommon from "./shaders/Twist/vertexCommon.glsl";
import twistVertexShaderDisplace from "./shaders/Twist/vertexDisplace.glsl";
import twistFragmentShader from "./shaders/Twist/fragment.glsl";

console.log(twistVertexShaderCommon, twistFragmentShader);

export default function Experience() {
  const blobRef = useRef();
  const lightRef1 = useRef();
  const lightRef2 = useRef();

  const [hovered, setHovered] = useState(false);
  const [density, setDensity] = useState(0);

  //   const envMap = useEnvironment({
  //     preset: "city",
  //   });

  const {
    color,
    lightColor,
    wireframe,
    speed,
    noiseDensity,
    visible,
    noiseIntensity,
    frequency,
    amplitude,
    colorPhase,
    colourful,
  } = useControls("Blob", {
    color: {
      value: "#c1c1c1",
    },
    lightColor: "#ff6600",
    wireframe: false,
    noiseIntensity: {
      min: 0,
      max: 2,
      value: 0.2,
      step: 0.01,
      onChange: (v) => {
        // imperatively update the world after Leva input changes
        customUniforms.uNoiseIntensity.value = v;
      },
    },
    noiseDensity: {
      min: 0,
      max: 10,
      value: 1.5,
      step: 0.01,
      onChange: (v) => {
        // imperatively update the world after Leva input changes
        customUniforms.uNoiseDensity.value = v;
      },
    },
    speed: {
      min: 0.1,
      max: 1,
      value: 0.2,
      step: 0.01,
      onChange: (v) => {
        // imperatively update the world after Leva input changes
        customUniforms.uSpeed.value = v;
      },
    },
    frequency: {
      min: 0,
      max: 10,
      value: 1.9,
      step: 0.1,
      onChange: (v) => {
        // imperatively update the world after Leva input changes
        customUniforms.uFrequency.value = v;
      },
    },
    amplitude: {
      min: 0,
      max: 10,
      value: 4.0,
      step: 0.1,
      onChange: (v) => {
        // imperatively update the world after Leva input changes
        customUniforms.uAmplitude.value = v;
      },
    },
    colorPhase: {
      value: { x: 0.3, y: 0.2, z: 0.2 },
      step: 0.01,
      joystick: "invertY",
      onChange: (v) => {
        // imperatively update the world after Leva input changes
        // customUniforms.uColorPhase.x = v.x;
        // customUniforms.uColorPhase.y = v.y;
        // customUniforms.uColorPhase.z = v.z;
        customUniforms.uColorPhase.value = new THREE.Vector3(v.x, v.y, v.z);
      },
    },
    visible: true,
    colourful: {
      value: false,
      onChange: (v) => {
        customUniforms.uColorful.value = +v;
      },
    },
    //   clickMe: button(() => {
    //     console.log("ok");
    //   }),
    //   choice: { options: ["a", "b", "c"] },
  });

  const { perfVisible } = useControls("debug", {
    perfVisible: false,
  });

  const customUniforms = {
    uTime: { value: 0 },
    uNoiseIntensity: { value: noiseIntensity },
    uNoiseDensity: { value: noiseDensity },
    uSpeed: { value: speed },
    uFrequency: { value: frequency },
    uAmplitude: { value: amplitude },
    uColorPhase: {
      value: new THREE.Vector3(0.3, 0.2, 0.2),
    },
    uColorful: { value: colourful },
  };

  useFrame(({ clock }) => {
    const elapsedTime = clock.elapsedTime;
    customUniforms.uTime.value = elapsedTime;
    // console.log(noiseDensity);
    //blobRef.current.rotation.y = elapsedTime * 0.25;
    lightRef1.current.position.x = 25 * Math.cos(elapsedTime);
    lightRef2.current.position.z = 25 * Math.sin(elapsedTime);
  });

  const onBeforeCompile = (shader) => {
    shader.uniforms.uTime = customUniforms.uTime;
    shader.uniforms.uSpeed = customUniforms.uSpeed;
    shader.uniforms.uNoiseIntensity = customUniforms.uNoiseIntensity;
    shader.uniforms.uNoiseDensity = customUniforms.uNoiseDensity;
    shader.uniforms.uFrequency = customUniforms.uFrequency;
    shader.uniforms.uAmplitude = customUniforms.uAmplitude;
    shader.uniforms.uColorPhase = customUniforms.uColorPhase;
    shader.uniforms.uColorful = customUniforms.uColorful;

    shader.vertexShader = shader.vertexShader.replace(
      "#include <common>",
      twistVertexShaderCommon
    );

    shader.vertexShader = shader.vertexShader.replace(
      "#include <beginnormal_vertex>",
      `
      #include <beginnormal_vertex>

      //CALCULATE ANGLE HERE ALREADY TO BE USED BY NORMALS 

      float t = uTime * uSpeed;

      float angle = sin(uv.y * uFrequency + t) * uAmplitude;

      mat2 rotate = get2dRotateMatrixx(angle);

      objectNormal.xz = rotate * objectNormal.xz;
      `
    );

    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      twistVertexShaderDisplace
    );

    shader.fragmentShader =
      `
      uniform float uTime;
      uniform vec3 uColorPhase;
      uniform float uColorful;
      varying vec2 vUvs; 
      varying float vNoise; 
      vec3 cosPalette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
        return a + b * cos(6.28318 * (c * t + d));
      }\n` + shader.fragmentShader;

    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <map_fragment>",
      twistFragmentShader
    );

    console.log(shader);
  };

  return (
    <>
      {perfVisible && <Perf position="top-left" />}

      <OrbitControls makeDefault enableDamping={true} />

      <Environment preset="city" />

      {/* <directionalLight
        color={0xff0000}
        position={[-1, 2, 3]}
        intensity={1.5}
      /> */}
      <pointLight ref={lightRef1} color={lightColor} position={[10, 10, 10]} />
      <pointLight ref={lightRef2} color={lightColor} position={[-6, -6, 4]} />
      <ambientLight color={0xffffff} intensity={0.5} />

      <mesh
        visible={visible}
        position={[0, 0, 0]}
        ref={blobRef}
        onPointerOut={(e) => {
          console.log(e);
          console.log(noiseDensity);
        }}
        onPointerEnter={(e) => {
          //   customUniforms.uNoiseIntensity.value += 0.2;
        }}
      >
        <sphereGeometry args={[1, 128, 128]} />

        <meshStandardMaterial
          color={color}
          roughness={0.1}
          //   metalness={metalness}
          envMapIntensity={0.2}
          onBeforeCompile={onBeforeCompile}
          wireframe={wireframe}
        />
        {/* <meshNormalMaterial onBeforeCompile={onBeforeCompile} /> */}
      </mesh>
    </>
  );
}
