"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Activity, Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Activity className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">
            MediFlow
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {["Features", "How it Works", "Testimonials"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium py-2.5 px-5 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-slate-600"
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 p-6 flex flex-col gap-4 shadow-xl animate-in slide-in-from-top-5">
          {["Features", "How it Works", "Testimonials"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-slate-600 font-medium"
              onClick={() => setIsOpen(false)}
            >
              {item}
            </Link>
          ))}
          <hr className="border-slate-100" />
          <Link
            href="/login"
            className="text-slate-600 font-medium"
            onClick={() => setIsOpen(false)}
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="bg-blue-600 text-white font-medium py-3 px-4 rounded-lg text-center"
            onClick={() => setIsOpen(false)}
          >
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
