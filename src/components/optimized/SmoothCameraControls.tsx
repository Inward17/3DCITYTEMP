import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useCityStore } from '../../store/cityStore';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface CameraTransition {
  from: {
    position: THREE.Vector3;
    target: THREE.Vector3;
    fov: number;
  };
  to: {
    position: THREE.Vector3;
    target: THREE.Vector3;
    fov: number;
  };
  duration: number;
  easing: (t: number) => number;
  onComplete?: () => void;
}

// Advanced easing functions
const easingFunctions = {
  easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  easeOutQuart: (t: number) => 1 - Math.pow(1 - t, 4),
  easeInOutQuint: (t: number) => t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2,
  easeOutElastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  }
};

// Camera state manager
class CameraStateManager {
  private transitions: CameraTransition[] = [];
  private currentTransition: CameraTransition | null = null;
  private transitionStartTime: number = 0;
  private isTransitioning: boolean = false;

  addTransition(transition: CameraTransition) {
    this.transitions.push(transition);
  }

  update(camera: THREE.Camera, controls: any, deltaTime: number) {
    if (!this.isTransitioning && this.transitions.length > 0) {
      this.startNextTransition(camera, controls);
    }

    if (this.isTransitioning && this.currentTransition) {
      this.updateCurrentTransition(camera, controls, deltaTime);
    }
  }

  private startNextTransition(camera: THREE.Camera, controls: any) {
    this.currentTransition = this.transitions.shift()!;
    this.transitionStartTime = performance.now();
    this.isTransitioning = true;

    // Store current state as 'from'
    this.currentTransition.from = {
      position: camera.position.clone(),
      target: controls.target.clone(),
      fov: camera.fov
    };
  }

  private updateCurrentTransition(camera: THREE.Camera, controls: any, deltaTime: number) {
    if (!this.currentTransition) return;

    const elapsed = performance.now() - this.transitionStartTime;
    const progress = Math.min(elapsed / (this.currentTransition.duration * 1000), 1);
    const easedProgress = this.currentTransition.easing(progress);

    // Interpolate position
    camera.position.lerpVectors(
      this.currentTransition.from.position,
      this.currentTransition.to.position,
      easedProgress
    );

    // Interpolate target
    controls.target.lerpVectors(
      this.currentTransition.from.target,
      this.currentTransition.to.target,
      easedProgress
    );

    // Interpolate FOV
    camera.fov = THREE.MathUtils.lerp(
      this.currentTransition.from.fov,
      this.currentTransition.to.fov,
      easedProgress
    );
    camera.updateProjectionMatrix();

    // Check if transition is complete
    if (progress >= 1) {
      this.isTransitioning = false;
      if (this.currentTransition.onComplete) {
        this.currentTransition.onComplete();
      }
      this.currentTransition = null;
    }
  }

  isCurrentlyTransitioning(): boolean {
    return this.isTransitioning;
  }

  clearTransitions() {
    this.transitions = [];
    this.isTransitioning = false;
    this.currentTransition = null;
  }
}

export function SmoothCameraControls() {
  const { camera, gl } = useThree();
  const { cameraState, setCameraRefs } = useCityStore();
  const controlsRef = useRef<any>();
  const stateManagerRef = useRef<CameraStateManager>();

  // Initialize camera state manager
  useEffect(() => {
    stateManagerRef.current = new CameraStateManager();
  }, []);

  // Create enhanced controls
  const controls = useMemo(() => {
    if (!camera || !gl.domElement) return null;

    const controls = new OrbitControls(camera, gl.domElement);
    
    // Enhanced control settings
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 5;
    controls.maxDistance = 200;
    controls.maxPolarAngle = Math.PI / 2.1;
    
    // Smooth zoom
    controls.zoomSpeed = 0.5;
    controls.rotateSpeed = 0.5;
    controls.panSpeed = 0.8;
    
    // Auto-rotate for cinematic effect (can be toggled)
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.5;

    return controls;
  }, [camera, gl.domElement]);

  // Register controls with store
  useEffect(() => {
    if (camera && controls) {
      controlsRef.current = controls;
      setCameraRefs(camera, controls);
    }
  }, [camera, controls, setCameraRefs]);

  // Enhanced preset animations
  const animateToPreset = (preset: string) => {
    if (!stateManagerRef.current || !controls) return;

    const presets = {
      isometric: {
        position: new THREE.Vector3(30, 30, 30),
        target: new THREE.Vector3(0, 0, 0),
        fov: 50
      },
      aerial: {
        position: new THREE.Vector3(0, 80, 0),
        target: new THREE.Vector3(0, 0, 0),
        fov: 60
      },
      walkthrough: {
        position: new THREE.Vector3(0, 2, 10),
        target: new THREE.Vector3(0, 2, 0),
        fov: 75
      },
      cinematic: {
        position: new THREE.Vector3(50, 25, 50),
        target: new THREE.Vector3(0, 0, 0),
        fov: 45
      },
      free: {
        position: new THREE.Vector3(20, 20, 20),
        target: new THREE.Vector3(0, 0, 0),
        fov: 75
      }
    };

    const targetPreset = presets[preset];
    if (!targetPreset) return;

    const transition: CameraTransition = {
      from: {
        position: camera.position.clone(),
        target: controls.target.clone(),
        fov: camera.fov
      },
      to: targetPreset,
      duration: 2.5, // Longer, smoother transitions
      easing: easingFunctions.easeInOutCubic,
      onComplete: () => {
        // Enable auto-rotate for cinematic mode
        if (preset === 'cinematic') {
          controls.autoRotate = true;
        } else {
          controls.autoRotate = false;
        }
      }
    };

    stateManagerRef.current.addTransition(transition);
  };

  // Smooth fly-to-location
  const flyToLocation = (position: [number, number, number], offset: [number, number, number] = [10, 10, 10]) => {
    if (!stateManagerRef.current || !controls) return;

    const targetPosition = new THREE.Vector3(
      position[0] + offset[0],
      position[1] + offset[1],
      position[2] + offset[2]
    );
    const targetTarget = new THREE.Vector3(...position);

    const transition: CameraTransition = {
      from: {
        position: camera.position.clone(),
        target: controls.target.clone(),
        fov: camera.fov
      },
      to: {
        position: targetPosition,
        target: targetTarget,
        fov: 60
      },
      duration: 1.8,
      easing: easingFunctions.easeOutQuart
    };

    stateManagerRef.current.addTransition(transition);
  };

  // Update controls and state manager
  useFrame((state, delta) => {
    if (controls) {
      controls.update();
    }

    if (stateManagerRef.current) {
      stateManagerRef.current.update(camera, controls, delta);
    }
  });

  // Expose methods to store
  useEffect(() => {
    // You could expose these methods to the store for external use
    (window as any).cameraControls = {
      animateToPreset,
      flyToLocation,
      isTransitioning: () => stateManagerRef.current?.isCurrentlyTransitioning() || false
    };
  }, []);

  return null; // This component doesn't render anything
}