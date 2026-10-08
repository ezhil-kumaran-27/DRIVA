import { Bell, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Topbar = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10">
      <div className="flex-1 flex">
        <div className="max-w-md w-full relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-md leading-5 bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-brand-300 focus:ring-1 focus:ring-brand-300 sm:text-sm transition-colors"
            placeholder="Search shipments, IDs, or vehicles..."
            type="search"
          />
        </div>
      </div>
      
      <div className="ml-4 flex items-center space-x-4">
        <button className="text-gray-400 hover:text-gray-500 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 relative">
          <span className="sr-only">View notifications</span>
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="relative flex-shrink-0">
          <Link to="/profile" className="flex bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2">
            <span className="sr-only">Open user menu</span>
            <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-medium">
              JS
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};
