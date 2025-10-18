import { Html } from '@react-three/drei';
import { useCityStore } from '../../store/cityStore';
import { Location } from '../../types/city';

interface UILayerProps {
  locations: Location[];
}

export function UILayer({ locations }: UILayerProps) {
  const { selectedLocation } = useCityStore();

  return (
    <>
      {/* Dynamic tooltips for locations */}
      {locations.map((location) => (
        <group key={`tooltip-${location.id}`} position={location.position as [number, number, number]}>
          <Html
            position={[0, 4, 0]}
            center
            distanceFactor={10}
            occlude
            style={{
              pointerEvents: 'none',
              opacity: selectedLocation?.id === location.id ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out'
            }}
          >
            <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 text-sm">
              <div className="font-semibold text-gray-900 dark:text-white">{location.name}</div>
              <div className="text-gray-600 dark:text-gray-400">{location.type}</div>
            </div>
          </Html>
        </group>
      ))}
    </>
  );
}