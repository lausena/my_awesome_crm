import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BellIcon, 
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';

interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, showMenuButton = false }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          {showMenuButton && (
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
              onClick={onMenuClick}
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          )}

          {/* Page title or breadcrumb would go here */}
          <div className="hidden lg:block">
            {/* This will be populated by individual pages */}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search (hidden on mobile) */}
          <div className="hidden lg:block">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search contacts, leads, opportunities..."
                className="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full">
            <span className="sr-only">View notifications</span>
            <BellIcon className="h-6 w-6" aria-hidden="true" />
            {/* Notification badge */}
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
          </button>

          {/* Settings */}
          <button className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full">
            <span className="sr-only">Settings</span>
            <Cog6ToothIcon className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center space-x-2 p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full"
            >
              <span className="sr-only">Open user menu</span>
              <UserCircleIcon className="h-8 w-8" aria-hidden="true" />
              <span className="hidden lg:block text-sm font-medium text-gray-900">
                {user?.username}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;