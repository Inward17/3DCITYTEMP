import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Instance, Instances } from '@react-three/drei';
import { useCityStore } from '../store/cityStore';
import { Location } from '../types/city';
import * as THREE from 'three';

function RainDrop({ initialPosition }) {
  const ref = useRef();
  const speed = useRef(-Math.random() * 0.2 - 0.2);
  const horizontalSpeed = useRef({
    x: (Math.random() - 0.5) * 0.02,
    z: (Math.random() - 0.5) * 0.02
  });
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y += speed.current;
      ref.current.position.x += horizontalSpeed.current.x;
      ref.current.position.z += horizontalSpeed.current.z;
      
      if (ref.current.position.y < 0) {
        ref.current.position.set(
          initialPosition[0] + (Math.random() - 0.5) * 60,
          initialPosition[1],
          initialPosition[2] + (Math.random() - 0.5) * 60
        );
      }
    }
  });

  return <Instance ref={ref} position={initialPosition} />;
}

function SnowFlake({ initialPosition }) {
  const ref = useRef();
  const speed = useRef({
    y: -Math.random() * 0.05 - 0.03,
    x: (Math.random() - 0.5) * 0.02,
    z: (Math.random() - 0.5) * 0.02
  });
  
  useFrame(() => {
    if (ref.current) {
      ref.current.position.y += speed.current.y;
      ref.current.position.x += speed.current.x;
      ref.current.position.z += speed.current.z;
      
      if (ref.current.position.y < 0) {
        ref.current.position.set(
          initialPosition[0] + (Math.random() - 0.5) * 60,
          initialPosition[1],
          initialPosition[2] + (Math.random() - 0.5) * 60
        );
      }
    }
  });

  return <Instance ref={ref} position={initialPosition} />;
}

function WetRoads({ locations, roads }) {
  // Generate puddles at intersections and low points
  const puddles = useMemo(() => {
    const puddlePositions = [];
    
    // Add puddles at major intersections
    roads.forEach((road, index) => {
      if (index % 2 === 0) { // Every other road to avoid too many puddles
        const from = locations.find(l => l.id === road.from);
        const to = locations.find(l => l.id === road.to);
        
        if (!from || !to) return;
        
        // Add puddle at midpoint
        const x = (from.position[0] + to.position[0]) / 2;
        const z = (from.position[2] + to.position[2]) / 2;
        
        puddlePositions.push({
          position: [x, 0, z],
          size: 0.5 + Math.random() * 1.0
        });
      }
    });
    
    // Add random puddles in open areas
    for (let i = 0; i < 15; i++) {
      puddlePositions.push({
        position: [
          (Math.random() - 0.5) * 100,
          0,
          (Math.random() - 0.5) * 100
        ],
        size: 0.3 + Math.random() * 0.7
      });
    }
    
    return puddlePositions;
  }, [roads, locations]);

  return (
    <>
      {puddles.map((puddle, i) => (
        <mesh 
          key={`puddle-${i}`}
          position={[puddle.position[0], 0.01, puddle.position[2]]} 
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[puddle.size, 16]} />
          <meshStandardMaterial
            color="#4a90e2"
            metalness={0.9}
            roughness={0.1}
            opacity={0.8}
            transparent
            envMapIntensity={1.5}
          />
        </mesh>
      ))}
    </>
  );
}

function SnowAccumulation({ locations }) {
  return (
    <>
      {/* Snow on ground */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial 
          color="white" 
          transparent 
          opacity={0.6}
          roughness={0.9}
        />
      </mesh>
      
      {/* Snow on building roofs */}
      {locations.map((location, i) => (
        <mesh 
          key={`snow-roof-${i}`}
          position={[location.position[0], 3, location.position[2]]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[2.5, 2.5]} />
          <meshStandardMaterial 
            color="white" 
            transparent 
            opacity={0.8}
            roughness={0.9}
          />
        </mesh>
      ))}
    </>
  );
}

interface WeatherProps {
  locations: Location[];
}

export function Weather({ locations }: WeatherProps) {
  const { weather, timeOfDay, roads } = useCityStore();
  const { scene } = useThree();
  
  // Dynamic fog based on weather
  useEffect(() => {
    if (weather === 'rain') {
      scene.fog = new THREE.FogExp2('#8ca9c0', 0.01);
    } else if (weather === 'snow') {
      scene.fog = new THREE.FogExp2('#e5e7eb', 0.008);
    } else {
      scene.fog = new THREE.FogExp2('#e0f2fe', 0.003);
    }
    
    return () => {
      scene.fog = null;
    };
  }, [weather, scene]);
  
  // Weather particles
  const particles = useMemo(() => {
    const count = weather === 'rain' ? 500 : weather === 'snow' ? 300 : 0;
    const spread = 80;
    const height = 30;
    
    return Array.from({ length: count }, () => [
      (Math.random() - 0.5) * spread,
      height + Math.random() * 10,
      (Math.random() - 0.5) * spread
    ]);
  }, [weather]);

  if (!weather || weather === 'clear') return null;

  return (
    <>
      {weather === 'rain' && (
        <>
          <Instances limit={500}>
            <cylinderGeometry args={[0.005, 0.005, 0.1]} />
            <meshBasicMaterial 
              color="#a8c8ff" 
              transparent 
              opacity={0.6}
            />
            {particles.map((position, i) => (
              <RainDrop key={`rain-${i}`} initialPosition={position} />
            ))}
          </Instances>
          <WetRoads locations={locations} roads={roads} />
        </>
      )}
      
      {weather === 'snow' && (
        <>
          <Instances limit={300}>
            <sphereGeometry args={[0.03]} />
            <meshBasicMaterial 
              color="white" 
              transparent 
              opacity={0.8}
            />
            {particles.map((position, i) => (
              <SnowFlake key={`snow-${i}`} initialPosition={position} />
            ))}
          </Instances>
          <SnowAccumulation locations={locations} />
        </>
      )}
    </>
  );
}