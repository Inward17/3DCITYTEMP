import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Building, Activity, MapPin, Zap } from 'lucide-react';
import { Location, Road } from '../types/city';

interface SectorAnalyticsProps {
  locations: Location[];
  roads: Road[];
  activeSectors: string[];
  modelType: 'planning' | 'corporate';
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export function SectorAnalytics({ locations, roads, activeSectors, modelType }: SectorAnalyticsProps) {
  const analytics = useMemo(() => {
    // Calculate density per sector
    const sectorData = activeSectors.map((sector, index) => {
      const sectorLocations = locations.filter(loc => loc.zone === sector);
      const sectorRoads = roads.filter(road => {
        const fromLoc = locations.find(l => l.id === road.from);
        const toLoc = locations.find(l => l.id === road.to);
        return fromLoc?.zone === sector || toLoc?.zone === sector;
      });

      // Calculate metrics
      const density = sectorLocations.length;
      const usage = Math.min(100, density * 15 + Math.random() * 20); // Simulated usage
      const population = modelType === 'planning' 
        ? density * (150 + Math.random() * 100) // City planning: residents/workers
        : density * (50 + Math.random() * 30);   // Corporate: employees

      return {
        sector: sector.charAt(0).toUpperCase() + sector.slice(1),
        density,
        usage: Math.round(usage),
        population: Math.round(population),
        roads: sectorRoads.length,
        efficiency: Math.round(80 + Math.random() * 20),
        color: COLORS[index % COLORS.length]
      };
    });

    // Calculate hourly usage patterns
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const baseUsage = modelType === 'planning' 
        ? (hour >= 6 && hour <= 22 ? 60 + Math.sin((hour - 6) * Math.PI / 16) * 30 : 20)
        : (hour >= 8 && hour <= 18 ? 80 + Math.sin((hour - 8) * Math.PI / 10) * 20 : 15);
      
      return {
        hour: `${hour.toString().padStart(2, '0')}:00`,
        usage: Math.round(baseUsage + Math.random() * 10)
      };
    });

    // Calculate totals
    const totals = {
      totalBuildings: locations.length,
      totalPopulation: sectorData.reduce((sum, s) => sum + s.population, 0),
      averageUsage: Math.round(sectorData.reduce((sum, s) => sum + s.usage, 0) / sectorData.length),
      totalRoads: roads.length,
      averageEfficiency: Math.round(sectorData.reduce((sum, s) => sum + s.efficiency, 0) / sectorData.length)
    };

    return { sectorData, hourlyData, totals };
  }, [locations, roads, activeSectors, modelType]);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Building className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Buildings</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totals.totalBuildings}</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {modelType === 'planning' ? 'Population' : 'Employees'}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {analytics.totals.totalPopulation.toLocaleString()}
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Usage</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totals.averageUsage}%</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Roads</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totals.totalRoads}</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Efficiency</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totals.averageEfficiency}%</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Density Bar Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sector Density</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.sectorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="sector" 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="density" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Usage Distribution Pie Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Usage Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.sectorData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="usage"
                  label={({ sector, usage }) => `${sector}: ${usage}%`}
                  labelLine={false}
                >
                  {analytics.sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Usage Pattern */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">24-Hour Usage Pattern</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="hour" 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  interval={2}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Usage']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="usage" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Sector Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sector Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sector
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Buildings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {modelType === 'planning' ? 'Population' : 'Employees'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Roads
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Efficiency
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {analytics.sectorData.map((sector, index) => (
                <tr key={sector.sector} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: sector.color }}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {sector.sector}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {sector.density}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {sector.population.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
                        <div 
                          className="h-2 rounded-full"
                          style={{ 
                            width: `${sector.usage}%`,
                            backgroundColor: sector.color
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">{sector.usage}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {sector.roads}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      sector.efficiency >= 90 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : sector.efficiency >= 75
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                    }`}>
                      {sector.efficiency}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}