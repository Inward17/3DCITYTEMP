import { Color } from 'three';

export type ZoneType = 
  // City Planning Types
  | 'residential'
  | 'industrial'
  | 'commercial'
  | 'healthcare'
  | 'education'
  | 'government'
  | 'transportation'
  | 'green'
  // Corporate Campus Types
  | 'admin'
  | 'research'
  | 'conference'
  | 'cafeteria'
  | 'clinic'
  | 'parking'
  | 'security';

export interface BuildingDensity {
  current: number;
  max: number;
  utilization: number;
}

export interface TrafficFlow {
  volume: number;
  capacity: number;
  peakHours: number[];
}

export interface ZoneStatistics {
  population?: number;
  employmentRate?: number;
  trafficDensity: number;
  buildingDensity: BuildingDensity;
  averageHeight: number;
  landValue: number;
}

export interface SecurityZone {
  level: 1 | 2 | 3 | 4 | 5;
  accessPoints: string[];
  restrictedAreas: string[];
}

export interface EmployeeAllocation {
  capacity: number;
  current: number;
  departments: string[];
}

export interface Location {
  id: string;
  name: string;
  type: 'Park' | 'Museum' | 'Restaurant' | 'Building' | 'Shop' | 'School' | 'Hospital' | 'Library' | 'Cafe' | 'Hotel';
  position: [number, number, number];
  description: string;
  color?: string;
  zone?: ZoneType;
  statistics?: ZoneStatistics;
  security?: SecurityZone;
  employees?: EmployeeAllocation;
  overlay?: {
    color: Color;
    opacity: number;
    height: number;
  };
}

export interface Road {
  id: string;
  from: string;
  to: string;
  distance: number;
  type: 'main' | 'secondary' | 'residential';
  traffic?: TrafficFlow;
}

export interface CityData {
  locations: Location[];
  roads: Road[];
  modelType?: 'planning' | 'corporate';
}

export interface ZoneOverlay {
  id: string;
  type: ZoneType;
  color: string;
  opacity: number;
  bounds: {
    min: [number, number];
    max: [number, number];
  };
}