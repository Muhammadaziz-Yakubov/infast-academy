'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight, ChevronRight } from 'lucide-react';
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
    { name: 'Kurslar', href: '/#kurslar' },
    { name: 'Kalkulyator', href: '/#kalkulyator' },
    { name: 'Nega InFast?', href: '/#nega-infast' },
    { name: 'Loyiha Portfolio', href: '/#portfolio' },
    { name: 'FAQ', href: '/#faq' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-4 px-4 sm:px-6 lg:px-8 transition-all duration-300">
      <div
        className={`max-w-6xl mx-auto flex items-center justify-between px-6 py-3 rounded-full transition-all duration-300 ${
          scrolled
            ? 'bg-black/80 backdrop-blur-2xl border border-white/15 shadow-2xl shadow-black/90'
            : 'bg-black/40 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/50'
        }`}
      >
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-8 h-8 rounded-full bg-white text-black font-extrabold text-sm flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            ⚡
          </div>
          <span className="font-semibold text-sm tracking-tight text-white flex items-center">
            InFast <span className="text-neutral-400 font-normal text-xs ml-1.5">IT Academy</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-7">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-xs font-medium transition-colors ${
                pathname === link.href
                  ? 'text-white font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right Action CTAs */}
        <div className="hidden md:flex items-center space-x-3">
          <Link
            href="/login"
            className="text-xs font-medium text-neutral-400 hover:text-white transition-colors px-3 py-1.5"
          >
            Admin CRM
          </Link>
          <Link
            href="/#ariza"
            className="inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-semibold text-black bg-white hover:bg-neutral-200 active:scale-95 transition-all shadow-sm"
          >
            <span>Ariza topshirish</span>
          </Link>
        </div>

        {/* Mobile Menu Trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-full bg-white/10 text-neutral-300 hover:text-white transition-colors"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="md:hidden max-w-6xl mx-auto mt-3 bg-neutral-950/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 space-y-5 shadow-2xl"
          >
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-neutral-300 hover:text-white py-2 border-b border-neutral-900 flex items-center justify-between"
                >
                  <span>{link.name}</span>
                  <ChevronRight className="w-4 h-4 text-neutral-600" />
                </Link>
              ))}
            </div>

            <div className="pt-2 space-y-2.5">
              <Link
                href="/#ariza"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center py-3 rounded-full text-xs font-semibold text-black bg-white hover:bg-neutral-200 transition-all"
              >
                Ariza topshirish
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>

              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center py-2.5 rounded-full text-xs font-medium text-neutral-400 bg-neutral-900 border border-neutral-800"
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
