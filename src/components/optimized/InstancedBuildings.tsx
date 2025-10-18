import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useCityStore } from '../../store/cityStore';
import { Location } from '../../types/city';
import * as THREE from 'three';

interface InstancedBuildingsProps {
  locations: Location[];
}

// Building type configurations
const BUILDING_CONFIGS = {
  Building: { 
    geometry: [2, 4, 2], 
    color: '#60a5fa',
    instances: 50 
  },
  Hospital: { 
    geometry: [3, 3, 3], 
    color: '#ef4444',
    instances: 10 
  },
  School: { 
    geometry: [3, 2, 3], 
    color: '#fb923c',
    instances: 10 
  },
  Hotel: { 
    geometry: [2, 5, 2], 
    color: '#06b6d4',
    instances: 10 
  },
  Shop: { 
    geometry: [2, 1.5, 2], 
    color: '#a78bfa',
    instances: 20 
  },
  Restaurant: { 
    geometry: [2, 1.5, 2], 
    color: '#fbbf24',
    instances: 15 
  },
  Library: { 
    geometry: [2.5, 2, 2.5], 
    color: '#84cc16',
    instances: 5 
  },
  Cafe: { 
    geometry: [1.5, 1.2, 1.5], 
    color: '#f97316',
    instances: 15 
  },
  Museum: { 
    geometry: [3, 2, 3], 
    color: '#f472b6',
    instances: 5 
  }
};

// Window generation for buildings
function generateWindows(width: number, height: number, depth: number, isNight: boolean) {
  const windows = [];
  const rows = Math.floor(height / 0.4);
  const cols = Math.floor(width / 0.3);
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const isLit = isNight ? Math.random() > 0.4 : Math.random() > 0.7;
      const windowColor = isLit ? '#ffd700' : '#333333';
      
      windows.push({
        position: [
          (col - (cols - 1) / 2) * 0.3,
          row * 0.4 + 0.2,
          depth / 2 + 0.01
        ],
        color: windowColor,
        emissive: isLit ? windowColor : '#000000',
        emissiveIntensity: isLit ? 0.5 : 0
      });
    }
  }
  return windows;
}

// Individual building type component
function InstancedBuildingType({ 
  type, 
  locations, 
  config 
}: { 
  type: string; 
  locations: Location[]; 
  config: any 
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const windowMeshRef = useRef<THREE.InstancedMesh>(null);
  const { selectedLocation, timeOfDay, weather } = useCityStore();
  
  const isNight = timeOfDay < 6 || timeOfDay > 18;
  
  // Filter locations by type
  const typeLocations = useMemo(() => 
    locations.filter(loc => loc.type === type),
  [locations, type]);

  // Matrices for instances
  const { matrices, windowMatrices } = useMemo(() => {
    const matrices: THREE.Matrix4[] = [];
    const windowMatrices: THREE.Matrix4[] = [];
    const tempMatrix = new THREE.Matrix4();
    const tempPosition = new THREE.Vector3();
    const tempQuaternion = new THREE.Quaternion();
    const tempScale = new THREE.Vector3(1, 1, 1);

    typeLocations.forEach((location, index) => {
      // Main building matrix
      tempPosition.set(...location.position);
      tempPosition.y += config.geometry[1] / 2; // Lift to ground level
      tempQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * Math.PI * 2);
      
      // Add slight random scale variation
      const scaleVariation = 0.9 + Math.random() * 0.2;
      tempScale.setScalar(scaleVariation);
      
      tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
      matrices.push(tempMatrix.clone());

      // Generate windows for this building
      if (type !== 'Park') {
        const windows = generateWindows(
          config.geometry[0] * scaleVariation,
          config.geometry[1] * scaleVariation,
          config.geometry[2] * scaleVariation,
          isNight
        );

        windows.forEach(window => {
          tempPosition.set(
            location.position[0] + window.position[0],
            location.position[1] + window.position[1],
            location.position[2] + window.position[2]
          );
          tempQuaternion.copy(tempQuaternion); // Use building rotation
          tempScale.set(0.2, 0.3, 0.1);
          
          tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
          windowMatrices.push(tempMatrix.clone());
        });
      }
    });

    return { matrices, windowMatrices };
  }, [typeLocations, config, isNight]);

  // Update instance matrices
  useEffect(() => {
    if (meshRef.current && matrices.length > 0) {
      matrices.forEach((matrix, i) => {
        meshRef.current!.setMatrixAt(i, matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
      meshRef.current.count = matrices.length;
    }

    if (windowMeshRef.current && windowMatrices.length > 0) {
      windowMatrices.forEach((matrix, i) => {
        windowMeshRef.current!.setMatrixAt(i, matrix);
      });
      windowMeshRef.current.instanceMatrix.needsUpdate = true;
      windowMeshRef.current.count = windowMatrices.length;
    }
  }, [matrices, windowMatrices]);

  // Animate selected building
  useFrame((state) => {
    if (!meshRef.current || !selectedLocation) return;
    
    const selectedIndex = typeLocations.findIndex(loc => loc.id === selectedLocation.id);
    if (selectedIndex === -1) return;

    const time = state.clock.getElapsedTime();
    const matrix = new THREE.Matrix4();
    meshRef.current.getMatrixAt(selectedIndex, matrix);
    
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    matrix.decompose(position, quaternion, scale);
    
    // Add floating animation
    position.y += Math.sin(time * 3) * 0.1;
    matrix.compose(position, quaternion, scale);
    
    meshRef.current.setMatrixAt(selectedIndex, matrix);
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Determine color based on weather
  const buildingColor = useMemo(() => {
    let baseColor = config.color;
    if (weather === 'rain') {
      return new THREE.Color(baseColor).multiplyScalar(0.8);
    } else if (weather === 'snow') {
      return new THREE.Color(baseColor).lerp(new THREE.Color('#ffffff'), 0.3);
    }
    return new THREE.Color(baseColor);
  }, [config.color, weather]);

  if (typeLocations.length === 0) return null;

  return (
    <group>
      {/* Main buildings */}
      <instancedMesh 
        ref={meshRef} 
        args={[undefined, undefined, config.instances]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={config.geometry} />
        <meshStandardMaterial 
          color={buildingColor}
          metalness={0.3}
          roughness={0.7}
        />
      </instancedMesh>

      {/* Windows */}
      {type !== 'Park' && (
        <instancedMesh 
          ref={windowMeshRef} 
          args={[undefined, undefined, windowMatrices.length]}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color="#ffd700"
            emissive="#ffd700"
            emissiveIntensity={isNight ? 0.5 : 0}
            metalness={0.8}
            roughness={0.2}
          />
        </instancedMesh>
      )}
    </group>
  );
}

export function InstancedBuildings({ locations }: InstancedBuildingsProps) {
  // Group locations by type for efficient instancing
  const buildingTypes = useMemo(() => 
    Object.keys(BUILDING_CONFIGS),
  []);

  return (
    <>
      {buildingTypes.map(type => (
        <InstancedBuildingType
          key={type}
          type={type}
          locations={locations}
          config={BUILDING_CONFIGS[type]}
        />
      ))}
    </>
  );
}