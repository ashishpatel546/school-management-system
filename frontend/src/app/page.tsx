"use client";

import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                {process.env.NEXT_PUBLIC_SCHOOL_NAME || 'EduSphere'}
              </span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link href="#" className="text-slate-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Features</Link>
                <Link href="#" className="text-slate-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">About</Link>
                <Link href="#" className="text-slate-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Contact</Link>
                <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-sm hover:shadow-md">
                  Login
                </Link>
              </div>
            </div>
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {!isMobileMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state. */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="#" className="text-slate-600 hover:bg-slate-50 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">Features</Link>
              <Link href="#" className="text-slate-600 hover:bg-slate-50 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">About</Link>
              <Link href="#" className="text-slate-600 hover:bg-slate-50 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium">Contact</Link>
              <Link href="/dashboard" className="text-blue-600 hover:bg-blue-50 block px-3 py-2 rounded-md text-base font-bold mt-4">
                Login
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 sm:pt-40 sm:pb-24 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-6">
                <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
                New Academic Year Ready
              </div>
              <h1 className="text-4xl tracking-tight font-extrabold text-slate-900 sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                <span className="block">Simplify Your</span>
                <span className="block text-blue-600">School Management</span>
              </h1>
              <p className="mt-4 text-lg text-slate-600 sm:mt-6">
                A clean, intuitive platform to manage students, academics, and administration. Focus on education, not paperwork.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0 flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5">
                  Get Started
                </Link>
                <Link href="#" className="inline-flex items-center justify-center px-8 py-3 border border-slate-200 text-base font-medium rounded-full text-slate-600 hover:bg-slate-50 hover:text-slate-900 md:py-4 md:text-lg transition-all">
                  View Demo
                </Link>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6">
              <div className="relative mx-auto w-full rounded-2xl shadow-xl lg:max-w-md overflow-hidden bg-white border border-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&q=80&w=1000"
                  alt="Student using tablet"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything you need, nothing you don't
            </p>
            <p className="mt-4 text-lg text-slate-600">
              Powerful tools wrapped in a simple, elegant interface designed for everyone.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Student Profiles", desc: "Manage enrollment, attendance, and performance in one place.", icon: "bg-blue-100 text-blue-600" },
                { title: "Smart Scheduling", desc: "Effortlessly create and manage class timetables and events.", icon: "bg-purple-100 text-purple-600" },
                { title: "Instant Communication", desc: "Connect teachers, parents, and students seamlessly.", icon: "bg-teal-100 text-teal-600" },
              ].map((feature, i) => (
                <div key={i} className="relative p-8 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className={`h-12 w-12 rounded-xl ${feature.icon} flex items-center justify-center text-xl mb-5`}>
                    ✦
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-3 text-base text-slate-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
