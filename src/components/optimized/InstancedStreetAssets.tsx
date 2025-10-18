import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useCityStore } from '../../store/cityStore';
import { Location, Road } from '../../types/city';
import * as THREE from 'three';

interface InstancedStreetAssetsProps {
  locations: Location[];
  roads: Road[];
}

// Asset configurations for instancing
const STREET_ASSETS = {
  streetLamps: {
    geometry: () => {
      const pole = new THREE.CylinderGeometry(0.05, 0.05, 3);
      const light = new THREE.SphereGeometry(0.15);
      light.translate(0, 3.2, 0);
      return { pole, light };
    },
    spacing: 12,
    roadOffset: 2.5
  },
  trees: {
    geometry: () => ({
      trunk: new THREE.CylinderGeometry(0.1, 0.15, 1.2),
      foliage: new THREE.SphereGeometry(0.5)
    }),
    spacing: 8,
    roadOffset: 4
  },
  benches: {
    geometry: () => {
      const seat = new THREE.BoxGeometry(1.2, 0.1, 0.4);
      const back = new THREE.BoxGeometry(1.2, 0.5, 0.1);
      back.translate(0, 0.3, -0.15);
      return { seat, back };
    },
    spacing: 20,
    roadOffset: 3
  }
};

// Generate positions along roads
function generateAssetPositions(
  roads: Road[], 
  locations: Location[], 
  spacing: number, 
  offset: number
) {
  const positions: THREE.Vector3[] = [];
  const rotations: number[] = [];

  roads.forEach(road => {
    const from = locations.find(l => l.id === road.from);
    const to = locations.find(l => l.id === road.to);
    if (!from || !to) return;

    const roadLength = Math.sqrt(
      Math.pow(to.position[0] - from.position[0], 2) +
      Math.pow(to.position[2] - from.position[2], 2)
    );

    const itemCount = Math.floor(roadLength / spacing);
    const direction = new THREE.Vector2(
      to.position[0] - from.position[0],
      to.position[2] - from.position[2]
    ).normalize();
    const perpendicular = new THREE.Vector2(-direction.y, direction.x);

    for (let i = 1; i <= itemCount; i++) {
      const t = i / (itemCount + 1);
      const baseX = from.position[0] + (to.position[0] - from.position[0]) * t;
      const baseZ = from.position[2] + (to.position[2] - from.position[2]) * t;

      // Place on both sides of the road
      [1, -1].forEach(side => {
        const finalX = baseX + perpendicular.x * offset * side;
        const finalZ = baseZ + perpendicular.y * offset * side;

        // Check if position is clear of buildings
        const isClear = locations.every(loc => {
          const dist = Math.sqrt(
            Math.pow(finalX - loc.position[0], 2) +
            Math.pow(finalZ - loc.position[2], 2)
          );
          return dist > 3;
        });

        if (isClear) {
          positions.push(new THREE.Vector3(finalX, 0, finalZ));
          rotations.push(Math.atan2(direction.x, direction.y) + (side > 0 ? 0 : Math.PI));
        }
      });
    }
  });

  return { positions, rotations };
}

