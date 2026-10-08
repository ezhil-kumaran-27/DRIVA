import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import clsx from 'clsx';

const steps = [
  'Pickup location', 'Destination', 'Cargo type', 'Cargo weight', 
  'Dimensions', 'Vehicle', 'Deadline', 'Priority', 'Review'
];

export const CreateRequest = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/match/TR-999');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Transport Request</h1>
        <p className="text-gray-500 mt-1">Fill in the details to find the best transport match.</p>
      </div>

      <div className="card p-6">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 rounded"></div>
            <div 
              className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-brand-blue rounded transition-all duration-300"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            ></div>
            
            {steps.map((_, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center">
                <div className={clsx(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-colors bg-white",
                  idx < currentStep ? "border-brand-blue text-brand-blue" :
                  idx === currentStep ? "border-brand-blue bg-brand-blue text-white" :
                  "border-gray-300 text-gray-400"
                )}>
                  {idx < currentStep ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <span className="text-sm font-medium text-gray-900">{steps[currentStep]}</span>
          </div>
        </div>

        {/* Form Content */}
        <div className="min-h-[300px] flex flex-col justify-center py-4">
          {currentStep === 0 && (
            <div className="space-y-4">
              <label className="label">Pickup Location</label>
              <input type="text" className="input-field" placeholder="Enter full address or warehouse ID..." defaultValue="Warehouse A, Mumbai" />
            </div>
          )}
          {currentStep === 1 && (
            <div className="space-y-4">
              <label className="label">Destination</label>
              <input type="text" className="input-field" placeholder="Enter drop-off address..." defaultValue="Sector 14, New Delhi" />
            </div>
          )}
          {currentStep === 2 && (
            <div className="space-y-4">
              <label className="label">Cargo Type</label>
              <select className="input-field">
                <option>Electronics</option>
                <option>Pharmaceuticals</option>
                <option>Industrial Equipment</option>
                <option>FMCG</option>
                <option>Other</option>
              </select>
            </div>
          )}
          {currentStep === 3 && (
            <div className="space-y-4">
              <label className="label">Cargo Weight (kg)</label>
              <input type="number" className="input-field" placeholder="e.g. 500" defaultValue="700" />
            </div>
          )}
          {currentStep === 4 && (
            <div className="space-y-4">
              <label className="label">Cargo Dimensions (L x W x H in meters)</label>
              <div className="grid grid-cols-3 gap-4">
                <input type="number" className="input-field" placeholder="Length" defaultValue="2" />
                <input type="number" className="input-field" placeholder="Width" defaultValue="1.5" />
                <input type="number" className="input-field" placeholder="Height" defaultValue="1.5" />
              </div>
            </div>
          )}
          {currentStep === 5 && (
            <div className="space-y-4">
              <label className="label">Vehicle Requirement</label>
              <select className="input-field">
                <option>Any suitable truck</option>
                <option>Refrigerated (Reefer)</option>
                <option>Flatbed</option>
                <option>Closed Container</option>
              </select>
            </div>
          )}
          {currentStep === 6 && (
            <div className="space-y-4">
              <label className="label">Delivery Deadline</label>
              <input type="date" className="input-field" />
            </div>
          )}
          {currentStep === 7 && (
            <div className="space-y-4">
              <label className="label">Priority</label>
              <div className="space-y-2">
                {['Low', 'Normal', 'High', 'Urgent'].map(p => (
                  <label key={p} className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="priority" className="h-4 w-4 text-brand-blue border-gray-300 focus:ring-brand-blue" defaultChecked={p === 'Normal'} />
                    <span className="ml-3 font-medium text-gray-900">{p}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {currentStep === 8 && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-4 uppercase tracking-wide">Request Summary</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 text-sm">
                  <div><dt className="text-gray-500">Pickup</dt><dd className="font-medium text-gray-900">Warehouse A, Mumbai</dd></div>
                  <div><dt className="text-gray-500">Destination</dt><dd className="font-medium text-gray-900">Sector 14, New Delhi</dd></div>
                  <div><dt className="text-gray-500">Cargo</dt><dd className="font-medium text-gray-900">Electronics (700 kg)</dd></div>
                  <div><dt className="text-gray-500">Vehicle</dt><dd className="font-medium text-gray-900">Any suitable truck</dd></div>
                  <div><dt className="text-gray-500">Priority</dt><dd className="font-medium text-gray-900">Normal</dd></div>
                </dl>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
          <button 
            className="btn-secondary disabled:opacity-50" 
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            Back
          </button>
          <button 
            className="btn-primary flex items-center"
            onClick={handleNext}
          >
            {currentStep === steps.length - 1 ? 'Find Best Transport' : 'Continue'}
            <ArrowRight className="ml-2 w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
