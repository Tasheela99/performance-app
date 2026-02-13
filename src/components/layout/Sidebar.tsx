'use client';

import { useAuth } from '@/contexts/AuthContext';
import {
    faBars,
    faChartBar,
    faClipboardList,
    faFileAlt,
    faGauge,
    faRightFromBracket,
    faTimes,
    faUser,
    faUserShield,
    faUsers
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: typeof faGauge;
  roles: ('admin' | 'manager' | 'employee')[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: faGauge,
    roles: ['admin', 'manager', 'employee'],
  },
  {
    label: 'User Management',
    href: '/dashboard/users',
    icon: faUsers,
    roles: ['admin'],
  },
  {
    label: 'Appraisal Templates',
    href: '/dashboard/appraisals',
    icon: faClipboardList,
    roles: ['admin', 'manager'],
  },
  {
    label: 'My Appraisals',
    href: '/dashboard/my-appraisals',
    icon: faFileAlt,
    roles: ['employee'],
  },
  {
    label: 'Account Settings',
    href: '/dashboard/account',
    icon: faUser,
    roles: ['admin', 'manager', 'employee'],
  },
  {
    label: 'Review Submissions',
    href: '/dashboard/reviews',
    icon: faChartBar,
    roles: ['admin', 'manager'],
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!user) return null;

  const filteredNav = navItems.filter((item) => item.roles.includes(user.role));

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/20 text-red-200 border-red-400/30';
      case 'manager':
        return 'bg-blue-500/20 text-blue-200 border-blue-400/30';
      case 'employee':
        return 'bg-green-500/20 text-green-200 border-green-400/30';
      default:
        return 'bg-gray-500/20 text-gray-200 border-gray-400/30';
    }
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-gradient-to-b from-purple-900 to-purple-950 text-white flex flex-col transition-all duration-300 z-50 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-purple-700/50">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faUserShield} className="text-sm" />
            </div>
            <span className="font-bold text-sm">PMS</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-purple-700/50 transition"
        >
          <FontAwesomeIcon icon={isCollapsed ? faBars : faTimes} className="text-sm" />
        </button>
      </div>

      <div className={`p-4 border-b border-purple-700/50 ${isCollapsed ? 'px-3' : ''}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 bg-purple-500/30 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              {user.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </div>
          )}
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="font-semibold text-sm truncate">{user.name}</p>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full border font-medium capitalize ${getRoleBadgeColor(user.role)}`}
              >
                {user.role}
              </span>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {filteredNav.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-purple-500/30 text-white shadow-md'
                      : 'text-purple-200 hover:bg-purple-700/30 hover:text-white'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <FontAwesomeIcon icon={item.icon} className="text-base w-5" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 border-t border-purple-700/50">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-purple-200 hover:bg-red-500/20 hover:text-red-200 transition ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <FontAwesomeIcon icon={faRightFromBracket} className="text-base w-5" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
