import { CityData } from '../types/city';

export const cityData: CityData = {
  locations: [
    // Government District
    {
      id: '1',
      name: 'City Hall',
      type: 'Building',
      position: [0, 0, 0],
      description: 'The central administrative building of the city.',
      color: '#3b82f6'
    },
    {
      id: '2',
      name: 'Police Headquarters',
      type: 'Building',
      position: [5, 0, 3],
      description: 'Main police station serving the city.',
      color: '#1d4ed8'
    },
    {
      id: '3',
      name: 'Fire Station',
      type: 'Building',
      position: [-5, 0, 3],
      description: 'Central fire station with emergency response units.',
      color: '#dc2626'
    },

    // Healthcare District
    {
      id: '4',
      name: 'Central Hospital',
      type: 'Hospital',
      position: [15, 0, 15],
      description: 'Major medical facility with emergency and specialist care.',
      color: '#ef4444'
    },
    {
      id: '5',
      name: 'Medical Center',
      type: 'Hospital',
      position: [20, 0, 18],
      description: 'Modern healthcare facility with outpatient services.',
      color: '#ef4444'
    },

    // Educational District
    {
      id: '6',
      name: 'Public Library',
      type: 'Library',
      position: [-15, 0, 15],
      description: 'Main library with extensive collection and study areas.',
      color: '#84cc16'
    },
    {
      id: '7',
      name: 'High School',
      type: 'School',
      position: [-20, 0, 18],
      description: 'Public high school with modern facilities.',
      color: '#fb923c'
    },
    {
      id: '8',
      name: 'Community College',
      type: 'School',
      position: [-18, 0, 12],
      description: 'Higher education institution serving local community.',
      color: '#fb923c'
    },

    // Commercial District
    {
      id: '9',
      name: 'Shopping Mall',
      type: 'Shop',
      position: [15, 0, -15],
      description: 'Large retail complex with diverse stores.',
      color: '#a78bfa'
    },
    {
      id: '10',
      name: 'Office Tower',
      type: 'Building',
      position: [18, 0, -18],
      description: 'Modern office building housing various businesses.',
      color: '#60a5fa'
    },
    {
      id: '11',
      name: 'Financial Center',
      type: 'Building',
      position: [12, 0, -12],
      description: 'Hub for banking and financial services.',
      color: '#60a5fa'
    },

    // Entertainment District
    {
      id: '12',
      name: 'Cinema Complex',
      type: 'Building',
      position: [-15, 0, -15],
      description: 'Multiplex cinema with latest entertainment.',
      color: '#8b5cf6'
    },
    {
      id: '13',
      name: 'Fine Dining Restaurant',
      type: 'Restaurant',
      position: [-18, 0, -18],
      description: 'Upscale restaurant with gourmet cuisine.',
      color: '#fbbf24'
    },
    {
      id: '14',
      name: 'Sports Arena',
      type: 'Building',
      position: [-12, 0, -12],
      description: 'Multi-purpose sports and events venue.',
      color: '#8b5cf6'
    },

    // Green Spaces
    {
      id: '15',
      name: 'Central Park',
      type: 'Park',
      position: [0, 0, -20],
      description: 'Large urban park with recreational facilities.',
      color: '#4ade80'
    },
    {
      id: '16',
      name: 'Botanical Gardens',
      type: 'Park',
      position: [0, 0, -25],
      description: 'Beautiful gardens with diverse plant species.',
      color: '#4ade80'
    },

    // Cultural District
    {
      id: '17',
      name: 'City Museum',
      type: 'Museum',
      position: [-25, 0, 0],
      description: 'Museum showcasing city history and culture.',
      color: '#f472b6'
    },
    {
      id: '18',
      name: 'Art Gallery',
      type: 'Museum',
      position: [-28, 0, -3],
      description: 'Contemporary art gallery with rotating exhibitions.',
      color: '#f472b6'
    },

    // Transport Hub
    {
      id: '19',
      name: 'Central Station',
      type: 'Building',
      position: [25, 0, 0],
      description: 'Main transportation hub connecting the city.',
      color: '#64748b'
    },
    {
      id: '20',
      name: 'Bus Terminal',
      type: 'Building',
      position: [28, 0, 3],
      description: 'Central bus station serving the city.',
      color: '#64748b'
    },

    // Residential Areas
    {
      id: '21',
      name: 'Luxury Hotel',
      type: 'Hotel',
      position: [0, 0, 20],
      description: 'Five-star hotel with premium amenities.',
      color: '#06b6d4'
    },
    {
      id: '22',
      name: 'Boutique Hotel',
      type: 'Hotel',
      position: [0, 0, 25],
      description: 'Charming boutique hotel in the city center.',
      color: '#06b6d4'
    },
    {
      id: '23',
      name: 'Cafe District',
      type: 'Cafe',
      position: [5, 0, 22],
      description: 'Popular area with various cafes and eateries.',
      color: '#f97316'
    },
    {
      id: '24',
      name: 'Shopping Street',
      type: 'Shop',
      position: [-5, 0, 22],
      description: 'Pedestrian-friendly shopping area.',
      color: '#a78bfa'
    }
  ],
  roads: [
    // Main arterial roads connecting districts
    {
      id: 'r1',
      from: '1',
      to: '4',
      distance: 500,
      type: 'main'
    },
    {
      id: 'r2',
      from: '1',
      to: '7',
      distance: 500,
      type: 'main'
    },
    {
      id: 'r3',
      from: '1',
      to: '9',
      distance: 500,
      type: 'main'
    },
    {
      id: 'r4',
      from: '1',
      to: '12',
      distance: 500,
      type: 'main'
    },
    {
      id: 'r5',
      from: '15',
      to: '1',
      distance: 400,
      type: 'main'
    },
    {
      id: 'r6',
      from: '21',
      to: '1',
      distance: 400,
      type: 'main'
    },

    // Healthcare district connections
    {
      id: 'r7',
      from: '4',
      to: '5',
      distance: 200,
      type: 'secondary'
    },
    {
      id: 'r8',
      from: '4',
      to: '19',
      distance: 300,
      type: 'main'
    },

    // Education district connections
    {
      id: 'r9',
      from: '6',
      to: '7',
      distance: 200,
      type: 'secondary'
    },
    {
      id: 'r10',
      from: '7',
      to: '8',
      distance: 200,
      type: 'secondary'
    },

    // Commercial district connections
    {
      id: 'r11',
      from: '9',
      to: '10',
      distance: 200,
      type: 'secondary'
    },
    {
      id: 'r12',
      from: '10',
      to: '11',
      distance: 200,
      type: 'secondary'
    },

    // Entertainment district connections
    {
      id: 'r13',
      from: '12',
      to: '13',
      distance: 200,
      type: 'secondary'
    },
    {
      id: 'r14',
      from: '13',
      to: '14',
      distance: 200,
      type: 'secondary'
    },

    // Green space connections
    {
      id: 'r15',
      from: '15',
      to: '16',
      distance: 200,
      type: 'residential'
    },

    // Cultural district connections
    {
      id: 'r16',
      from: '17',
      to: '18',
      distance: 200,
      type: 'secondary'
    },

    // Transport hub connections
    {
      id: 'r17',
      from: '19',
      to: '20',
      distance: 200,
      type: 'main'
    },

    // Residential area connections
    {
      id: 'r18',
      from: '21',
      to: '22',
      distance: 200,
      type: 'residential'
    },
    {
      id: 'r19',
      from: '23',
      to: '24',
      distance: 200,
      type: 'residential'
    },

    // Cross-district connections
    {
      id: 'r20',
      from: '4',
      to: '7',
      distance: 400,
      type: 'main'
    },
    {
      id: 'r21',
      from: '9',
      to: '12',
      distance: 400,
      type: 'main'
    },
    {
      id: 'r22',
      from: '15',
      to: '17',
      distance: 400,
      type: 'secondary'
    },
    {
      id: 'r23',
      from: '19',
      to: '21',
      distance: 400,
      type: 'main'
    },
    {
      id: 'r24',
      from: '2',
      to: '3',
      distance: 200,
      type: 'secondary'
    },
    {
      id: 'r25',
      from: '23',
      to: '21',
      distance: 200,
      type: 'residential'
    },
    {
      id: 'r26',
      from: '24',
      to: '22',
      distance: 200,
      type: 'residential'
    }
  ]
};