import React, { useMemo, useRef, useEffect } from 'react';
import { Compass, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Location, Road } from '../types/city';

interface MiniMapProps {
  locations: Location[];
  roads: Road[];
  viewPosition?: [number, number, number];
  onNavigate?: (position: [number, number, number]) => void;
}

export function MiniMap({ locations, roads, viewPosition = [0, 0, 0], onNavigate }: MiniMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);

  // Calculate bounds of the city
  const bounds = useMemo(() => {
    if (locations.length === 0) return { minX: -50, maxX: 50, minZ: -50, maxZ: 50 };
    
    const xs = locations.map(loc => loc.position[0]);
    const zs = locations.map(loc => loc.position[2]);
    
    return {
      minX: Math.min(...xs) - 10,
      maxX: Math.max(...xs) + 10,
      minZ: Math.min(...zs) - 10,
      maxZ: Math.max(...zs) + 10
    };
  }, [locations]);

  // Draw the mini map
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const { minX, maxX, minZ, maxZ } = bounds;
    
    // Clear canvas
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, width, height);
    
    // Apply transformations
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(zoom, zoom);
    ctx.rotate(rotation);
    ctx.translate(-width / 2, -height / 2);

    // Helper function to convert world coordinates to canvas coordinates
    const worldToCanvas = (x: number, z: number) => {
      const canvasX = ((x - minX) / (maxX - minX)) * width;
      const canvasZ = ((z - minZ) / (maxZ - minZ)) * height;
      return [canvasX, canvasZ];
    };

    // Draw roads
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 2;
    roads.forEach(road => {
      const fromLoc = locations.find(l => l.id === road.from);
      const toLoc = locations.find(l => l.id === road.to);
      
      if (fromLoc && toLoc) {
        const [fromX, fromZ] = worldToCanvas(fromLoc.position[0], fromLoc.position[2]);
        const [toX, toZ] = worldToCanvas(toLoc.position[0], toLoc.position[2]);
        
        ctx.beginPath();
        ctx.moveTo(fromX, fromZ);
        ctx.lineTo(toX, toZ);
        ctx.stroke();
      }
    });

    // Draw locations
    locations.forEach(location => {
      const [canvasX, canvasZ] = worldToCanvas(location.position[0], location.position[2]);
      
      // Different shapes for different types
      ctx.fillStyle = location.color || '#3b82f6';
      
      if (location.type === 'Park') {
        // Draw circle for parks
        ctx.beginPath();
        ctx.arc(canvasX, canvasZ, 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Draw rectangle for buildings
        ctx.fillRect(canvasX - 3, canvasZ - 3, 6, 6);
      }
    });

    // Draw current view position
    if (viewPosition) {
      const [viewX, viewZ] = worldToCanvas(viewPosition[0], viewPosition[2]);
      
      // Draw view indicator
      ctx.strokeStyle = '#ef4444';
      ctx.fillStyle = '#ef4444';
      ctx.lineWidth = 2;
      
      // Draw crosshair
      ctx.beginPath();
      ctx.moveTo(viewX - 8, viewZ);
      ctx.lineTo(viewX + 8, viewZ);
      ctx.moveTo(viewX, viewZ - 8);
      ctx.lineTo(viewX, viewZ + 8);
      ctx.stroke();
      
      // Draw center dot
      ctx.beginPath();
      ctx.arc(viewX, viewZ, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }, [locations, roads, bounds, zoom, rotation, viewPosition]);

  // Handle canvas click for navigation
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onNavigate) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert canvas coordinates back to world coordinates
    const { minX, maxX, minZ, maxZ } = bounds;
    const worldX = (x / canvas.width) * (maxX - minX) + minX;
    const worldZ = (y / canvas.height) * (maxZ - minZ) + minZ;
    
    onNavigate([worldX, 20, worldZ]); // Set Y to 20 for good viewing height
  };

  return (
    <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-700 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Compass className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-900 dark:text-white">Mini Map</span>
      </div>
      
      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={200}
          height={150}
          className="border border-gray-200 dark:border-gray-600 rounded cursor-crosshair"
          onClick={handleCanvasClick}
        />
        
        {/* Compass indicator */}
        <div 
          className="absolute top-2 right-2 w-6 h-6 bg-white dark:bg-gray-700 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-300"
          style={{ transform: `rotate(${-rotation}rad)` }}
        >
          N
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom(Math.min(3, zoom * 1.2))}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="h-3 w-3 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => setZoom(Math.max(0.5, zoom / 1.2))}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="h-3 w-3 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        
        <button
          onClick={() => {
            setZoom(1);
            setRotation(0);
          }}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title="Reset View"
        >
          <RotateCcw className="h-3 w-3 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
      
      {/* Legend */}
      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-sm" />
            <span>Buildings</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span>Parks</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <span>View</span>
          </div>
        </div>
      </div>
    </div>
  );
}