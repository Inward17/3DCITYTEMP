import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sky, Stars, Environment, Cloud } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { useCityStore } from '../../store/cityStore';
import * as THREE from 'three';

export function EnvironmentLayer() {
  const { timeOfDay, weather } = useCityStore();
  const { scene } = useThree();
  const isNight = timeOfDay < 6 || timeOfDay > 18;

  // Enhanced sun position calculation
  const sunPosition = useMemo(() => {
    const angle = (timeOfDay - 12) * (Math.PI / 12);
    return [
      Math.cos(angle) * 100,
      Math.sin(angle) * 100,
      0
    ] as [number, number, number];
  }, [timeOfDay]);

  // Dynamic lighting based on time and weather
  const ambientIntensity = useMemo(() => {
    let base = isNight ? 0.15 : 0.6;
    if (weather === 'rain') base *= 0.7;
    if (weather === 'snow') base *= 0.9;
    return base;
  }, [isNight, weather]);

  const directionalIntensity = useMemo(() => {
    let base = isNight ? 0.2 : 1.2;
    if (weather === 'rain') base *= 0.6;
    if (weather === 'snow') base *= 0.8;
    return base;
  }, [isNight, weather]);

  // Enhanced sky colors based on time of day
  const skyParams = useMemo(() => {
    if (isNight) {
      return {
        turbidity: 0.1,
        rayleigh: 0.3,
        mieCoefficient: 0.005,
        mieDirectionalG: 0.7,
      };
    }
    
    const hour = timeOfDay % 24;
    const isSunrise = hour >= 5 && hour <= 7;
    const isSunset = hour >= 17 && hour <= 19;
    
    if (isSunrise || isSunset) {
      return {
        turbidity: 10,
        rayleigh: 3,
        mieCoefficient: 0.1,
        mieDirectionalG: 0.6,
      };
    }
    
    return {
      turbidity: 6,
      rayleigh: 1,
      mieCoefficient: 0.005,
      mieDirectionalG: 0.8,
    };
  }, [timeOfDay, isNight]);

  // Dynamic fog based on weather and time
  const fogParams = useMemo(() => {
    let color = isNight ? '#001122' : '#ffffff';
    let near = 10;
    let far = 200;
    
    if (weather === 'rain') {
      color = '#8ca9c0';
      near = 5;
      far = 100;
    } else if (weather === 'snow') {
      color = '#e5e7eb';
      near = 8;
      far = 150;
    }
    
    return { color, near, far };
  }, [weather, isNight]);

  // Apply fog to scene
  useFrame(() => {
    if (scene.fog) {
      const fog = scene.fog as THREE.Fog;
      fog.color.setStyle(fogParams.color);
      fog.near = fogParams.near;
      fog.far = fogParams.far;
    } else {
      scene.fog = new THREE.Fog(fogParams.color, fogParams.near, fogParams.far);
    }
  });

  return (
    <>
      {/* Enhanced lighting system */}
      <ambientLight intensity={ambientIntensity} color={isNight ? '#4a5568' : '#ffffff'} />
      <directionalLight
        position={sunPosition}
        intensity={directionalIntensity}
        color={isNight ? '#6366f1' : '#ffffff'}
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-camera-far={200}
        shadow-camera-near={1}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
        shadow-bias={-0.0001}
      />
      
      {/* Hemisphere light for better ambient lighting */}
      <hemisphereLight
        skyColor={isNight ? '#1a202c' : '#87ceeb'}
        groundColor={isNight ? '#2d3748' : '#8fbc8f'}
        intensity={ambientIntensity * 0.6}
      />

      {/* Point lights for night illumination */}
      {isNight && (
        <>
          <pointLight position={[20, 15, 20]} intensity={0.5} color="#ffd700" distance={50} />
          <pointLight position={[-20, 15, -20]} intensity={0.5} color="#ffd700" distance={50} />
          <pointLight position={[20, 15, -20]} intensity={0.5} color="#ffd700" distance={50} />
          <pointLight position={[-20, 15, 20]} intensity={0.5} color="#ffd700" distance={50} />
        </>
      )}
      
      {/* Dynamic atmospheric effects */}
      {isNight ? (
        <>
          <Stars 
            radius={300} 
            depth={100} 
            count={8000} 
            factor={6} 
            fade 
            speed={0.5}
          />
          <Environment preset="night" />
        </>
      ) : (
        <>
          <Sky 
            {...skyParams}
            sunPosition={sunPosition} 
          />
          <Environment preset={weather === 'rain' ? 'city' : 'sunset'} />
          {weather === 'clear' && (
            <>
              <Cloud 
                opacity={0.4}
                speed={0.2}
                width={120}
                depth={2}
                segments={30}
                position={[50, 30, 0]}
              />
              <Cloud 
                opacity={0.3}
                speed={0.3}
                width={80}
                depth={1.5}
                segments={20}
                position={[-60, 25, 30]}
              />
            </>
          )}
        </>
      )}
      
      {/* Enhanced post-processing */}
      <EffectComposer>
        <Bloom 
          intensity={isNight ? 2 : 1.2}
          luminanceThreshold={isNight ? 0.4 : 0.6}
          luminanceSmoothing={0.9}
          radius={0.8}
        />
      </EffectComposer>
    </>
  );
}