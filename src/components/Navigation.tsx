'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeSwitcher } from './ThemeSwitcher';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-white">ResourceFlow</h1>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link
                  href="/"
                  className={`nav-link px-3 py-2 rounded-md text-sm font-medium ${isActive('/') ? 'active text-white' : 'text-gray-300 hover:text-white'
                    }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/resources"
                  className={`nav-link px-3 py-2 rounded-md text-sm font-medium ${isActive('/resources') ? 'active text-white' : 'text-gray-300 hover:text-white'
                    }`}
                >
                  Resources
                </Link>
                <Link
                  href="/projects"
                  className={`nav-link px-3 py-2 rounded-md text-sm font-medium ${isActive('/projects') ? 'active text-white' : 'text-gray-300 hover:text-white'
                    }`}
                >
                  Projects
                </Link>
                <Link
                  href="/analytics"
                  className={`nav-link px-3 py-2 rounded-md text-sm font-medium ${isActive('/analytics') ? 'active text-white' : 'text-gray-300 hover:text-white'
                    }`}
                >
                  Analytics
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeSwitcher />
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
          </div>
        </div>
      </div>
    </nav>
  );
}
