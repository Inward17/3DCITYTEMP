import { useRef, useMemo } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { useCityStore } from '../../store/cityStore';
import { Location } from '../../types/city';
import { MergedBuildingGeometry } from '../optimized/MergedBuildingGeometry';
import { InstancedWindows } from '../optimized/InstancedWindows';
import { LODBuildings } from '../optimized/LODBuildings';
import { InstancedTrees } from '../optimized/InstancedTrees';
import * as THREE from 'three';

interface BuildingsLayerProps {
  locations: Location[];
}

function InteractionLayer({ location }: { location: Location }) {
  const ref = useRef<THREE.Mesh>(null);
  const { setSelectedLocation } = useCityStore();

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

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    setSelectedLocation(location);
  };

  return (
    <mesh
      ref={ref}
      position={[location.position[0], location.position[1] + dimensions.height / 2, location.position[2]]}
      onClick={handleClick}
      visible={false}
    >
      <boxGeometry args={[dimensions.width, dimensions.height, dimensions.depth]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}

function ParkInteractionLayer({ location }: { location: Location }) {
  const ref = useRef<THREE.Mesh>(null);
  const { setSelectedLocation } = useCityStore();

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    setSelectedLocation(location);
  };

  return (
    <mesh
      ref={ref}
      position={[location.position[0], location.position[1] + 0.05, location.position[2]]}
      rotation={[-Math.PI / 2, 0, 0]}
      onClick={handleClick}
      visible={false}
    >
      <cylinderGeometry args={[3, 3, 0.1, 32]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}

export function BuildingsLayer({ locations }: BuildingsLayerProps) {
  const buildings = useMemo(() => locations.filter(loc => loc.type !== 'Park'), [locations]);
  const parks = useMemo(() => locations.filter(loc => loc.type === 'Park'), [locations]);

  return (
    <>
      {/* Merged building geometry - single draw call for all walls */}
      <MergedBuildingGeometry locations={buildings} />

      {/* Instanced windows - single draw call for all windows */}
      <InstancedWindows locations={buildings} />

      {/* LOD buildings - optimized with level of detail */}
      <LODBuildings locations={buildings} />

      {/* Invisible interaction layer for buildings */}
      {buildings.map((location) => (
        <InteractionLayer key={location.id} location={location} />
      ))}

      {/* Instanced trees for parks */}
      <InstancedTrees locations={parks} />

      {/* Invisible interaction layer for parks */}
      {parks.map((location) => (
        <ParkInteractionLayer key={location.id} location={location} />
      ))}
    </>
  );
}