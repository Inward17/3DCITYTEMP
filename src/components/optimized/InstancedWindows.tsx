import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useCityStore } from '../../store/cityStore';
import { Location } from '../../types/city';
import * as THREE from 'three';

interface InstancedWindowsProps {
  locations: Location[];
}

// Window data structure
interface WindowData {
  position: THREE.Vector3;
  scale: THREE.Vector3;
  isLit: boolean;
  buildingId: string;
}

// Generate all window positions and states
function generateWindowData(locations: Location[], timeOfDay: number): WindowData[] {
  const windows: WindowData[] = [];
  const isNight = timeOfDay < 6 || timeOfDay > 18;
  const isBusinessHours = timeOfDay >= 9 && timeOfDay <= 17;

  locations.forEach((location) => {
    if (location.type === 'Park') return;

    const dimensions = getBuildingDimensions(location.type);
    const rows = Math.floor(dimensions.height / 0.4);
    const cols = Math.floor(dimensions.width / 0.3);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Calculate lighting probability based on time and building type
        let lightProbability = 0.3;
        
        if (isNight) {
          lightProbability = location.type === 'Hospital' ? 0.8 : 
                           location.type === 'Hotel' ? 0.7 :
                           location.type === 'School' ? 0.2 : 0.5;
        } else if (isBusinessHours) {
          lightProbability = location.type === 'Building' ? 0.9 :
                           location.type === 'Hospital' ? 0.8 :
                           location.type === 'School' ? 0.9 : 0.6;
        }

        const isLit = Math.random() < lightProbability;

        // Front face windows
        windows.push({
          position: new THREE.Vector3(
            location.position[0] + (col - (cols - 1) / 2) * 0.3,
            location.position[1] + row * 0.4 + 0.2,
            location.position[2] + dimensions.depth / 2 + 0.01
          ),
          scale: new THREE.Vector3(0.2, 0.3, 0.05),
          isLit,
          buildingId: location.id
        });

        // Back face windows
        windows.push({
          position: new THREE.Vector3(
            location.position[0] + (col - (cols - 1) / 2) * 0.3,
            location.position[1] + row * 0.4 + 0.2,
            location.position[2] - dimensions.depth / 2 - 0.01
          ),
          scale: new THREE.Vector3(0.2, 0.3, 0.05),
          isLit,
          buildingId: location.id
        });

        // Side face windows (if building is wide enough)
        if (dimensions.depth > 1.5) {
          windows.push({
            position: new THREE.Vector3(
              location.position[0] + dimensions.width / 2 + 0.01,
              location.position[1] + row * 0.4 + 0.2,
              location.position[2] + (col - (cols - 1) / 2) * 0.3
            ),
            scale: new THREE.Vector3(0.05, 0.3, 0.2),
            isLit,
            buildingId: location.id
          });

          windows.push({
            position: new THREE.Vector3(
              location.position[0] - dimensions.width / 2 - 0.01,
              location.position[1] + row * 0.4 + 0.2,
              location.position[2] + (col - (cols - 1) / 2) * 0.3
            ),
            scale: new THREE.Vector3(0.05, 0.3, 0.2),
            isLit,
            buildingId: location.id
          });
        }
      }
    }
  });

  return windows;
}

function getBuildingDimensions(type: string) {
  switch (type) {
    case 'Building':
      return { width: 2, height: 4, depth: 2 };
    case 'Hospital':
      return { width: 3, height: 3, depth: 3 };
    case 'School':
      return { width: 3, height: 2, depth: 3 };
    case 'Hotel':
      return { width: 2, height: 5, depth: 2 };
    case 'Shop':
    case 'Restaurant':
    case 'Cafe':
      return { width: 2, height: 1.5, depth: 2 };
    case 'Library':
    case 'Museum':
      return { width: 2.5, height: 2, depth: 2.5 };
    default:
      return { width: 2, height: 2, depth: 2 };
  }
}

export function InstancedWindows({ locations }: InstancedWindowsProps) {
  const litWindowsRef = useRef<THREE.InstancedMesh>(null);
  const darkWindowsRef = useRef<THREE.InstancedMesh>(null);
  const { timeOfDay, selectedLocation } = useCityStore();

  // Generate window data
  const windowData = useMemo(() => 
    generateWindowData(locations, timeOfDay), 
  [locations, timeOfDay]);

  // Separate lit and dark windows for different materials
  const { litWindows, darkWindows } = useMemo(() => {
    const lit = windowData.filter(w => w.isLit);
    const dark = windowData.filter(w => !w.isLit);
    return { litWindows: lit, darkWindows: dark };
  }, [windowData]);

  // Update instanced matrices
  useEffect(() => {
    const tempMatrix = new THREE.Matrix4();
    const tempPosition = new THREE.Vector3();
    const tempQuaternion = new THREE.Quaternion();
    const tempScale = new THREE.Vector3();

    // Update lit windows
    if (litWindowsRef.current && litWindows.length > 0) {
      litWindows.forEach((window, i) => {
        tempPosition.copy(window.position);
        tempQuaternion.set(0, 0, 0, 1);
        tempScale.copy(window.scale);
        
        tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
        litWindowsRef.current!.setMatrixAt(i, tempMatrix);
      });
      
      litWindowsRef.current.instanceMatrix.needsUpdate = true;
      litWindowsRef.current.count = litWindows.length;
    }

    // Update dark windows
    if (darkWindowsRef.current && darkWindows.length > 0) {
      darkWindows.forEach((window, i) => {
        tempPosition.copy(window.position);
        tempQuaternion.set(0, 0, 0, 1);
        tempScale.copy(window.scale);
        
        tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
        darkWindowsRef.current!.setMatrixAt(i, tempMatrix);
      });
      
      darkWindowsRef.current.instanceMatrix.needsUpdate = true;
      darkWindowsRef.current.count = darkWindows.length;
    }
  }, [litWindows, darkWindows]);

  // Animate selected building windows
  useFrame((state) => {
    if (!selectedLocation || !litWindowsRef.current) return;

    const time = state.clock.getElapsedTime();
    const selectedWindows = litWindows.filter(w => w.buildingId === selectedLocation.id);
    
    selectedWindows.forEach((window, i) => {
      const globalIndex = litWindows.indexOf(window);
      if (globalIndex === -1) return;

      const tempMatrix = new THREE.Matrix4();
      litWindowsRef.current!.getMatrixAt(globalIndex, tempMatrix);
      
      const position = new THREE.Vector3();
      const quaternion = new THREE.Quaternion();
      const scale = new THREE.Vector3();
      tempMatrix.decompose(position, quaternion, scale);
      
      // Add subtle pulsing effect for selected building
      const pulse = 1 + Math.sin(time * 4) * 0.1;
      scale.multiplyScalar(pulse);
      
      tempMatrix.compose(position, quaternion, scale);
      litWindowsRef.current!.setMatrixAt(globalIndex, tempMatrix);
    });
    
    if (selectedWindows.length > 0) {
      litWindowsRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Lit windows - single draw call */}
      <instancedMesh 
        ref={litWindowsRef}
        args={[undefined, undefined, Math.max(litWindows.length, 1)]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#ffd700"
          emissive="#ffd700"
          emissiveIntensity={0.8}
          metalness={0.1}
          roughness={0.3}
        />
      </instancedMesh>

      {/* Dark windows - single draw call */}
      <instancedMesh 
        ref={darkWindowsRef}
        args={[undefined, undefined, Math.max(darkWindows.length, 1)]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.8}
          roughness={0.2}
        />
      </instancedMesh>
    </group>
  );
}