// Individual instanced asset component
function InstancedAsset({ 
  type, 
  positions, 
  rotations, 
  geometry 
}: { 
  type: string; 
  positions: THREE.Vector3[]; 
  rotations: number[];
  geometry: any;
}) {
  const mainMeshRef = useRef<THREE.InstancedMesh>(null);
  const secondaryMeshRef = useRef<THREE.InstancedMesh>(null);
  const { timeOfDay, weather } = useCityStore();
  
  const isNight = timeOfDay < 6 || timeOfDay > 18;

  // Update instance matrices
  useEffect(() => {
    if (!mainMeshRef.current || positions.length === 0) return;

    const tempMatrix = new THREE.Matrix4();
    const tempPosition = new THREE.Vector3();
    const tempQuaternion = new THREE.Quaternion();
    const tempScale = new THREE.Vector3(1, 1, 1);

    positions.forEach((position, i) => {
      tempPosition.copy(position);
      
      // Adjust height based on asset type
      if (type === 'trees') {
        tempPosition.y += 0.6; // Trunk height offset
      } else if (type === 'benches') {
        tempPosition.y += 0.05; // Slight elevation
      }

      tempQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotations[i]);
      
      // Add slight scale variation
      const scaleVariation = 0.9 + Math.random() * 0.2;
      tempScale.setScalar(scaleVariation);
      
      tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
      mainMeshRef.current!.setMatrixAt(i, tempMatrix);
    });

    mainMeshRef.current.instanceMatrix.needsUpdate = true;
    mainMeshRef.current.count = positions.length;

    // Handle secondary geometry (foliage for trees, back for benches, light for lamps)
    if (secondaryMeshRef.current && geometry.foliage) {
      positions.forEach((position, i) => {
        tempPosition.copy(position);
        tempPosition.y += type === 'trees' ? 1.2 : 3.2; // Foliage or light height
        
        tempQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotations[i]);
        const scaleVariation = 0.8 + Math.random() * 0.4;
        tempScale.setScalar(scaleVariation);
        
        tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
        secondaryMeshRef.current!.setMatrixAt(i, tempMatrix);
      });

      secondaryMeshRef.current.instanceMatrix.needsUpdate = true;
      secondaryMeshRef.current.count = positions.length;
    }
  }, [positions, rotations, type, geometry]);

  // Animate street lamps at night
  useFrame((state) => {
    if (type === 'streetLamps' && secondaryMeshRef.current && isNight) {
      const time = state.clock.getElapsedTime();
      
      // Subtle flickering effect
      positions.forEach((_, i) => {
        const tempMatrix = new THREE.Matrix4();
        secondaryMeshRef.current!.getMatrixAt(i, tempMatrix);
        
        const position = new THREE.Vector3();
        const quaternion = new THREE.Quaternion();
        const scale = new THREE.Vector3();
        tempMatrix.decompose(position, quaternion, scale);
        
        // Add subtle scale pulsing
        const pulse = 1 + Math.sin(time * 3 + i) * 0.05;
        scale.setScalar(pulse);
        
        tempMatrix.compose(position, quaternion, scale);
        secondaryMeshRef.current!.setMatrixAt(i, tempMatrix);
      });
      
      secondaryMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  if (positions.length === 0) return null;

  // Material properties based on type and weather
  const getMaterialProps = (isSecondary = false) => {
    if (type === 'streetLamps') {
      if (isSecondary) {
        return {
          color: isNight ? '#ffd700' : '#f0f0f0',
          emissive: isNight ? '#ffd700' : '#000000',
          emissiveIntensity: isNight ? 1.2 : 0,
          metalness: 0.1,
          roughness: 0.3
        };
      }
      return {
        color: '#666666',
        metalness: 0.8,
        roughness: 0.2
      };
    } else if (type === 'trees') {
      if (isSecondary) {
        let color = '#22c55e';
        if (weather === 'snow') color = '#a5d6a7';
        if (weather === 'rain') color = '#1b5e20';
        
        return {
          color,
          roughness: 0.8,
          metalness: 0.1
        };
      }
      return {
        color: '#4a3728',
        roughness: 0.9,
        metalness: 0.1
      };
    } else if (type === 'benches') {
      return {
        color: '#8b4513',
        roughness: 0.8,
        metalness: 0.1
      };
    }
    
    return {
      color: '#666666',
      roughness: 0.7,
      metalness: 0.3
    };
  };

  return (
    <group>
      {/* Main geometry (poles, trunks, seats) */}
      <instancedMesh 
        ref={mainMeshRef}
        args={[undefined, undefined, Math.max(positions.length, 1)]}
        castShadow
        receiveShadow
      >
        {type === 'streetLamps' ? (
          <cylinderGeometry args={[0.05, 0.05, 3]} />
        ) : type === 'trees' ? (
          <cylinderGeometry args={[0.1, 0.15, 1.2]} />
        ) : (
          <boxGeometry args={[1.2, 0.1, 0.4]} />
        )}
        <meshStandardMaterial {...getMaterialProps(false)} />
      </instancedMesh>

      {/* Secondary geometry (lights, foliage, backs) */}
      {(type === 'streetLamps' || type === 'trees') && (
        <instancedMesh 
          ref={secondaryMeshRef}
          args={[undefined, undefined, Math.max(positions.length, 1)]}
          castShadow
          receiveShadow
        >
          {type === 'streetLamps' ? (
            <sphereGeometry args={[0.15]} />
          ) : (
            <sphereGeometry args={[0.5]} />
          )}
          <meshStandardMaterial {...getMaterialProps(true)} />
        </instancedMesh>
      )}
    </group>
  );
}

export function InstancedStreetAssets({ locations, roads }: InstancedStreetAssetsProps) {
  // Generate positions for each asset type
  const assetData = useMemo(() => {
    const data: Record<string, { positions: THREE.Vector3[]; rotations: number[] }> = {};
    
    Object.entries(STREET_ASSETS).forEach(([type, config]) => {
      data[type] = generateAssetPositions(roads, locations, config.spacing, config.roadOffset);
    });
    
    return data;
  }, [roads, locations]);

  return (
    <group name="instanced-street-assets">
      {Object.entries(STREET_ASSETS).map(([type, config]) => (
        <InstancedAsset
          key={type}
          type={type}
          positions={assetData[type]?.positions || []}
          rotations={assetData[type]?.rotations || []}
          geometry={config.geometry()}
        />
      ))}
    </group>
  );
}