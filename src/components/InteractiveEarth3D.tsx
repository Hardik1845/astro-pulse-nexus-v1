import React, { useEffect, useRef, useState, MouseEvent, WheelEvent } from 'react';
import * as THREE from 'three';

interface ISSPosition {
  name: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  altitude: string;
  velocity?: string;
}

interface Satellite {
  name: string;
  altitude: string;
  status: string;
  risk: string;
}

interface InteractiveEarth3DProps {
  issPosition?: ISSPosition;
  satellites?: Satellite[];
  kpIndex?: number;
}

const InteractiveEarth3D: React.FC<InteractiveEarth3DProps> = ({ issPosition, satellites, kpIndex }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const earthRef = useRef<THREE.Mesh | null>(null);
  const issMarkerRef = useRef<THREE.Mesh | null>(null);
  const atmosphereRef = useRef<THREE.Mesh | null>(null);
  
  // Use ref for isHovering to avoid stale closure in event listeners
  const isHoveringRef = useRef(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    isHoveringRef.current = isHovering;
  }, [isHovering]);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Earth setup
    const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, '#1a4d7a');
      gradient.addColorStop(0.3, '#2563eb');
      gradient.addColorStop(0.5, '#0ea5e9');
      gradient.addColorStop(0.7, '#14b8a6');
      gradient.addColorStop(1, '#1a4d7a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#10b981';
      ctx.globalAlpha = 0.6;
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = 50 + Math.random() * 100;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);

    const earthMaterial = new THREE.MeshPhongMaterial({
      map: texture,
      bumpScale: 0.05,
      shininess: 20,
    });

    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earthRef.current = earth;
    scene.add(earth);

    // Atmosphere glow
    const atmosphereGeometry = new THREE.SphereGeometry(1.15, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      uniforms: {
        intensity: { value: 1.0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        uniform float intensity;
        void main() {
          float i = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * i * intensity;
        }
      `
    });

    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    atmosphereRef.current = atmosphere;
    scene.add(atmosphere);

    // ISS marker
    const issGeometry = new THREE.SphereGeometry(0.03, 16, 16);
    const issMaterial = new THREE.MeshPhongMaterial({ 
  color: 0xff0000,
  emissive: 0xff0000,
  emissiveIntensity: 1.5
});

    const issMarker = new THREE.Mesh(issGeometry, issMaterial);
    issMarkerRef.current = issMarker;
    scene.add(issMarker);

    // ISS orbit trail
    const orbitGeometry = new THREE.BufferGeometry();
    const orbitPoints: number[] = [];
    const orbitRadius = 1.065; // ISS altitude

    for (let i = 0; i <= 100; i++) {
      const angle = (i / 100) * Math.PI * 2;
      orbitPoints.push(
        Math.cos(angle) * orbitRadius,
        Math.sin(angle) * orbitRadius * 0.3,
        0
      );
    }
    orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(orbitPoints, 3));
    const orbitMaterial = new THREE.LineBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.3
    });
    const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
    scene.add(orbitLine);

    // Satellite markers
    const satelliteMarkers: THREE.Mesh[] = [];
    // Use fixed satellite data - typed properly
    const satelliteData: { altitude: number; color: number }[] = [
      { altitude: 1.09, color: 0x00ff00 },
      { altitude: 1.12, color: 0x00ff00 },
      { altitude: 1.55, color: 0xffff00 },
      { altitude: 1.08, color: 0x00ff00 },
    ];

    satelliteData.forEach((sat, idx) => {
      const satGeometry = new THREE.SphereGeometry(0.02, 12, 12);
      const satMaterial = new THREE.MeshPhongMaterial({
  color: 0xff0000,
  emissive: 0xff0000,
  emissiveIntensity: 1.5
});

      const satMesh = new THREE.Mesh(satGeometry, satMaterial);

      const angle = (idx / satelliteData.length) * Math.PI * 2;
      satMesh.position.set(
        Math.cos(angle) * sat.altitude,
        Math.sin(angle) * sat.altitude * 0.5,
        (Math.random() - 0.5) * 0.3
      );
      satelliteMarkers.push(satMesh);
      scene.add(satMesh);
    });

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    const backLight = new THREE.DirectionalLight(0x6b9bd1, 0.3);
    backLight.position.set(-5, -3, -5);
    scene.add(backLight);

    // Stars background
    const starGeometry = new THREE.BufferGeometry();
    const starVertices: number[] = [];
    for (let i = 0; i < 3000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starVertices.push(x, y, z);
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2,
      transparent: true,
      opacity: 0.8
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    // Typed event handlers using React types
    const onMouseMove = (event: MouseEvent<HTMLDivElement>) => {
      if (!isHoveringRef.current || !mountRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      targetRotationY = mouseX * 0.5;
      targetRotationX = mouseY * 0.5;
    };

    const onWheel = (event: WheelEvent<HTMLDivElement>) => {
      event.preventDefault();
      camera.position.z += event.deltaY * 0.001;
      camera.position.z = Math.max(2, Math.min(5, camera.position.z));
    };

    mountRef.current.addEventListener('mousemove', onMouseMove as any);
    mountRef.current.addEventListener('wheel', onWheel as any, { passive: false });

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Rotate Earth
      if (earthRef.current) {
        if (isHoveringRef.current) {
          earth.rotation.y += (targetRotationY - earth.rotation.y) * 0.05;
          earth.rotation.x += (targetRotationX - earth.rotation.x) * 0.05;
        } else {
          earth.rotation.y += 0.001;
        }
      }

      // Atmosphere intensity based on Kp index
      if (atmosphereRef.current && kpIndex !== undefined) {
        const intensity = 1.0 + (kpIndex / 9) * 2;
        (atmosphereRef.current.material as THREE.ShaderMaterial).uniforms.intensity.value = intensity;
      }

      // Update ISS position
      if (issMarkerRef.current && issPosition) {
        const lat = (issPosition.latitude * Math.PI) / 180;
        const lon = (issPosition.longitude * Math.PI) / 180;
        const radius = 1.065;

        issMarkerRef.current.position.set(
          radius * Math.cos(lat) * Math.cos(lon),
          radius * Math.sin(lat),
          radius * Math.cos(lat) * Math.sin(lon)
        );

        // Pulse effect
        const scale = 1 + Math.sin(Date.now() * 0.003) * 0.3;
        issMarkerRef.current.scale.set(scale, scale, scale);
      }

      // Animate satellites
      satelliteMarkers.forEach((sat, idx) => {
        const time = Date.now() * 0.0003;
        sat.rotation.y = time + idx;
        const scale = 1 + Math.sin(time * 2 + idx) * 0.2;
        sat.scale.set(scale, scale, scale);
      });

      // Rotate stars slowly
      stars.rotation.y += 0.0001;

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeEventListener('mousemove', onMouseMove as any);
        mountRef.current.removeEventListener('wheel', onWheel as any);
        if (mountRef.current.contains(renderer.domElement)) {
          mountRef.current.removeChild(renderer.domElement);
        }
      }
      renderer.dispose();

      earthGeometry.dispose();
      earthMaterial.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      issGeometry.dispose();
      issMaterial.dispose();
      orbitGeometry.dispose();
      orbitMaterial.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
    };
  }, [issPosition, kpIndex]); // Removed isHovering to avoid stale closure issues

  return (
    <div
      ref={mountRef}
      className="w-full h-full cursor-grab active:cursor-grabbing"
      onMouseEnter={() => {
        setIsHovering(true);
        isHoveringRef.current = true;
      }}
      onMouseLeave={() => {
        setIsHovering(false);
        isHoveringRef.current = false;
      }}
      style={{ touchAction: 'none' }}
    />
  );
};

export default InteractiveEarth3D;
