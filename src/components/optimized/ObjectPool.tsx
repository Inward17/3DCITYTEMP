import { useRef, useMemo } from 'react';
import * as THREE from 'three';

// Generic object pool for reusing Three.js objects
export class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;
  private maxSize: number;

  constructor(createFn: () => T, resetFn: (obj: T) => void, initialSize = 10, maxSize = 100) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;
    
    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }

  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.createFn();
  }

  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.resetFn(obj);
      this.pool.push(obj);
    }
  }

  clear(): void {
    this.pool.length = 0;
  }

  get size(): number {
    return this.pool.length;
  }
}

// Specific pools for common Three.js objects
export const useObjectPools = () => {
  const matrixPool = useMemo(() => new ObjectPool(
    () => new THREE.Matrix4(),
    (matrix) => matrix.identity(),
    20,
    100
  ), []);

  const vector3Pool = useMemo(() => new ObjectPool(
    () => new THREE.Vector3(),
    (vector) => vector.set(0, 0, 0),
    50,
    200
  ), []);

  const quaternionPool = useMemo(() => new ObjectPool(
    () => new THREE.Quaternion(),
    (quat) => quat.set(0, 0, 0, 1),
    20,
    100
  ), []);

  const eulerPool = useMemo(() => new ObjectPool(
    () => new THREE.Euler(),
    (euler) => euler.set(0, 0, 0),
    20,
    100
  ), []);

  return {
    matrixPool,
    vector3Pool,
    quaternionPool,
    eulerPool
  };
};

// Transform update manager to avoid creating new objects in render loop
export class TransformUpdateManager {
  private tempMatrix = new THREE.Matrix4();
  private tempPosition = new THREE.Vector3();
  private tempQuaternion = new THREE.Quaternion();
  private tempScale = new THREE.Vector3();

  updateInstanceMatrix(
    instancedMesh: THREE.InstancedMesh,
    index: number,
    position: THREE.Vector3,
    rotation?: THREE.Euler | THREE.Quaternion,
    scale?: THREE.Vector3 | number
  ): void {
    this.tempPosition.copy(position);
    
    if (rotation instanceof THREE.Euler) {
      this.tempQuaternion.setFromEuler(rotation);
    } else if (rotation instanceof THREE.Quaternion) {
      this.tempQuaternion.copy(rotation);
    } else {
      this.tempQuaternion.set(0, 0, 0, 1);
    }
    
    if (typeof scale === 'number') {
      this.tempScale.setScalar(scale);
    } else if (scale instanceof THREE.Vector3) {
      this.tempScale.copy(scale);
    } else {
      this.tempScale.set(1, 1, 1);
    }
    
    this.tempMatrix.compose(this.tempPosition, this.tempQuaternion, this.tempScale);
    instancedMesh.setMatrixAt(index, this.tempMatrix);
  }

  markNeedsUpdate(instancedMesh: THREE.InstancedMesh): void {
    instancedMesh.instanceMatrix.needsUpdate = true;
  }
}

// Hook for transform updates
export const useTransformManager = () => {
  const manager = useRef(new TransformUpdateManager());
  return manager.current;
};