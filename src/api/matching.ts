import apiClient from './index';
import type { Recommendation } from '../types';

export const getSmartMatches = async (requestId: string): Promise<Recommendation[]> => {
  try {
    // For MVP, return mock data if API fails or is not connected
    const response = await apiClient.get(`/matching/${requestId}`);
    return response.data;
  } catch (error) {
    // Mock Data
    return [
      {
        id: 'rec_1',
        requestId,
        provider: {
          id: 'p1',
          name: 'ABC Logistics',
          rating: 4.8,
          reliability: 94,
          totalDeliveries: 1240,
          activeVehicles: 45
        },
        vehicle: {
          id: 'v1',
          providerId: 'p1',
          make: 'Volvo',
          model: 'FH16',
          licensePlate: 'ABC-1234',
          capacity: 700,
          type: 'Truck',
          status: 'available'
        },
        matchScore: 94,
        cost: 4800,
        etaHours: 7,
        capacity: 700,
        reasoning: 'Highest reliability score and fastest ETA for this route.'
      },
      {
        id: 'rec_2',
        requestId,
        provider: {
          id: 'p2',
          name: 'FastFreight Co.',
          rating: 4.5,
          reliability: 88,
          totalDeliveries: 890,
          activeVehicles: 20
        },
        vehicle: {
          id: 'v2',
          providerId: 'p2',
          make: 'Mercedes',
          model: 'Actros',
          licensePlate: 'XYZ-9876',
          capacity: 800,
          type: 'Truck',
          status: 'available'
        },
        matchScore: 82,
        cost: 4200,
        etaHours: 9,
        capacity: 800,
        reasoning: 'Lower cost alternative with slightly longer transit time.'
      }
    ];
  }
};
