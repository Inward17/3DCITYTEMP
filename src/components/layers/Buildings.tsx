import { useRef, useState, useMemo } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { useCityStore } from '../../store/cityStore';
import { Location } from '../../types/city';
import { MergedBuildingGeometry } from '../optimized/MergedBuildingGeometry';
import { InstancedWindows } from '../optimized/InstancedWindows';
import * as THREE from 'three';

interface BuildingsLayerProps {
  locations: Location[];
}

// Invisible interaction building for click/hover detection
function InteractionBuilding({ location, index }: { location: Location; index: number }) {
  const ref = useRef<THREE.Group>(null);
  const { selectedLocation, setSelectedLocation, timeOfDay } = useCityStore();
  const [hovered, setHovered] = useState(false);
  
  const isSelected = selectedLocation?.id === location.id;
  const isNight = timeOfDay < 6 || timeOfDay > 18;
  
  // Building dimensions based on type
  const dimensions = useMemo(() => {
    switch (location.type) {
      case 'Building':
        return { width: 2, height: 4, depth: 2 };
      case 'Hospital':
        return { width: 3, height: 3, depth: 3 };
      case 'School':
        return { width: 3, height: 2, depth: 3 };
      case 'Hotel':
        return { width: 2, height: 5, depth: 2 };
      default:
        return { width: 2, height: 2, depth: 2 };
    }
  }, [location.type]);

  // Animated selection highlighting
  useFrame((state) => {
    if (ref.current && isSelected) {
      const time = state.clock.getElapsedTime();
      ref.current.position.y = Math.sin(time * 3) * 0.1;
    } else if (ref.current) {
      ref.current.position.y = 0;
    }
  });

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    setSelectedLocation(location);
  };

  const color = useMemo(() => {
    if (isSelected) return '#3b82f6';
    if (hovered) return '#60a5fa';
    return location.color || '#64748b';
  }, [isSelected, hovered, location.color]);

  // Generate windows for buildings (optimized)
  const windows = useMemo(() => {
    if (location.type === 'Park') return [];
    
    const windowElements = [];
    const rows = Math.floor(dimensions.height / 0.6);
    const cols = Math.floor(dimensions.width / 0.4);
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const isLit = isNight ? Math.random() > 0.4 : Math.random() > 0.7;
        const windowColor = isLit ? '#ffd700' : '#333333';
        
        windowElements.push(
          <mesh
            key={`window-${row}-${col}`}
            position={[
              (col - (cols - 1) / 2) * 0.4,
              row * 0.6 + 0.3,
              dimensions.depth / 2 + 0.01
            ]}
          >
            <boxGeometry args={[0.3, 0.4, 0.05]} />
            <meshStandardMaterial
              color={windowColor}
              emissive={isLit ? windowColor : '#000000'}
              emissiveIntensity={isLit ? 0.5 : 0}
            />
          </mesh>
        );
      }
    }
    return windowElements;
  }, [location.type, dimensions, isNight]);

  return (
    <group 
      ref={ref}
      position={location.position as [number, number, number]}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Invisible interaction mesh */}
      <mesh
        position={[0, dimensions.height / 2, 0]}
        visible={false}
      >
        <boxGeometry args={[dimensions.width, dimensions.height, dimensions.depth]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Selection highlight ring */}
      {isSelected && (
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[dimensions.width + 0.5, dimensions.width + 0.8, 32]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.6} />
        </mesh>
      )}
      
      {/* Hover glow effect */}
      {hovered && !isSelected && (
        <mesh position={[0, dimensions.height / 2, 0]}>
          <boxGeometry args={[dimensions.width + 0.2, dimensions.height + 0.2, dimensions.depth + 0.2]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
}

// Park component with optimized trees
function ParkComponent({ location }: { location: Location }) {
  const { selectedLocation, setSelectedLocation } = useCityStore();
  const isSelected = selectedLocation?.id === location.id;
  
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    setSelectedLocation(location);
  };

  // Generate tree positions (memoized for performance)
  const treePositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 1 + Math.random() * 1.5;
      positions.push([
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      ]);
    }
    return positions;
  }, []);

  return (
    <group 
      position={location.position as [number, number, number]}
      onClick={handleClick}
    >
      {/* Ground */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[3, 3, 0.1, 32]} />
        <meshStandardMaterial color="#4ade80" />
      </mesh>
      
      {/* Trees */}
      {treePositions.map((pos, i) => (
        <group key={i} position={[pos[0], 0, pos[2]]}>
          {/* Tree trunk */}
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 1]} />
            <meshStandardMaterial color="#8b4513" />
          </mesh>
          {/* Tree foliage */}
          <mesh position={[0, 1.2, 0]}>
            <sphereGeometry args={[0.5]} />
            <meshStandardMaterial color="#22c55e" />
          </mesh>
        </group>
      ))}
      
      {/* Pathways */}
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1, 1.2, 32]} />
        <meshStandardMaterial color="#d6d3d1" />
      </mesh>
      
      {/* Selection highlight */}
      {isSelected && (
        <mesh position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.2, 3.6, 32]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}

export function BuildingsLayer({ locations }: BuildingsLayerProps) {
  const buildings = locations.filter(loc => loc.type !== 'Park');
  const parks = locations.filter(loc => loc.type === 'Park');

  return (
    <>
      {/* Merged building geometry - single draw call for all walls */}
      <MergedBuildingGeometry locations={buildings} />
      
      {/* Instanced windows - single draw call for all windows */}
      <InstancedWindows locations={buildings} />
      
      {/* Individual buildings for interaction (invisible) */}
      {buildings.map((location, index) => (
        <InteractionBuilding 
          key={location.id} 
          location={location} 
          index={index}
        />
      ))}
      
      {/* Parks */}
      {parks.map((location) => (
        <ParkComponent 
          key={location.id} 
          location={location}
        />
      ))}
    </>
  );
}