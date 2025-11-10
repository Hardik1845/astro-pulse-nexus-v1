import React, { useEffect, useRef, useState } from 'react';
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
  const satelliteMarkersRef = useRef<THREE.Mesh[]>([]);
  const atmosphereRef = useRef<THREE.Mesh | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 3.5;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true 
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Earth with realistic texture
    const earthGeometry = new THREE.SphereGeometry(1, 64, 64);
    
    // Create Earth texture with continents and oceans
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Ocean base
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, '#1a4d7a');
      gradient.addColorStop(0.3, '#2563eb');
      gradient.addColorStop(0.5, '#0ea5e9');
      gradient.addColorStop(0.7, '#14b8a6');
      gradient.addColorStop(1, '#1a4d7a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Continents
      ctx.fillStyle = '#10b981';
      ctx.globalAlpha = 0.7;
      
      // North America
      ctx.beginPath();
      ctx.ellipse(300, 400, 180, 200, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // South America
      ctx.beginPath();
      ctx.ellipse(400, 700, 120, 180, 0.3, 0, Math.PI * 2);
      ctx.fill();
      
      // Europe/Africa
      ctx.beginPath();
      ctx.ellipse(1000, 450, 150, 250, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Asia
      ctx.beginPath();
      ctx.ellipse(1400, 400, 250, 200, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Australia
      ctx.beginPath();
      ctx.ellipse(1600, 750, 100, 80, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Add grid lines for latitude/longitude
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 1;
      
      // Latitude lines
      for (let i = 0; i < 10; i++) {
        const y = (canvas.height / 10) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      // Longitude lines
      for (let i = 0; i < 20; i++) {
        const x = (canvas.width / 20) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
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

    // Atmosphere with dynamic intensity based on Kp index
    const atmosphereGeometry = new THREE.SphereGeometry(1.15, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      uniforms: {
        intensity: { value: 1.0 + (kpIndex || 0) / 9 }
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
          vec3 color = vec3(0.3, 0.6, 1.0);
          if (intensity > 1.5) {
            color = vec3(0.8, 0.4, 1.0); // Purple for high activity
          } else if (intensity > 1.2) {
            color = vec3(0.5, 0.5, 1.0); // Blue-purple
          }
          gl_FragColor = vec4(color, 1.0) * i * intensity;
        }
      `
    });
    
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    atmosphereRef.current = atmosphere;
    scene.add(atmosphere);

    // Function to convert lat/lon to 3D position
    const latLonToVector3 = (lat: number, lon: number, radius: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      
      return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    };

    // Create satellite markers with orbits
    const satelliteData = [
      { name: 'ISS', lat: 0, lon: 0, altitude: 1.065, color: 0xff0000, isISS: true },
      { name: 'Hubble', lat: 28.5, lon: -80.5, altitude: 1.09, color: 0x00ff00, isISS: false },
      { name: 'GPS III-5', lat: 0, lon: 0, altitude: 2.2, color: 0xffff00, isISS: false },
      { name: 'Starlink', lat: 53, lon: -60, altitude: 1.08, color: 0x00ff00, isISS: false },
      { name: 'GOES-18', lat: 0, lon: -137.2, altitude: 3.5, color: 0xff9900, isISS: false },
    ];

    const markers: THREE.Mesh[] = [];

    satelliteData.forEach((sat, idx) => {
      // Create satellite marker
     const satMaterial = new THREE.MeshPhongMaterial({ 
  color: sat.color,
  emissive: sat.color,
  emissiveIntensity: 1.2
});
      const satGeometry = new THREE.SphereGeometry(0.02, 16, 16);

      const satMesh = new THREE.Mesh(satGeometry, satMaterial);
      
      // Position satellite
      const position = latLonToVector3(sat.lat, sat.lon, sat.altitude);
      satMesh.position.copy(position);
      
      markers.push(satMesh);
      scene.add(satMesh);

      // Create orbit ring
      const orbitGeometry = new THREE.BufferGeometry();
      const orbitPoints: number[] = [];
      const segments = 100;
      
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const inclinationAngle = sat.isISS ? 0.9 : (idx * 0.3); // ISS has specific inclination
        
        const x = Math.cos(angle) * sat.altitude;
        const y = Math.sin(angle) * sat.altitude * Math.sin(inclinationAngle);
        const z = Math.sin(angle) * sat.altitude * Math.cos(inclinationAngle);
        
        orbitPoints.push(x, y, z);
      }
      
      orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(orbitPoints, 3));
      const orbitMaterial = new THREE.LineBasicMaterial({ 
        color: sat.color,
        transparent: true,
        opacity: 0.3
      });
      const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
      scene.add(orbitLine);

      // Add satellite name label (using sprite)
      const labelCanvas = document.createElement('canvas');
      labelCanvas.width = 256;
      labelCanvas.height = 64;
      const labelCtx = labelCanvas.getContext('2d');
      if (labelCtx) {
        labelCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        labelCtx.fillRect(0, 0, 256, 64);
        labelCtx.fillStyle = '#ffffff';
        labelCtx.font = 'bold 24px Arial';
        labelCtx.textAlign = 'center';
        labelCtx.fillText(sat.name, 128, 40);
      }
      
      const labelTexture = new THREE.CanvasTexture(labelCanvas);
      const labelMaterial = new THREE.SpriteMaterial({ map: labelTexture });
      const label = new THREE.Sprite(labelMaterial);
      label.position.copy(position);
      label.position.multiplyScalar(1.15);
      label.scale.set(0.4, 0.1, 1);
      scene.add(label);
    });

    satelliteMarkersRef.current = markers;

    // Add aurora zones at poles
    const createAuroraRing = (latitude: number, isNorth: boolean) => {
      const geometry = new THREE.RingGeometry(0.2, 0.35, 32);
      const material = new THREE.MeshBasicMaterial({
        color: 0x00ff88,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(geometry, material);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = isNorth ? 0.9 : -0.9;
      scene.add(ring);
      return ring;
    };

    const northAurora = createAuroraRing(70, true);
    const southAurora = createAuroraRing(-70, false);

    // Add impact zones (red zones for high Kp areas)
    if (kpIndex && kpIndex > 5) {
      const impactGeometry = new THREE.SphereGeometry(0.15, 16, 16);
      const impactMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.4
      });
      
      // High latitude impact zones
      const impacts = [
        latLonToVector3(65, -100, 1.02),
        latLonToVector3(70, 20, 1.02),
        latLonToVector3(-65, 140, 1.02)
      ];
      
      impacts.forEach(pos => {
        const impact = new THREE.Mesh(impactGeometry, impactMaterial);
        impact.position.copy(pos);
        scene.add(impact);
      });
    }

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

    const onMouseMove = (event: MouseEvent) => {
      if (!isHovering || !mountRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      targetRotationY = mouseX * 0.5;
      targetRotationX = mouseY * 0.5;
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      camera.position.z += event.deltaY * 0.001;
      camera.position.z = Math.max(2, Math.min(6, camera.position.z));
    };

    mountRef.current.addEventListener('mousemove', onMouseMove);
    mountRef.current.addEventListener('wheel', onWheel, { passive: false });

    // Animation loop
    let animationId: number;
    let time = 0;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.01;

      // Rotate Earth
      if (earthRef.current) {
        if (isHovering) {
          earth.rotation.y += (targetRotationY - earth.rotation.y) * 0.05;
          earth.rotation.x += (targetRotationX - earth.rotation.x) * 0.05;
        } else {
          earth.rotation.y += 0.001;
        }
      }

      // Update ISS position from real data
      if (issPosition && satelliteMarkersRef.current[0]) {
        const issPos = latLonToVector3(issPosition.latitude, issPosition.longitude, 1.065);
        satelliteMarkersRef.current[0].position.copy(issPos);
        
        // Pulse effect
        const scale = 1 + Math.sin(time * 3) * 0.3;
        satelliteMarkersRef.current[0].scale.set(scale, scale, scale);
      }

      // Animate other satellites in their orbits
      satelliteMarkersRef.current.forEach((marker, idx) => {
        if (idx !== 0) { // Skip ISS
          const orbitSpeed = 0.002 / (idx + 1);
          marker.rotation.y += orbitSpeed;
          
          // Pulse effect
          const scale = 1 + Math.sin(time * 2 + idx) * 0.2;
          marker.scale.set(scale, scale, scale);
        }
      });

      // Animate aurora rings
      northAurora.material.opacity = 0.3 + Math.sin(time) * 0.1;
      southAurora.material.opacity = 0.3 + Math.sin(time) * 0.1;

      // Update atmosphere based on Kp
     if (atmosphereRef.current && kpIndex) {
  const intensity = 1.0 + (kpIndex / 9) * 2;
  const mat = atmosphereRef.current.material;

  if (Array.isArray(mat)) {
    // Apply opacity to each material in the array
    mat.forEach(m => {
      if ('opacity' in m) {
        m.opacity = intensity / 3;
        m.transparent = true; // Ensure opacity takes effect
      }
    });
  } else if ('opacity' in mat) {
    // Single material
    mat.opacity = intensity / 3;
    mat.transparent = true;
  }
}



      // Rotate stars slowly
      stars.rotation.y += 0.0001;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current) {
        mountRef.current.removeEventListener('mousemove', onMouseMove);
        mountRef.current.removeEventListener('wheel', onWheel);
        if (mountRef.current.contains(renderer.domElement)) {
          mountRef.current.removeChild(renderer.domElement);
        }
      }
      renderer.dispose();
      
      // Dispose geometries and materials
      earthGeometry.dispose();
      earthMaterial.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
    };
  }, [issPosition, kpIndex, isHovering, satellites]);

  return (
    <div 
      ref={mountRef} 
      className="w-full h-full cursor-grab active:cursor-grabbing"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{ touchAction: 'none' }}
    />
  );
};

export default InteractiveEarth3D;