import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useCityStore } from '../../store/cityStore';
import { Location } from '../../types/city';
import * as THREE from 'three';

interface InstancedTreesProps {
  locations: Location[];
}

interface TreeInstance {
  position: THREE.Vector3;
  scale: THREE.Vector3;
}

function generateTreeInstances(parkLocation: Location): TreeInstance[] {
  const trees: TreeInstance[] = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const radius = 1 + Math.random() * 1.5;
    const scale = 0.8 + Math.random() * 0.4;

    trees.push({
      position: new THREE.Vector3(
        parkLocation.position[0] + Math.cos(angle) * radius,
        parkLocation.position[1],
        parkLocation.position[2] + Math.sin(angle) * radius
      ),
      scale: new THREE.Vector3(scale, scale, scale)
    });
  }
  return trees;
}

function ParkTrees({ location }: { location: Location }) {
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const foliageRef = useRef<THREE.InstancedMesh>(null);

  const trees = useMemo(() => generateTreeInstances(location), [location]);

  useEffect(() => {
    if (!trunkRef.current || !foliageRef.current || trees.length === 0) return;

    const tempMatrix = new THREE.Matrix4();
    const tempPosition = new THREE.Vector3();
    const tempQuaternion = new THREE.Quaternion();
    const tempScale = new THREE.Vector3();

    trees.forEach((tree, i) => {
      // Trunk
      tempPosition.copy(tree.position);
      tempPosition.y += 0.5 * tree.scale.y;
      tempScale.setScalar(0.1 * tree.scale.x);
      tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
      trunkRef.current!.setMatrixAt(i, tempMatrix);

      // Foliage
      tempPosition.copy(tree.position);
      tempPosition.y += 1.2 * tree.scale.y;
      tempScale.setScalar(0.5 * tree.scale.x);
      tempMatrix.compose(tempPosition, tempQuaternion, tempScale);
      foliageRef.current!.setMatrixAt(i, tempMatrix);
    });

    trunkRef.current.instanceMatrix.needsUpdate = true;
    foliageRef.current.instanceMatrix.needsUpdate = true;
  }, [trees]);

  return (
    <group position={location.position as [number, number, number]}>
      {/* Tree trunks */}
      <instancedMesh ref={trunkRef} args={[undefined, undefined, trees.length]}>
        <cylinderGeometry args={[0.1, 0.1, 1]} />
        <meshStandardMaterial color="#8b4513" />
      </instancedMesh>

      {/* Tree foliage */}
      <instancedMesh ref={foliageRef} args={[undefined, undefined, trees.length]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#22c55e" />
      </instancedMesh>

      {/* Park ground */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[3, 3, 0.1, 32]} />
        <meshStandardMaterial color="#4ade80" />
      </mesh>

      {/* Pathways */}
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1, 1.2, 32]} />
        <meshStandardMaterial color="#d6d3d1" />
      </mesh>
    </group>
  );
}

export function InstancedTrees({ locations }: InstancedTreesProps) {
  const parks = useMemo(() =>
    locations.filter(loc => loc.type === 'Park'),
  [locations]);

  return (
    <>
      {parks.map((location) => (
        <ParkTrees key={location.id} location={location} />
      ))}
    </>
  );
}
