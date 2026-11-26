'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Flame,
  Coins,
  Award,
  BookOpen,
  Trophy,
  Calendar,
  ShoppingBag,
  User,
  LogOut,
  Home,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface StudentContextType {
  studentData: any;
  loading: boolean;
  refreshData: () => Promise<void>;
  logout: () => Promise<void>;
}

const StudentContext = createContext<StudentContextType>({
  studentData: null,
  loading: true,
  refreshData: async () => {},
  logout: async () => {},
});

export const useStudent = () => useContext(StudentContext);

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchStudentData = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('student_token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/student/dashboard', { headers });
      if (res.ok) {
        const data = await res.json();
        setStudentData(data);
      } else if (res.status === 401) {
        router.push('/login');
      }
    } catch (e) {
      console.error('Student data fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      if (typeof window !== 'undefined') {
        localStorage.removeItem('student_token');
      }
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const navItems = [
    { name: 'Bosh sahifa', href: '/student', icon: Home },
    { name: "O'quv xaritasi", href: '/student/curriculum', icon: BookOpen },
    { name: 'Reyting', href: '/student/leaderboard', icon: Trophy },
    { name: 'Tadbirlar', href: '/student/events', icon: Calendar },
    { name: "Do'kon", href: '/student/shop', icon: ShoppingBag },
    { name: 'Profil', href: '/student/profile', icon: User },
  ];

  const student = studentData?.student || {};
  const progress = studentData?.progress || { xp: 0, xcoin: 0, level: 1 };
  const isDebtor = studentData?.debtStatus?.isDebtor;

  return (
    <StudentContext.Provider value={{ studentData, loading, refreshData: fetchStudentData, logout: handleLogout }}>
      <div className="min-h-screen bg-[#050508] text-[#F5F5F7] font-sans selection:bg-[#FF2A85] selection:text-white pb-20 md:pb-8">
        
        {/* Background ambient lighting */}
        <div className="fixed top-0 left-1/4 w-[600px] h-[350px] bg-gradient-to-r from-[#FF2A85]/10 via-[#FF7A00]/8 to-[#00F0FF]/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="fixed bottom-0 right-1/4 w-[500px] h-[300px] bg-[#00F0FF]/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Top Navbar */}
        <header className="sticky top-0 z-40 bg-[#050508]/80 backdrop-blur-2xl border-b border-white/[0.08]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Link href="/student" className="flex items-center space-x-2.5 group">
                <img
                  src="/logo-icon.png"
                  alt="InFast Logo"
                  className="w-8 h-8 object-contain drop-shadow-[0_0_12px_rgba(255,42,133,0.35)] group-hover:scale-105 transition-transform"
                />
                <div className="hidden sm:block">
                  <span className="font-black text-sm tracking-tight text-white uppercase">INFAST</span>
                  <span className="block text-[9px] font-mono font-bold bg-gradient-to-r from-[#FF2A85] to-[#00F0FF] bg-clip-text text-transparent">
                    STUDENT WEB PORTAL
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1 bg-white/[0.03] p-1.5 rounded-full border border-white/[0.06] backdrop-blur-xl">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-[#FF2A85] to-[#FF7A00] text-white shadow-md shadow-[#FF2A85]/20 font-bold'
                        : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Side Stats & Profile Capsule */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Flame / XP capsule */}
              <div className="flex items-center space-x-1 px-2.5 sm:px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
                <span>{progress.xp || 0} <span className="hidden sm:inline font-normal text-[10px] text-amber-400/80">XP</span></span>
              </div>

              {/* Coins capsule */}
              <div className="flex items-center space-x-1 px-2.5 sm:px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[#00F0FF] text-xs font-bold">
                <Coins className="w-3.5 h-3.5 text-[#00F0FF]" />
                <span>{progress.xcoin || 0}</span>
              </div>

              {/* Level Badge */}
              <div className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold">
                <Award className="w-3.5 h-3.5" />
                <span>Lv.{progress.level || 1}</span>
              </div>

              {/* User Avatar & Logout */}
              <div className="flex items-center space-x-2 pl-1 border-l border-white/[0.08]">
                <Link
                  href="/student/profile"
                  className="w-8 h-8 rounded-full overflow-hidden bg-neutral-800 border border-white/10 hover:border-white/30 transition-all"
                  title="Shaxsiy profil"
                >
                  <img
                    src={student.avatarUrl || 'https://api.dicebear.com/7.x/bottts/png?seed=student1'}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-white/[0.04] hover:bg-rose-500/20 text-neutral-400 hover:text-rose-400 border border-white/[0.08] transition-all"
                  title="Tizimdan chiqish"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Debt Warning Banner if Overdue */}
        {isDebtor && (
          <div className="bg-rose-500/10 border-b border-rose-500/20 text-rose-300 px-4 py-2.5 text-xs font-semibold flex items-center justify-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>To'lov muddati o'tgan: Kurs to'lovini amalga oshirish uchun filial ma'muriyatiga murojaat qiling.</span>
          </div>
        )}

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
          {children}
        </main>

        {/* Mobile Bottom Navigation Bar (App-like experience) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/90 backdrop-blur-2xl border-t border-white/[0.08] py-2 px-3 flex items-center justify-around shadow-2xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'text-[#00F0FF]'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-[#00F0FF]/10' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </StudentContext.Provider>
  );
}