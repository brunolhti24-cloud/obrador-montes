import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import DynamicBackground from './DynamicBackground';

export default function AppLayout() {
  return (
    <div className="min-h-screen font-body relative">
      <DynamicBackground />
      <div className="relative z-10">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}