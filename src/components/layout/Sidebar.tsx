import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Truck, 
  Map, 
  History, 
  PieChart, 
  Settings,
  Brain
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Create Request', path: '/request/create', icon: PlusCircle },
  { name: 'Active Deliveries', path: '/deliveries', icon: Truck },
  { name: 'Tracking', path: '/tracking', icon: Map },
  { name: 'History', path: '/history', icon: History },
  { name: 'Analytics', path: '/analytics', icon: PieChart },
  { name: 'AI Assistant', path: '/ai', icon: Brain },
];

const bottomNavItems = [
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-brand-900 text-white flex flex-col min-h-screen">
      <div className="h-16 flex items-center px-6 border-b border-brand-800">
        <h1 className="text-xl font-bold tracking-wider">DRIVA</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive 
                    ? 'bg-brand-800 text-white' 
                    : 'text-brand-300 hover:bg-brand-800 hover:text-white'
                )
              }
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </div>
      </div>
      
      <div className="p-4 border-t border-brand-800">
        <div className="space-y-1">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive 
                    ? 'bg-brand-800 text-white' 
                    : 'text-brand-300 hover:bg-brand-800 hover:text-white'
                )
              }
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </div>
      </div>
    </aside>
  );
};
