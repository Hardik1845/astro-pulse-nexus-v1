import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Stars } from "@react-three/drei";
import * as THREE from "three";

// Sun component
const Sun = () => {
  const sunRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (sunRef.current) {
      sunRef.current.rotation.y += 0.001;
    }
  });

  return (
    <Sphere ref={sunRef} args={[2, 32, 32]} position={[0, 0, 0]}>
      <meshStandardMaterial
        emissive="#FFD54F"
        emissiveIntensity={2}
        color="#FFD54F"
      />
      <pointLight intensity={2} distance={100} decay={2} />
    </Sphere>
  );
};

// Planet component
interface PlanetProps {
  size: number;
  color: string;
  distance: number;
  speed: number;
  name: string;
}

const Planet = ({ size, color, distance, speed, name }: PlanetProps) => {
  const planetRef = useRef<THREE.Mesh>(null);
  const orbitRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (orbitRef.current) {
      orbitRef.current.rotation.y = clock.getElapsedTime() * speed;
    }
    if (planetRef.current) {
      planetRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={orbitRef}>
      <Sphere ref={planetRef} args={[size, 32, 32]} position={[distance, 0, 0]}>
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
      </Sphere>
      {/* Orbit line */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[distance - 0.05, distance + 0.05, 64]} />
        <meshBasicMaterial color="#00FFFF" opacity={0.2} transparent side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// Satellite component
const Satellite = ({ distance, speed, size = 0.15 }: { distance: number; speed: number; size?: number }) => {
  const satelliteRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (satelliteRef.current) {
      satelliteRef.current.rotation.y = clock.getElapsedTime() * speed;
    }
  });

  return (
    <group ref={satelliteRef}>
      <Sphere args={[size, 16, 16]} position={[distance, 0, 0]}>
        <meshStandardMaterial color="#00FFB2" emissive="#00FFB2" emissiveIntensity={0.5} />
      </Sphere>
    </group>
  );
};

const SolarSystem3D = () => {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 20, 30], fov: 60 }}>
        <color attach="background" args={["#000000"]} />
        
        {/* Ambient lighting */}
        <ambientLight intensity={0.1} />
        
        {/* Starfield background */}
        <Stars radius={300} depth={60} count={5000} factor={7} saturation={0} fade speed={1} />
        
        {/* Sun */}
        <Sun />
        
        {/* Planets */}
        <Planet name="Mercury" size={0.4} color="#8C7853" distance={5} speed={0.4} />
        <Planet name="Venus" size={0.7} color="#FFC649" distance={7} speed={0.3} />
        <Planet name="Earth" size={0.8} color="#2F6A9E" distance={10} speed={0.2} />
        <Planet name="Mars" size={0.6} color="#CD5C5C" distance={13} speed={0.15} />
        <Planet name="Jupiter" size={1.5} color="#C88B3A" distance={18} speed={0.08} />
        <Planet name="Saturn" size={1.3} color="#FAD5A5" distance={23} speed={0.06} />
        
        {/* Moon around Earth */}
        <group>
          <Satellite distance={11.5} speed={0.8} size={0.2} />
        </group>
        
        {/* Satellites */}
        <Satellite distance={11} speed={0.9} />
        <Satellite distance={11.2} speed={0.95} />
        <Satellite distance={10.8} speed={0.85} />
        <Satellite distance={11.3} speed={1.0} />
        <Satellite distance={10.9} speed={0.88} />
        
        {/* Orbit controls for interaction */}
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          minDistance={15}
          maxDistance={60}
        />
      </Canvas>
    </div>
  );
};

export default SolarSystem3D;
