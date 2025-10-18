import { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useCityStore } from '../store/cityStore';

export function CameraControls() {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>();
  const { setCameraRefs, cameraState } = useCityStore();

  // Register camera and controls with the store
  useEffect(() => {
    if (camera && controlsRef.current) {
      setCameraRefs(camera, controlsRef.current);
    }
  }, [camera, setCameraRefs]);

  return (
    <OrbitControls 
      ref={controlsRef}
      args={[camera, gl.domElement]}
      enableDamping 
      dampingFactor={0.05}
      maxPolarAngle={Math.PI / 2.1}
      minDistance={5}
      maxDistance={200}
      enabled={!cameraState.isAnimating}
    />
  );
}