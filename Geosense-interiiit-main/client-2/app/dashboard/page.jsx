"use client"
import React from 'react';
import Navbar from '../../components/Navbar';
import { useAccount } from 'wagmi';

export default function Dashboard() {
  const { address, isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-200">
      <Navbar />
      
      <main className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Land Portfolio</h1>
          <p className="text-slate-400">View and manage your tokenized land assets</p>
        </div>

        {!isConnected ? (
          <div className="glass-panel p-12 text-center rounded-2xl flex flex-col items-center justify-center border-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 mb-4"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            <h2 className="text-xl font-semibold text-white mb-2">Wallet Disconnected</h2>
            <p className="text-slate-400 max-w-md">Please connect your wallet using the button in the top right to view your tokenized land assets.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-panel p-6 rounded-2xl border-white/5">
                <div className="text-slate-400 text-sm mb-1">Total Parcels Owned</div>
                <div className="text-3xl font-bold text-white">0</div>
              </div>
              <div className="glass-panel p-6 rounded-2xl border-white/5">
                <div className="text-slate-400 text-sm mb-1">Total Area (ha)</div>
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">0.00</div>
              </div>
              <div className="glass-panel p-6 rounded-2xl border-white/5">
                <div className="text-slate-400 text-sm mb-1">Estimated Value</div>
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">0 GeoTokens</div>
              </div>
            </div>

            {/* Empty State Grid */}
            <div className="glass-panel p-12 text-center rounded-2xl border-white/5 mt-8 border-dashed border-2 border-slate-700 bg-transparent">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 mb-4 mx-auto"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
              <h2 className="text-xl font-semibold text-white mb-2">No Land Parcels Yet</h2>
              <p className="text-slate-400 max-w-md mx-auto mb-6">You haven't tokenized any land parcels yet. Head over to the map interface to measure and mint your first GeoNFT.</p>
              <a href="/geosense" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors border border-white/10">
                Go to Map Interface
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
