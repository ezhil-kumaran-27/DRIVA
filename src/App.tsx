import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { BusinessDashboard } from './pages/dashboard/BusinessDashboard';
import { CreateRequest } from './pages/transport/CreateRequest';
import { SmartMatch } from './pages/transport/SmartMatch';
import { DeliveryTracking } from './pages/tracking/DeliveryTracking';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<BusinessDashboard />} />
          <Route path="/request/create" element={<CreateRequest />} />
          <Route path="/match/:id" element={<SmartMatch />} />
          <Route path="/tracking/:id?" element={<DeliveryTracking />} />
          
          {/* Placeholders for other routes */}
          <Route path="/deliveries" element={<div className="p-8 text-center text-gray-500">Active Deliveries Page (Coming Soon)</div>} />
          <Route path="/history" element={<div className="p-8 text-center text-gray-500">Transport History Page (Coming Soon)</div>} />
          <Route path="/analytics" element={<div className="p-8 text-center text-gray-500">Cost Analytics Page (Coming Soon)</div>} />
          <Route path="/ai" element={<div className="p-8 text-center text-gray-500">AI Assistant Page (Coming Soon)</div>} />
          <Route path="/settings" element={<div className="p-8 text-center text-gray-500">Settings Page (Coming Soon)</div>} />
          <Route path="/profile" element={<div className="p-8 text-center text-gray-500">Profile Page (Coming Soon)</div>} />
          <Route path="/book/:id" element={<div className="p-8 text-center text-gray-500">Booking Confirmation Page (Coming Soon)</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
