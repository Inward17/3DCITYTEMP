import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useCityStore } from '../../store/cityStore';
import { Location, Road } from '../../types/city';
import * as THREE from 'three';
import { mergeBufferGeometries } from 'three-stdlib';

interface BatchedStaticMeshesProps {
  locations: Location[];
  roads: Road[];
}

// Street furniture configurations
const STREET_FURNITURE = {
  streetLight: {
    geometry: () => {
      const pole = new THREE.CylinderGeometry(0.05, 0.05, 3);
      const light = new THREE.SphereGeometry(0.2);
      light.translate(0, 3.2, 0);
      return mergeBufferGeometries([pole, light]);
    },
    material: { color: '#666666', metalness: 0.8, roughness: 0.2 }
  },
  bench: {
    geometry: () => {
      const seat = new THREE.BoxGeometry(1.5, 0.1, 0.4);
      const back = new THREE.BoxGeometry(1.5, 0.6, 0.1);
      back.translate(0, 0.35, -0.15);
      const leg1 = new THREE.CylinderGeometry(0.02, 0.02, 0.4);
      const leg2 = new THREE.CylinderGeometry(0.02, 0.02, 0.4);
      leg1.translate(-0.6, -0.2, 0.15);
      leg2.translate(0.6, -0.2, 0.15);
      return mergeBufferGeometries([seat, back, leg1, leg2]);
    },
    material: { color: '#8b4513', metalness: 0.1, roughness: 0.8 }
  },
  trashCan: {
    geometry: () => new THREE.CylinderGeometry(0.2, 0.25, 0.8),
    material: { color: '#2d3748', metalness: 0.6, roughness: 0.4 }
  },
  signPost: {
    geometry: () => {
      const pole = new THREE.CylinderGeometry(0.03, 0.03, 2);
      const sign = new THREE.BoxGeometry(0.8, 0.4, 0.05);
      sign.translate(0, 2.2, 0);
      return mergeBufferGeometries([pole, sign]);
    },
    material: { color: '#1a365d', metalness: 0.3, roughness: 0.7 }
  }
};

// Generate positions for street furniture
function generateStreetFurniturePositions(
  locations: Location[], 
  roads: Road[], 
  type: string, 
  density: number
) {
  const positions: THREE.Vector3[] = [];
  const rotations: THREE.Euler[] = [];

  // Place furniture along roads
  roads.forEach(road => {
    const from = locations.find(l => l.id === road.from);
    const to = locations.find(l => l.id === road.to);
    if (!from || !to) return;

    const roadLength = Math.sqrt(
      Math.pow(to.position[0] - from.position[0], 2) +
      Math.pow(to.position[2] - from.position[2], 2)
    );

    const itemCount = Math.floor(roadLength / density);
    
    for (let i = 0; i < itemCount; i++) {
      const t = (i + 1) / (itemCount + 1);
      const x = from.position[0] + (to.position[0] - from.position[0]) * t;
      const z = from.position[2] + (to.position[2] - from.position[2]) * t;
      
      // Offset to roadside
      const roadDir = new THREE.Vector2(
        to.position[0] - from.position[0],
        to.position[2] - from.position[2]
      ).normalize();
      const perpendicular = new THREE.Vector2(-roadDir.y, roadDir.x);
      
      const offset = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random());
      const finalX = x + perpendicular.x * offset;
      const finalZ = z + perpendicular.y * offset;
      
      // Check if position is clear
      const isClear = locations.every(loc => {
        const dist = Math.sqrt(
          Math.pow(finalX - loc.position[0], 2) +
          Math.pow(finalZ - loc.position[2], 2)
        );
        return dist > 3;
      });
      
      if (isClear) {
        positions.push(new THREE.Vector3(finalX, 0, finalZ));
        rotations.push(new THREE.Euler(0, Math.random() * Math.PI * 2, 0));
      }
    }
  });

  // Place furniture around parks and public areas
  locations.forEach(location => {
    if (location.type === 'Park' || location.type === 'Library' || location.type === 'Museum') {
      const itemCount = type === 'streetLight' ? 8 : 4;
      const radius = type === 'streetLight' ? 6 : 4;
      
      for (let i = 0; i < itemCount; i++) {
        const angle = (i / itemCount) * Math.PI * 2;
        const distance = radius + Math.random() * 2;
        const x = location.position[0] + Math.cos(angle) * distance;
        const z = location.position[2] + Math.sin(angle) * distance;
        
        positions.push(new THREE.Vector3(x, 0, z));
        rotations.push(new THREE.Euler(0, angle + Math.PI, 0));
      }
    }
  });

  return { positions, rotations };
}

// Batched mesh component for each furniture type
function BatchedFurnitureType({ 
  type, 
  config, 
  positions, 
  rotations 
}: { 
  type: string; 
  config: any; 
  positions: THREE.Vector3[]; 
  rotations: THREE.Euler[] 
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { timeOfDay } = useCityStore();
  
  const isNight = timeOfDay < 6 || timeOfDay > 18;

  // Create batched geometry
  const batchedGeometry = useMemo(() => {
    if (positions.length === 0) return null;
    
    const geometries: THREE.BufferGeometry[] = [];
    const baseGeometry = config.geometry();
    
    positions.forEach((position, i) => {
      const geometry = baseGeometry.clone();
      const matrix = new THREE.Matrix4();
      matrix.makeRotationFromEuler(rotations[i]);
      matrix.setPosition(position);
      geometry.applyMatrix4(matrix);
      geometries.push(geometry);
    });
    
    return mergeBufferGeometries(geometries);
  }, [positions, rotations, config]);

  // Animate street lights at night
  useFrame((state) => {
    if (type === 'streetLight' && meshRef.current) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      if (isNight) {
        material.emissive.setHex(0xffd700);
        material.emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      } else {
        material.emissive.setHex(0x000000);
        material.emissiveIntensity = 0;
      }
    }
  });

  if (!batchedGeometry || positions.length === 0) return null;

  return (
    <mesh 
      ref={meshRef}
      geometry={batchedGeometry} 
      castShadow 
      receiveShadow
    >
      <meshStandardMaterial 
        {...config.material}
        emissive={type === 'streetLight' && isNight ? '#ffd700' : '#000000'}
        emissiveIntensity={type === 'streetLight' && isNight ? 0.3 : 0}
      />
    </mesh>
  );
}

export function BatchedStaticMeshes({ locations, roads }: BatchedStaticMeshesProps) {
  // Generate positions for all furniture types
  const furnitureData = useMemo(() => {
    const data: Record<string, { positions: THREE.Vector3[]; rotations: THREE.Euler[] }> = {};
    
    Object.keys(STREET_FURNITURE).forEach(type => {
      const density = type === 'streetLight' ? 15 : 
                    type === 'bench' ? 25 : 
                    type === 'trashCan' ? 20 : 30;
      
      data[type] = generateStreetFurniturePositions(locations, roads, type, density);
    });
    
    return data;
  }, [locations, roads]);

  return (
    <group name="batched-static-meshes">
      {Object.entries(STREET_FURNITURE).map(([type, config]) => (
        <BatchedFurnitureType
          key={type}
          type={type}
          config={config}
          positions={furnitureData[type]?.positions || []}
          rotations={furnitureData[type]?.rotations || []}
        />
      ))}
    </group>
  );
}