"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import Image from "next/image";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, useAnimations } from "@react-three/drei";
import { Text } from "./Text";

// 🚀 Spaceship Component with ONLY engine fire animation
function Spaceship({ scrollY }: { scrollY: number }) {
  const group = useRef<any>(null);
  const { scene, animations } = useGLTF("/models/spaceship.glb");

  // 🔥 Filter out spin tracks, keep only engine fire
  const engineOnlyAnimations = animations.map((clip) => {
    const filteredTracks = clip.tracks.filter(
      (track) =>
        !track.name.includes(".rotation") && // remove spin (rotation)
        !track.name.includes(".quaternion") // remove spin (quaternion)
    );
    return new THREE.AnimationClip(clip.name, clip.duration, filteredTracks);
  });

  const { actions } = useAnimations(engineOnlyAnimations, group);

  // ✅ Play only fire animation, loop forever
  useEffect(() => {
    if (actions) {
      const firstAction = actions[Object.keys(actions)[0]];
      if (firstAction) {
        firstAction.reset().setLoop(THREE.LoopRepeat, Infinity).play();
      }
    }
  }, [actions]);

  return (
    <group ref={group}>
      <primitive
        object={scene}
        scale={0.2} // 🚀 spaceship size
        position={[2, -1.5 - scrollY * 0.01, 0]} // 🚀 adjust right corner
        rotation={[0, 0, 0]} // 🚀 no spin
      />
    </group>
  );
}

// 🎮 Custom OrbitControls that reset after release
function ResettingOrbitControls() {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const [resetting, setResetting] = useState(false);

  const defaultPos = new THREE.Vector3(0, 0, 5);
  const defaultTarget = new THREE.Vector3(0, 0, 0);

  useFrame(() => {
    if (resetting && controlsRef.current) {
      camera.position.lerp(defaultPos, 0.05);
      controlsRef.current.target.lerp(defaultTarget, 0.05);
      controlsRef.current.update();

      if (camera.position.distanceTo(defaultPos) < 0.01) {
        setResetting(false);
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={false}
      onEnd={() => setResetting(true)}
    />
  );
}

export default function ParallaxScene() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative h-[300vh] w-full overflow-hidden bg-black">
              {/* ✅ Sticky Text */}
      <div className="sticky top-0 flex flex-col items-center justify-center h-screen z-50">
        <h1 className="text-white text-7xl font-bold">
         Sparkable Digital Solutions where the Idea 
        </h1>
        <Text />
      </div>
      {/* SKY */}
      <div
        className="absolute top-0 left-0 w-full h-screen"
        style={{ transform: `translateY(${scrollY * 0.9}px)` }}
      >
        <Image src="/sky.png" alt="Sky" fill className="object-cover" />
      </div>

      {/* MOUNTAIN 1 */}
      <div
        className="absolute top-0 left-0 w-full h-screen"
        style={{ transform: `translateY(${scrollY * 0.75}px)` }}
      >
        <Image src="/mountain_2.png" alt="Mountain 1" fill className="object-cover" />
      </div>

      {/* MOUNTAIN 2 */}
      <div
        className="absolute top-0 left-0 w-full h-screen"
        style={{ transform: `translateY(${scrollY * 0.7}px)` }}
      >
        <Image src="/mountain_1.png" alt="Mountain 2" fill className="object-cover" />
      </div>

      {/* LAND */}
      <div
        className="absolute top-0 left-0 w-full h-screen"
        style={{ transform: `translateY(${scrollY * 0.6}px)` }}
      >
        <Image src="/land.png" alt="Land" fill className="object-cover" />
      </div>

      {/* 3D Spaceship Canvas */}
      <div className="absolute top-0 left-0 w-full h-screen pointer-events-none">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          {/* 💡 Better Lighting Setup */}
          <ambientLight intensity={0.6} /> {/* overall brightness */}
          <directionalLight
            position={[5, 10, 5]}
            intensity={2}
            castShadow
          />
          <pointLight
            position={[-5, 5, -5]}
            intensity={1.2}
            color="white"
          />
          <pointLight
            position={[0, 0, -3]}
            intensity={2.5}
            color="orange" // engine glow
          />

          <Suspense fallback={null}>
            <Spaceship scrollY={scrollY} />
          </Suspense>

          <ResettingOrbitControls />
        </Canvas>
      </div>
    </div>
  );
}