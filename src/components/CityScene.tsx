import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { Suspense } from 'react';
import { EnvironmentLayer } from './layers/Environment';
import { BuildingsLayer } from './layers/Buildings';
import { RoadsLayer } from './layers/Roads';
import { UILayer } from './layers/UI';
import { SmoothCameraControls } from './optimized/SmoothCameraControls';
import { EnhancedPostProcessing } from './optimized/EnhancedPostProcessing';
import { FrustumCulling } from './optimized/FrustumCulling';
import { InstancedTraffic } from './optimized/InstancedTraffic';
import { InstancedVegetation } from './optimized/InstancedVegetation';
import { InstancedStreetAssets } from './optimized/InstancedStreetAssets';
import { InstancedVehicles } from './optimized/InstancedVehicles';
import { Terrain } from './Terrain';
import { Weather } from './Weather';
import { Location, Road } from '../types/city';
import * as THREE from 'three';

interface CitySceneProps {
  locations: Location[];
  roads: Road[];
}

function SceneContent({ locations, roads }: CitySceneProps) {
  return (
    <Suspense fallback={null}>
      {/* Camera */}
      <PerspectiveCamera 
        makeDefault 
        position={[20, 20, 20]} 
        fov={75}
        near={0.1}
        far={1000}
      />
      
      {/* Enhanced Camera Controls */}
      <SmoothCameraControls />
      
      {/* Frustum Culling Wrapper */}
      <FrustumCulling locations={locations}>
        {/* Environment layer - lighting, sky, fog */}
        <EnvironmentLayer />
        
        {/* Terrain base */}
        <Terrain locations={locations} roads={roads} />
        
        {/* Buildings layer - back to original with optimizations */}
        <BuildingsLayer locations={locations} />
        
        {/* Roads layer - spline-based roads */}
        <RoadsLayer locations={locations} roads={roads} />
        
        {/* Optimized instanced elements - single draw calls */}
        <InstancedStreetAssets locations={locations} roads={roads} />
        <InstancedVehicles locations={locations} roads={roads} />
        <InstancedVegetation locations={locations} roads={roads} />
        <Weather locations={locations} />
        
        {/* UI layer - tooltips and overlays */}
        <UILayer locations={locations} />
      </FrustumCulling>
      
      {/* Minimal Post-Processing */}
      <EnhancedPostProcessing />
    </Suspense>
  );
}

export function CityScene({ locations, roads }: CitySceneProps) {
  return (
    <Canvas 
      shadows
      gl={{ 
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        stencil: false,
        physicallyCorrectLights: true,
        // Enable shadow mapping
        shadowMap: {
          enabled: true,
          type: THREE.PCFSoftShadowMap
        },
        // Fix blurriness with proper pixel ratio
        pixelRatio: Math.min(window.devicePixelRatio, 2),
        // Ensure proper color space
        outputColorSpace: THREE.SRGBColorSpace,
        // Improve rendering quality
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0
      }}
      camera={{ fov: 75, near: 0.1, far: 1000 }}
      performance={{ min: 0.5 }}
      dpr={[1, 2]}
      frameloop="demand" // Only render when needed
    >
      <SceneContent locations={locations} roads={roads} />
    </Canvas>
  );
}