import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Clock, IndianRupee, Truck, Info, Star } from 'lucide-react';
import { getSmartMatches } from '../../api/matching';
import type { Recommendation } from '../../types';

export const SmartMatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      const data = await getSmartMatches(id || '');
      setMatches(data);
      setLoading(false);
    };
    fetchMatches();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue"></div>
        <p className="mt-4 text-gray-500 font-medium">Running AI routing intelligence...</p>
      </div>
    );
  }

  const bestMatch = matches[0];
  const alternatives = matches.slice(1);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            DRIVA SMART MATCH
            <span className="ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Request {id}
            </span>
          </h1>
          <p className="text-gray-500 mt-1">Our AI evaluated 45+ providers to find the optimal transport for your cargo.</p>
        </div>
      </div>

      {bestMatch && (
        <div className="card border-2 border-brand-blue overflow-hidden relative">
          <div className="absolute top-0 right-0 bg-brand-blue text-white px-4 py-1 rounded-bl-lg font-medium text-sm flex items-center">
            <Star className="w-4 h-4 mr-1" /> Recommended
          </div>
          
          <div className="p-6 sm:p-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="h-16 w-16 bg-brand-100 rounded-lg flex items-center justify-center text-brand-700 text-2xl font-bold">
                    {bestMatch.provider.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{bestMatch.provider.name}</h2>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <ShieldCheck className="w-4 h-4 text-green-500 mr-1" />
                      Verified Partner • {bestMatch.provider.rating} Rating
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="text-sm text-gray-500 flex items-center mb-1"><Info className="w-3.5 h-3.5 mr-1"/> Match Score</div>
                    <div className="text-2xl font-bold text-brand-blue">{bestMatch.matchScore}/100</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="text-sm text-gray-500 flex items-center mb-1"><IndianRupee className="w-3.5 h-3.5 mr-1"/> Cost</div>
                    <div className="text-2xl font-bold text-gray-900">₹{bestMatch.cost.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="text-sm text-gray-500 flex items-center mb-1"><Clock className="w-3.5 h-3.5 mr-1"/> ETA</div>
                    <div className="text-2xl font-bold text-gray-900">{bestMatch.etaHours} hrs</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="text-sm text-gray-500 flex items-center mb-1"><ShieldCheck className="w-3.5 h-3.5 mr-1"/> Reliability</div>
                    <div className="text-2xl font-bold text-gray-900">{bestMatch.provider.reliability}%</div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm text-blue-900 flex items-start">
                  <Info className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-1">Why DRIVA recommended this:</span>
                    {bestMatch.reasoning}
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-64 flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-200 pt-6 md:pt-0 md:pl-8">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Vehicle Details</h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Truck className="w-4 h-4 mr-2 text-gray-400" />
                    {bestMatch.vehicle.make} {bestMatch.vehicle.model}
                  </div>
                  <div className="text-sm text-gray-600 mb-2 pl-6">
                    Capacity: {bestMatch.vehicle.capacity} kg
                  </div>
                  <div className="text-sm text-gray-600 pl-6">
                    Type: {bestMatch.vehicle.type}
                  </div>
                </div>
                
                <div className="mt-8">
                  <button 
                    className="w-full btn-primary py-3 text-base shadow-md"
                    onClick={() => navigate(`/book/${bestMatch.id}`)}
                  >
                    Book Now
                  </button>
                  <button className="w-full mt-3 text-sm font-medium text-brand-blue hover:text-brand-700">
                    View Provider Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {alternatives.length > 0 && (
        <div className="card overflow-hidden mt-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Alternative Providers</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ETA</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reliability</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match Score</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {alternatives.map((alt) => (
                  <tr key={alt.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{alt.provider.name}</div>
                      <div className="text-xs text-gray-500">{alt.provider.rating} Rating</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {alt.vehicle.make} ({alt.vehicle.capacity}kg)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      ₹{alt.cost.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {alt.etaHours} hrs
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {alt.provider.reliability}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium mr-2">{alt.matchScore}</span>
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="bg-brand-blue h-full" style={{ width: `${alt.matchScore}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        className="text-brand-blue hover:text-brand-700"
                        onClick={() => navigate(`/book/${alt.id}`)}
                      >
                        Book
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
