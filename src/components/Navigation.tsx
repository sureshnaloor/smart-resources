'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeSwitcher } from './ThemeSwitcher';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">ResourceFlow</h1>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link
                  href="/"
                  className={`nav-link px-3 py-2 rounded-md text-sm font-medium ${isActive('/') ? 'active text-blue-600 dark:text-white' : 'text-slate-600 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white'
                    }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/resources"
                  className={`nav-link px-3 py-2 rounded-md text-sm font-medium ${isActive('/resources') ? 'active text-blue-600 dark:text-white' : 'text-slate-600 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white'
                    }`}
                >
                  Resources
                </Link>
                <Link
                  href="/projects"
                  className={`nav-link px-3 py-2 rounded-md text-sm font-medium ${isActive('/projects') ? 'active text-blue-600 dark:text-white' : 'text-slate-600 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white'
                    }`}
                >
                  Projects
                </Link>
                <Link
                  href="/analytics"
                  className={`nav-link px-3 py-2 rounded-md text-sm font-medium ${isActive('/analytics') ? 'active text-blue-600 dark:text-white' : 'text-slate-600 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white'
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
