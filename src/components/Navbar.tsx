import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <GraduationCap className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-800">Gesture Academy</span>
            </Link>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <Link to="/courses" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900">
              Courses
            </Link>
            <Link to="/practice" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900">
              Practice
            </Link>
          </div>

          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/courses"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Courses
            </Link>
            <Link
              to="/practice"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Practice
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};