import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Location } from '../../types/city';
import * as THREE from 'three';

interface FrustumCullingProps {
  locations: Location[];
  children: React.ReactNode;
}

// Level of Detail (LOD) system
class LODManager {
  private camera: THREE.Camera;
  private frustum: THREE.Frustum = new THREE.Frustum();
  private cameraMatrix: THREE.Matrix4 = new THREE.Matrix4();

  constructor(camera: THREE.Camera) {
    this.camera = camera;
  }

  updateFrustum() {
    this.cameraMatrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
    this.frustum.setFromProjectionMatrix(this.cameraMatrix);
  }

  isInFrustum(position: THREE.Vector3, radius: number = 1): boolean {
    const sphere = new THREE.Sphere(position, radius);
    return this.frustum.intersectsSphere(sphere);
  }

  getDistanceToCamera(position: THREE.Vector3): number {
    return this.camera.position.distanceTo(position);
  }

  getLODLevel(distance: number): 'high' | 'medium' | 'low' | 'hidden' {
    if (distance < 20) return 'high';
    if (distance < 50) return 'medium';
    if (distance < 100) return 'low';
    return 'hidden';
  }
}

// Spatial partitioning for efficient culling
class OctreeNode {
  public bounds: THREE.Box3;
  public objects: Location[] = [];
  public children: OctreeNode[] = [];
  public isLeaf: boolean = true;
  private maxObjects: number = 10;
  private maxDepth: number = 5;

  constructor(bounds: THREE.Box3, depth: number = 0) {
    this.bounds = bounds;
  }

  insert(location: Location, depth: number = 0): void {
    if (!this.bounds.containsPoint(new THREE.Vector3(...location.position))) {
      return;
    }

    if (this.isLeaf && this.objects.length < this.maxObjects || depth >= this.maxDepth) {
      this.objects.push(location);
      return;
    }

    if (this.isLeaf) {
      this.subdivide();
    }

    for (const child of this.children) {
      child.insert(location, depth + 1);
    }
  }

  private subdivide(): void {
    const center = this.bounds.getCenter(new THREE.Vector3());
    const size = this.bounds.getSize(new THREE.Vector3());
    const halfSize = size.clone().multiplyScalar(0.5);

    // Create 8 child nodes
    for (let x = 0; x < 2; x++) {
      for (let y = 0; y < 2; y++) {
        for (let z = 0; z < 2; z++) {
          const min = new THREE.Vector3(
            center.x + (x - 0.5) * halfSize.x,
            center.y + (y - 0.5) * halfSize.y,
            center.z + (z - 0.5) * halfSize.z
          );
          const max = min.clone().add(halfSize);
          const childBounds = new THREE.Box3(min, max);
          this.children.push(new OctreeNode(childBounds));
        }
      }
    }

    // Redistribute objects to children
    for (const obj of this.objects) {
      for (const child of this.children) {
        child.insert(obj);
      }
    }

    this.objects = [];
    this.isLeaf = false;
  }

  query(frustum: THREE.Frustum, results: Location[] = []): Location[] {
    if (!frustum.intersectsBox(this.bounds)) {
      return results;
    }

    if (this.isLeaf) {
      results.push(...this.objects);
    } else {
      for (const child of this.children) {
        child.query(frustum, results);
      }
    }

    return results;
  }
}

export function FrustumCulling({ locations, children }: FrustumCullingProps) {
  const { camera } = useThree();
  const lodManagerRef = useRef<LODManager>();
  const octreeRef = useRef<OctreeNode>();
  const visibleLocationsRef = useRef<Set<string>>(new Set());

  // Initialize LOD manager and octree
  useEffect(() => {
    lodManagerRef.current = new LODManager(camera);
    
    // Calculate bounds for octree
    const bounds = new THREE.Box3();
    locations.forEach(location => {
      bounds.expandByPoint(new THREE.Vector3(...location.position));
    });
    bounds.expandByScalar(10); // Add padding

    octreeRef.current = new OctreeNode(bounds);
    locations.forEach(location => {
      octreeRef.current!.insert(location);
    });
  }, [camera, locations]);

  // Update visibility each frame
  useFrame(() => {
    if (!lodManagerRef.current || !octreeRef.current) return;

    const lodManager = lodManagerRef.current;
    lodManager.updateFrustum();

    // Query octree for potentially visible objects
    const potentiallyVisible = octreeRef.current.query(lodManager.frustum);
    const newVisibleSet = new Set<string>();

    potentiallyVisible.forEach(location => {
      const position = new THREE.Vector3(...location.position);
      const distance = lodManager.getDistanceToCamera(position);
      const lodLevel = lodManager.getLODLevel(distance);

      if (lodLevel !== 'hidden' && lodManager.isInFrustum(position, 2)) {
        newVisibleSet.add(location.id);
      }
    });

    visibleLocationsRef.current = newVisibleSet;
  });

  return <>{children}</>;
}

// Hook to access visibility information
export function useVisibility() {
  const visibilityRef = useRef<Set<string>>(new Set());
  
  return {
    isVisible: (id: string) => visibilityRef.current.has(id),
    getVisibleCount: () => visibilityRef.current.size
  };
}