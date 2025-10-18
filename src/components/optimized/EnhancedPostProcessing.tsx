import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { 
  EffectComposer, 
  Bloom, 
  SMAA
} from '@react-three/postprocessing';
import { useCityStore } from '../../store/cityStore';
import * as THREE from 'three';

export function EnhancedPostProcessing() {
  const { timeOfDay, weather } = useCityStore();
  const { size } = useThree();
  const composerRef = useRef();

  const isNight = timeOfDay < 6 || timeOfDay > 18;

  // Minimal post-processing settings to avoid blur
  const effectSettings = useMemo(() => {
    let bloomIntensity = isNight ? 0.8 : 0.3; // Much reduced
    let bloomRadius = 0.2; // Very small radius

    // Weather adjustments (minimal)
    if (weather === 'rain') {
      bloomIntensity *= 0.8;
    } else if (weather === 'snow') {
      bloomIntensity *= 1.1;
    }

    return {
      bloom: {
        intensity: bloomIntensity,
        radius: bloomRadius,
        luminanceThreshold: 0.9, // High threshold to only affect very bright areas
        luminanceSmoothing: 0.5
      }
    };
  }, [timeOfDay, weather, isNight]);

  // High quality settings
  const qualitySettings = useMemo(() => {
    return {
      smaaPreset: 'ultra',
      bloomResolution: 512,
      multisampling: 8
    };
  }, []);

  return (
    <EffectComposer 
      ref={composerRef}
      multisampling={qualitySettings.multisampling}
      frameBufferType={THREE.HalfFloatType}
      stencilBuffer={false}
      depthBuffer={true}
    >
      {/* High-quality anti-aliasing only */}
      <SMAA preset={qualitySettings.smaaPreset as any} />
      
      {/* Minimal bloom only for lights at night */}
      {isNight && (
        <Bloom
          intensity={effectSettings.bloom.intensity}
          radius={effectSettings.bloom.radius}
          luminanceThreshold={effectSettings.bloom.luminanceThreshold}
          luminanceSmoothing={effectSettings.bloom.luminanceSmoothing}
          mipmapBlur={false}
          resolutionX={qualitySettings.bloomResolution}
          resolutionY={qualitySettings.bloomResolution}
        />
      )}
    </EffectComposer>
  );
}