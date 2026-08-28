'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, Menu, X, ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Kurslar', href: '/kurslar' },
    { name: 'Natijalar', href: '/natijalar' },
    { name: 'Nega InFast?', href: '/#nega-infast' },
    { name: 'Biz haqimizda', href: '/#biz-haqimizda' },
    { name: 'FAQ', href: '/#faq' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 py-3 shadow-2xl shadow-black/50'
          : 'bg-slate-950/40 backdrop-blur-md border-b border-slate-800/40 py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-infast-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-infast-500/30 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tight text-white flex items-center">
              INFAST <span className="text-infast-500 ml-1.5 font-bold text-xs uppercase tracking-widest px-2 py-0.5 rounded-full bg-infast-500/10 border border-infast-500/20">IT-ACADEMY</span>
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-8 bg-slate-900/60 border border-slate-800/80 px-6 py-2 rounded-full backdrop-blur-md">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-xs font-bold transition-colors ${
                pathname === link.href
                  ? 'text-infast-500'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right Action CTAs */}
        <div className="hidden md:flex items-center space-x-4">
          <Link
            href="/login"
            className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg border border-transparent hover:border-slate-800"
          >
            Admin
          </Link>
          <Link
            href="/ariza"
            className="group relative inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-infast-600 to-amber-500 shadow-lg shadow-infast-500/25 hover:shadow-infast-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden"
          >
            <span className="relative z-10 flex items-center">
              Kurslarni ko'rish
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>

        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-x-0 top-[73px] bg-slate-950/95 backdrop-blur-2xl border-b border-slate-800 p-6 space-y-6 shadow-2xl"
          >
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-bold text-slate-200 hover:text-infast-500 py-2 border-b border-slate-900 flex items-center justify-between"
                >
                  <span>{link.name}</span>
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </Link>
              ))}
            </div>

            <div className="pt-4 space-y-3">
              <Link
                href="/ariza"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-infast-600 to-amber-500 shadow-lg shadow-infast-500/30"
              >
                Kurslarni ko'rish
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>

              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center py-3 rounded-xl text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800"
              >
                Admin CRM Login
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
