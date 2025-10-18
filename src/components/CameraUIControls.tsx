import { Camera, Move3D, Eye, Plane, Film, RotateCcw } from 'lucide-react';
import { useCityStore } from '../store/cityStore';

export function CameraUIControls() {
  const { cameraState } = useCityStore();

  const handlePresetChange = (preset: string) => {
    // Use the enhanced camera controls
    if ((window as any).cameraControls) {
      (window as any).cameraControls.animateToPreset(preset);
    }
  };

  const isTransitioning = (window as any).cameraControls?.isTransitioning() || false;

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-lg shadow-lg dark:shadow-gray-900/20 p-3 border border-gray-200/50 dark:border-gray-700/50">
      <div className="flex items-center gap-2">
        <Camera className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-900 dark:text-white mr-3">Camera</span>
        
        <div className="flex gap-1">
          <button
            onClick={() => handlePresetChange('isometric')}
            disabled={isTransitioning}
            className={`px-3 py-1 text-xs rounded-md transition-all duration-200 flex items-center gap-1 ${
              cameraState.preset === 'isometric'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-gray-600/80 hover:shadow-sm'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Move3D className="h-3 w-3" />
            Isometric
          </button>
          
          <button
            onClick={() => handlePresetChange('aerial')}
            disabled={isTransitioning}
            className={`px-3 py-1 text-xs rounded-md transition-all duration-200 flex items-center gap-1 ${
              cameraState.preset === 'aerial'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-gray-600/80 hover:shadow-sm'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Plane className="h-3 w-3" />
            Aerial
          </button>
          
          <button
            onClick={() => handlePresetChange('walkthrough')}
            disabled={isTransitioning}
            className={`px-3 py-1 text-xs rounded-md transition-all duration-200 flex items-center gap-1 ${
              cameraState.preset === 'walkthrough'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-gray-600/80 hover:shadow-sm'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Eye className="h-3 w-3" />
            Walk
          </button>
          
          <button
            onClick={() => handlePresetChange('cinematic')}
            disabled={isTransitioning}
            className={`px-3 py-1 text-xs rounded-md transition-all duration-200 flex items-center gap-1 ${
              cameraState.preset === 'cinematic'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-gray-600/80 hover:shadow-sm'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Film className="h-3 w-3" />
            Cinematic
          </button>
          
          <button
            onClick={() => handlePresetChange('free')}
            disabled={isTransitioning}
            className={`px-3 py-1 text-xs rounded-md transition-all duration-200 flex items-center gap-1 ${
              cameraState.preset === 'free'
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 hover:bg-gray-200/80 dark:hover:bg-gray-600/80 hover:shadow-sm'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <RotateCcw className="h-3 w-3" />
            Free
          </button>
        </div>
      </div>
      
      {isTransitioning && (
        <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 text-center flex items-center justify-center gap-1">
          <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          Smooth transition...
        </div>
      )}
    </div>
  );
}