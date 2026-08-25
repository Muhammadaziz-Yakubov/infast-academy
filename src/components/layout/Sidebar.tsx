'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Folder,
  CalendarCheck,
  CreditCard,
  GraduationCap,
  BookOpen,
  UserCheck,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { name: 'Bosh sahifa', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Talabalar', href: '/students', icon: Users },
  { name: 'Guruhlar', href: '/groups', icon: Folder },
  { name: 'Davomat', href: '/attendance', icon: CalendarCheck },
  { name: "To'lovlar", href: '/payments', icon: CreditCard },
  { name: 'Imtihonlar', href: '/exams', icon: GraduationCap },
  { name: 'Kurslar', href: '/courses', icon: BookOpen },
  { name: "O'qituvchilar", href: '/teachers', icon: UserCheck },
  { name: 'Hisobotlar', href: '/reports', icon: BarChart3 },
  { name: 'Xabarnomalar', href: '/notifications', icon: Bell },
  { name: 'Sozlamalar', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const SidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 h-16">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-infast-500 flex items-center justify-center text-white font-black shrink-0 shadow-md shadow-infast-500/30">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-black text-base text-slate-900 dark:text-white tracking-tight leading-none">
                INFAST
              </span>
              <span className="text-[10px] font-bold text-infast-600 tracking-widest uppercase mt-0.5">
                IT-ACADEMY
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-colors group relative",
                isActive
                  ? "bg-infast-500 text-white shadow-md shadow-infast-500/20 font-bold"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-infast-500"
                )}
              />
              {!collapsed && <span className="ml-3 truncate">{item.name}</span>}
            </Link>
          );
        })}
      </div>

      {/* Admin Profile Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800">
        <div className={cn("flex items-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50", collapsed ? "justify-center" : "justify-between")}>
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-infast-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
              M
            </div>
            {!collapsed && (
              <div className="truncate">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">Muhammadaziz Yakubov</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Bosh Administrator</p>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Tizimdan chiqish"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-40 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-infast-500 text-white flex items-center justify-center">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white">INFAST CRM</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          "hidden md:block transition-all duration-300 ease-in-out shrink-0 z-30",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {SidebarContent}
      </aside>

      {/* Mobile Drawer Slide-Over */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex-1 w-full max-w-xs h-full shadow-2xl">
            {SidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
