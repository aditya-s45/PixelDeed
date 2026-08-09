"use client"
import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { useAccount } from 'wagmi';
import { GEO_NFT_ADDRESS, GeoNFTABI } from '../../config/contracts';
import { parseAbiItem, createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const [stats, setStats] = useState({ count: 0, area: "0.00", value: 0 });
  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Direct connection to Sepolia testnet
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http('https://eth-sepolia.g.alchemy.com/v2/alch__8putgeH4_Fu71Y5iIeHc')
  });

  useEffect(() => {
    async function fetchPortfolio() {
      if (!address || !publicClient) return;
      try {
        let totalArea = 0;
        let totalValue = 0;
        let count = 0;
        let tokenId = 0;
        const owned = [];
        
        // Loop through tokens until we hit one that doesn't exist
        while (true) {
          try {
            const currentOwner = await publicClient.readContract({
              address: GEO_NFT_ADDRESS,
              abi: GeoNFTABI,
              functionName: 'ownerOf',
              args: [tokenId]
            });
            
            if (currentOwner.toLowerCase() === address.toLowerCase()) {
              const details = await publicClient.readContract({
                address: GEO_NFT_ADDRESS,
                abi: GeoNFTABI,
                functionName: 'landParcels',
                args: [tokenId]
              });
              
              count++;
              totalArea += Number(details[1]); // areaSqMeters
              totalValue += Number(details[2]); // estimatedValue
              
              owned.push({
                tokenId: Number(tokenId),
                area: (Number(details[1]) / 10000).toFixed(4),
                estimatedValue: Number(details[2]),
                coordinates: details[0]
              });
            }
            tokenId++;
          } catch (e) {
            // Token doesn't exist, we reached the end
            break;
          }
        }

        setOwnedNFTs(owned);
        setStats({
          count,
          area: (totalArea / 10000).toFixed(4), // Convert sqm to hectares
          value: totalValue.toLocaleString()
        });
      } catch (err) {
        console.error("Failed to fetch portfolio:", err);
      } finally {
        setLoading(false);
      }
    }
    
    if (isConnected) {
      fetchPortfolio();
    }
  }, [address, isConnected, publicClient]);

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
        ) : loading ? (
          <div className="glass-panel p-12 text-center rounded-2xl flex justify-center border-white/5">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-panel p-6 rounded-2xl border-white/5">
                <div className="text-slate-400 text-sm mb-1">Total Parcels Owned</div>
                <div className="text-3xl font-bold text-white">{stats.count}</div>
              </div>
              <div className="glass-panel p-6 rounded-2xl border-white/5">
                <div className="text-slate-400 text-sm mb-1">Total Area (ha)</div>
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{stats.area}</div>
              </div>
              <div className="glass-panel p-6 rounded-2xl border-white/5">
                <div className="text-slate-400 text-sm mb-1">Estimated Value</div>
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">{stats.value} GEO</div>
              </div>
            </div>

            {/* Empty State Grid (Only show if count is 0) */}
            {stats.count === 0 ? (
              <div className="glass-panel p-12 text-center rounded-2xl border-white/5 mt-8 border-dashed border-2 border-slate-700 bg-transparent">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 mb-4 mx-auto"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
                <h2 className="text-xl font-semibold text-white mb-2">No Land Parcels Yet</h2>
                <p className="text-slate-400 max-w-md mx-auto mb-6">You haven't tokenized any land parcels yet. Head over to the map interface to measure and mint your first GeoNFT.</p>
                <a href="/pixeldeed" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors border border-white/10">
                  Go to Map Interface
                </a>
              </div>
            ) : (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-white mb-6">Your Properties</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ownedNFTs.map((nft) => (
                    <div key={nft.tokenId} className="glass-panel rounded-2xl border-white/5 overflow-hidden flex flex-col transition-all hover:border-blue-500/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] group relative">
                      <div className="h-32 bg-gradient-to-br from-slate-800 to-slate-900 border-b border-white/5 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <div className="absolute bottom-4 left-4">
                          <div className="text-xs text-blue-400 font-mono mb-1">TOKEN ID #{nft.tokenId}</div>
                          <div className="text-xl font-bold text-white">GeoNFT Parcel</div>
                        </div>
                      </div>
                      
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/5">
                          <div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Area</div>
                            <div className="text-white font-medium">{nft.area} ha</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Value</div>
                            <div className="text-emerald-400 font-bold">{nft.estimatedValue.toLocaleString()} GEO</div>
                          </div>
                        </div>
                        
                        <div className="mt-auto pt-2">
                          <button 
                            onClick={() => {
                              try {
                                const geoJsonStr = nft.coordinates;
                                const geoJsonFeature = JSON.parse(geoJsonStr);
                                
                                // Create full GeoJSON collection wrapper
                                const fullGeoJson = {
                                  type: "FeatureCollection",
                                  features: [geoJsonFeature]
                                };
                                
                                const blob = new Blob([JSON.stringify(fullGeoJson, null, 2)], { type: 'application/geo+json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `PixelDeed_Parcel_${nft.tokenId}.geojson`;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                              } catch (e) {
                                alert("Failed to generate GeoJSON. Invalid coordinate data.");
                                console.error(e);
                              }
                            }}
                            className="w-full bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 group-hover:border-blue-500/50"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            Export to GIS (GeoJSON)
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
