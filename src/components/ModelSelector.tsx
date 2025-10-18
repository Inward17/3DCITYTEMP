import { useCityStore } from '../store/cityStore';
import { Building, Factory, Briefcase } from 'lucide-react';

export function ModelSelector() {
  const { modelType, setModelType } = useCityStore();

  return (
    <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Model Type</h3>
      <div className="flex gap-2">
        <button
          onClick={() => setModelType('planning')}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
            modelType === 'planning'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <Building className="w-4 h-4" />
          City Planning
        </button>
        <button
          onClick={() => setModelType('corporate')}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
            modelType === 'corporate'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Corporate Campus
        </button>
      </div>
    </div>
  );
}