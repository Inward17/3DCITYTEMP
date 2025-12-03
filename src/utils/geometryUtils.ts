import * as THREE from 'three';
import { mergeBufferGeometries } from 'three-stdlib';

export interface GeometryData {
  geometry: THREE.BufferGeometry;
  position: THREE.Vector3;
  rotation?: THREE.Quaternion;
  scale?: THREE.Vector3;
}

/**
 * Merge multiple geometries into a single optimized geometry
 * Useful for static infrastructure like sidewalks and road surfaces
 */
export function mergeGeometries(geometryDataList: GeometryData[]): THREE.BufferGeometry | null {
  if (geometryDataList.length === 0) return null;

  const geometries: THREE.BufferGeometry[] = [];
  const tempMatrix = new THREE.Matrix4();

  geometryDataList.forEach(({ geometry, position, rotation, scale }) => {
    const clonedGeometry = geometry.clone();

    // Create transformation matrix
    const position3 = new THREE.Vector3(position.x, position.y, position.z);
    const quaternion = rotation || new THREE.Quaternion();
    const scale3 = scale || new THREE.Vector3(1, 1, 1);

    tempMatrix.compose(position3, quaternion, scale3);
    clonedGeometry.applyMatrix4(tempMatrix);

    geometries.push(clonedGeometry);
  });

  return mergeBufferGeometries(geometries);
}

/**
 * Create a simple box geometry for sidewalks
 */
export function createSidewalkGeometry(
  width: number,
  length: number,
  height: number = 0.1
): THREE.BufferGeometry {
  return new THREE.BoxGeometry(width, height, length);
}

/**
 * Calculate bounding box for a set of positions
 */
export function calculateBoundingBox(positions: THREE.Vector3[]): THREE.Box3 {
  const box = new THREE.Box3();
  positions.forEach(pos => box.expandByPoint(pos));
  return box;
}

/**
 * Group geometries by proximity for optimal merging
 */
export function groupGeometriesByProximity(
  geometryDataList: GeometryData[],
  maxDistance: number = 10
): GeometryData[][] {
  if (geometryDataList.length === 0) return [];

  const groups: GeometryData[][] = [];
  const used = new Set<number>();

  geometryDataList.forEach((data, index) => {
    if (used.has(index)) return;

    const group: GeometryData[] = [data];
    used.add(index);

    geometryDataList.forEach((otherData, otherIndex) => {
      if (used.has(otherIndex)) return;

      const distance = data.position.distanceTo(otherData.position);
      if (distance <= maxDistance) {
        group.push(otherData);
        used.add(otherIndex);
      }
    });

    groups.push(group);
  });

  return groups;
}

/**
 * Dispose of geometry safely
 */
export function disposeGeometry(geometry: THREE.BufferGeometry | undefined): void {
  if (!geometry) return;
  geometry.dispose();
}

/**
 * Dispose of multiple geometries
 */
export function disposeGeometries(geometries: THREE.BufferGeometry[]): void {
  geometries.forEach(geometry => disposeGeometry(geometry));
}
