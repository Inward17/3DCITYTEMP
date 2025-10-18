import { useState } from 'react';
import { Building, Trees, Landmark, UtensilsCrossed, Store, School, Guitar as Hospital, Library, Coffee, Hotel } from 'lucide-react';
import { useCityStore } from '../store/cityStore';

const buildingTypes = [
  { type: 'Building', icon: Building, label: 'Office Building' },
  { type: 'Park', icon: Trees, label: 'Park' },
  { type: 'Museum', icon: Landmark, label: 'Museum' },
  { type: 'Restaurant', icon: UtensilsCrossed, label: 'Restaurant' },
  { type: 'Shop', icon: Store, label: 'Shop' },
  { type: 'School', icon: School, label: 'School' },
  { type: 'Hospital', icon: Hospital, label: 'Hospital' },
  { type: 'Library', icon: Library, label: 'Library' },
  { type: 'Cafe', icon: Coffee, label: 'Cafe' },
  { type: 'Hotel', icon: Hotel, label: 'Hotel' },
] as const;

export function BuildingPlacement() {
  const {
    isPlacingBuilding,
    setIsPlacingBuilding,
    buildingTypeToPlace,
    setBuildingTypeToPlace,
  } = useCityStore();

  const [showPanel, setShowPanel] = useState(false);

  const handleBuildingSelect = (type: typeof buildingTypes[number]['type']) => {
    setBuildingTypeToPlace(type);
    setIsPlacingBuilding(true);
    setShowPanel(false);
  };

  return (
    <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
      >
        {showPanel ? 'Close' : 'Add Building'}
      </button>

      {showPanel && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg dark:shadow-gray-900/20 w-64 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Select Building Type</h3>
          <div className="grid grid-cols-2 gap-2">
            {buildingTypes.map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => handleBuildingSelect(type)}
                className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                  buildingTypeToPlace === type
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {isPlacingBuilding && (
        <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg shadow text-sm border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300">
          Click on the terrain to place the building
        </div>
      )}
    </div>
  );
}