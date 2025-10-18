import { useRef, useState } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { useCityStore } from '../store/cityStore';
import { LocationModel } from './LocationModel';
import { Location } from '../types/city';

interface LocationsProps {
  locations: Location[];
}

export function Locations({ locations }: LocationsProps) {
  const { setSelectedLocation } = useCityStore();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleClick = (event: ThreeEvent<MouseEvent>, locationId: string) => {
    event.stopPropagation();
    const location = locations.find(loc => loc.id === locationId);
    if (location) {
      setSelectedLocation(location);
    }
  };

  return (
    <>
      {locations.map((location) => (
        <group 
          key={location.id} 
          position={location.position as [number, number, number]}
          onClick={(e) => handleClick(e, location.id)}
          onPointerOver={() => setHoveredId(location.id)}
          onPointerOut={() => setHoveredId(null)}
        >
          <LocationModel 
            location={location} 
            isHovered={hoveredId === location.id} 
          />
        </group>
      ))}
    </>
  );
}