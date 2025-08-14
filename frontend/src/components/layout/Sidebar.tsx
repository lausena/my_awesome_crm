import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon,
  UserGroupIcon,
  UserIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  current?: boolean;
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Contacts', href: '/contacts', icon: UserIcon },
  { name: 'Leads', href: '/leads', icon: UserGroupIcon },
  { name: 'Opportunities', href: '/opportunities', icon: CurrencyDollarIcon },
  { name: 'Activities', href: '/activities', icon: ClipboardDocumentListIcon },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon },
];

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-full">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary-600">My Awesome CRM</h1>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* User Profile & Settings */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-sm font-medium text-primary-600">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.username || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || 'user@example.com'}
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <Cog6ToothIcon className="mr-3 h-5 w-5" aria-hidden="true" />
            Settings
          </NavLink>
          
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-left text-gray-600 hover:text-red-600 hover:bg-red-50"
          >
            <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" aria-hidden="true" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;