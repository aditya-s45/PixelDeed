"use client"
import React from 'react';
import Navbar from '../../components/Navbar';

export default function Marketplace() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-200">
      <Navbar />
      
      <main className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Land Marketplace</h1>
            <p className="text-slate-400">Discover, buy, and sell tokenized land parcels</p>
          </div>
          
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Search locations..." 
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 w-64"
            />
            <button className="bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
              Filter
            </button>
          </div>
        </div>

        {/* Empty State */}
        <div className="glass-panel p-20 text-center rounded-2xl border-white/5 border-dashed border-2 border-slate-700 bg-transparent flex flex-col items-center">
          <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 border border-blue-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-3">Marketplace is Launching Soon</h2>
          <p className="text-slate-400 max-w-lg mx-auto mb-8">
            The GeoSense decentralized land marketplace is currently under construction. Soon you will be able to trade GeoNFTs with zero intermediaries using our smart contract escrow system.
          </p>
          <div className="flex gap-4">
            <button className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white py-2.5 px-6 rounded-lg text-sm font-semibold shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all">
              Notify Me
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
