import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useCityStore } from '../../store/cityStore';
import { Location, Road } from '../../types/city';
import * as THREE from 'three';

interface InstancedVehiclesProps {
  locations: Location[];
  roads: Road[];
}

// Vehicle configurations
const VEHICLE_CONFIGS = {
  cars: {
    geometry: [0.8, 0.4, 0.4],
    colors: ['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff', '#44ffff'],
    count: 60,
    speedRange: [0.08, 0.12]
  },
  buses: {
    geometry: [1.2, 0.6, 0.4],
    colors: ['#4a90e2', '#f5a623', '#7ed321'],
    count: 15,
    speedRange: [0.06, 0.08]
  },
  trucks: {
    geometry: [1.0, 0.5, 0.4],
    colors: ['#8b572a', '#9013fe', '#417505'],
    count: 25,
    speedRange: [0.05, 0.07]
  }
};

// Vehicle data structure
interface VehicleData {
  pathIndex: number;
  progress: number;
  speed: number;
  color: string;
  active: boolean;
}

// Generate traffic paths from roads
function generateTrafficPaths(roads: Road[], locations: Location[]) {
  return roads.map(road => {
    const from = locations.find(l => l.id === road.from);
    const to = locations.find(l => l.id === road.to);
    
    if (!from || !to) return null;
    
    const points = [
      new THREE.Vector3(...from.position),
      new THREE.Vector3(...to.position)
    ];
    
    return {
      curve: new THREE.CatmullRomCurve3(points),
      type: road.type
    };
  }).filter(Boolean);
}

// Individual vehicle type component
function InstancedVehicleType({ 
  type, 
  config, 
  vehicleData, 
  trafficPaths 
}: { 
  type: string; 
  config: any; 
  vehicleData: VehicleData[]; 
  trafficPaths: any[];
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { timeOfDay } = useCityStore();

  // Calculate traffic density based on time
  const trafficDensity = useMemo(() => {
    const hour = timeOfDay;
    if ((hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 18)) {
      return 1.5; // Rush hour
    }
    if (hour >= 9 && hour <= 16) {
      return 1.0; // Business hours
    }
    if (hour >= 23 || hour <= 5) {
      return 0.3; // Night
    }
    return 0.7; // Default
  }, [timeOfDay]);

  // Update vehicle positions
  useFrame((state, delta) => {
    if (!meshRef.current || trafficPaths.length === 0) return;

    const tempMatrix = new THREE.Matrix4();
    const tempPosition = new THREE.Vector3();
    const tempQuaternion = new THREE.Quaternion();
    const tempScale = new THREE.Vector3(1, 1, 1);
    let activeCount = 0;

    vehicleData.forEach((vehicle, i) => {
      if (!vehicle.active || !trafficPaths[vehicle.pathIndex]) return;

      const path = trafficPaths[vehicle.pathIndex];
      
      // Update progress
      vehicle.progress += vehicle.speed * delta * trafficDensity;
      if (vehicle.progress > 1) {
        vehicle.progress = 0;
        // Switch to random path
        vehicle.pathIndex = Math.floor(Math.random() * trafficPaths.length);
      }

      // Get position and direction
      const currentPoint = path.curve.getPointAt(vehicle.progress);
      const nextPoint = path.curve.getPointAt(Math.min(vehicle.progress + 0.01, 1));
      
      tempPosition.copy(currentPoint);
      tempPosition.y += config.geometry[1] / 2; // Lift to road surface
      
      // Calculate rotation
      const direction = nextPoint.clone().sub(currentPoint).normalize();
      const angle = Math.atan2(direction.x, direction.z);
      tempQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
      
      tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
      meshRef.current!.setMatrixAt(activeCount, tempMatrix);
      
      // Set color for this instance
      const colorIndex = i % config.colors.length;
      meshRef.current!.setColorAt(activeCount, new THREE.Color(config.colors[colorIndex]));
      
      activeCount++;
    });

    if (meshRef.current) {
      meshRef.current.instanceMatrix.needsUpdate = true;
      meshRef.current.instanceColor.needsUpdate = true;
      meshRef.current.count = activeCount;
    }
  });

  return (
    <instancedMesh 
      ref={meshRef}
      args={[undefined, undefined, config.count]}
      castShadow
    >
      <boxGeometry args={config.geometry} />
      <meshStandardMaterial 
        metalness={0.6} 
        roughness={0.4}
      />
    </instancedMesh>
  );
}

export function InstancedVehicles({ locations, roads }: InstancedVehiclesProps) {
  // Generate traffic paths
  const trafficPaths = useMemo(() => 
    generateTrafficPaths(roads, locations), 
  [roads, locations]);

  // Initialize vehicle data for each type
  const vehicleData = useMemo(() => {
    const data: Record<string, VehicleData[]> = {};
    
    Object.entries(VEHICLE_CONFIGS).forEach(([type, config]) => {
      data[type] = Array.from({ length: config.count }, (_, i) => ({
        pathIndex: Math.floor(Math.random() * trafficPaths.length),
        progress: Math.random(),
        speed: config.speedRange[0] + Math.random() * (config.speedRange[1] - config.speedRange[0]),
        color: config.colors[i % config.colors.length],
        active: i < config.count * 0.7 // 70% active by default
      }));
    });
    
    return data;
  }, [trafficPaths.length]);

  if (trafficPaths.length === 0) return null;

  return (
    <group name="instanced-vehicles">
      {Object.entries(VEHICLE_CONFIGS).map(([type, config]) => (
        <InstancedVehicleType
          key={type}
          type={type}
          config={config}
          vehicleData={vehicleData[type] || []}
          trafficPaths={trafficPaths}
        />
      ))}
    </group>
  );
}