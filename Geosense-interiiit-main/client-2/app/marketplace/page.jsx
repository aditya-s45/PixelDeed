"use client"
import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { GEO_NFT_ADDRESS, GeoNFTABI, LAND_ESCROW_ADDRESS, LandEscrowABI, GEO_TOKEN_ADDRESS, GeoTokenABI } from '../../config/contracts';
import { parseAbiItem, createPublicClient, http } from 'viem';
import { hardhat } from 'viem/chains';

// Direct client to ensure we hit the local chain
const publicClient = createPublicClient({
  chain: hardhat,
  transport: http('http://127.0.0.1:8545')
});

export default function Marketplace() {
  const { address, isConnected } = useAccount();
  
  const [activeTab, setActiveTab] = useState('buy'); // 'buy' or 'sell'
  const [listings, setListings] = useState([]);
  const [myNFTs, setMyNFTs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selling state
  const [sellPrice, setSellPrice] = useState("");
  const [selectedTokenId, setSelectedTokenId] = useState(null);

  // Wagmi write hooks
  const { writeContract: writeNFT, data: hashNFT } = useWriteContract();
  const { writeContract: writeEscrow, data: hashEscrow } = useWriteContract();
  const { writeContract: writeToken, data: hashToken } = useWriteContract();

  // Transaction watchers
  const { isSuccess: isNFTApproveSuccess } = useWaitForTransactionReceipt({ hash: hashNFT });
  const { isSuccess: isEscrowSuccess } = useWaitForTransactionReceipt({ hash: hashEscrow });
  const { isSuccess: isTokenSuccess } = useWaitForTransactionReceipt({ hash: hashToken });

  useEffect(() => {
    fetchMarketplaceData();
  }, [address, isConnected, isEscrowSuccess, isNFTApproveSuccess, isTokenSuccess]);

  async function fetchMarketplaceData() {
    setLoading(true);
    try {
      // 1. Fetch all NFTs minted to find which ones the user owns
      const mintLogs = await publicClient.getLogs({
        address: GEO_NFT_ADDRESS,
        event: parseAbiItem('event LandTokenized(uint256 indexed tokenId, address owner, uint256 areaSqMeters, uint256 estimatedValue)'),
        fromBlock: 'earliest'
      });

      // Find user's NFTs
      const owned = [];
      if (address) {
        for (const log of mintLogs) {
          // Check current owner by calling the contract directly
          try {
            const currentOwner = await publicClient.readContract({
              address: GEO_NFT_ADDRESS,
              abi: GeoNFTABI,
              functionName: 'ownerOf',
              args: [log.args.tokenId]
            });
            
            if (currentOwner.toLowerCase() === address.toLowerCase()) {
              owned.push({
                tokenId: Number(log.args.tokenId),
                area: (Number(log.args.areaSqMeters) / 10000).toFixed(4),
                estimatedValue: Number(log.args.estimatedValue)
              });
            }
          } catch (e) {
            // Token might not exist or burned
          }
        }
      }
      setMyNFTs(owned);

      // 2. Fetch all Escrows
      const nextEscrowId = await publicClient.readContract({
        address: LAND_ESCROW_ADDRESS,
        abi: LandEscrowABI,
        functionName: 'nextEscrowId'
      });

      const activeListings = [];
      for (let i = 0; i < Number(nextEscrowId); i++) {
        const escrow = await publicClient.readContract({
          address: LAND_ESCROW_ADDRESS,
          abi: LandEscrowABI,
          functionName: 'escrows',
          args: [i]
        });

        // escrow struct: [seller, buyer, tokenId, price, isFunded, isCompleted]
        const isCompleted = escrow[5];
        if (!isCompleted) {
          // Fetch NFT details
          const details = await publicClient.readContract({
            address: GEO_NFT_ADDRESS,
            abi: GeoNFTABI,
            functionName: 'getLandDetails',
            args: [escrow[2]]
          });

          activeListings.push({
            escrowId: i,
            seller: escrow[0],
            tokenId: Number(escrow[2]),
            price: Number(escrow[3]),
            isFunded: escrow[4],
            area: (Number(details.areaSqMeters) / 10000).toFixed(4),
            estimatedValue: Number(details.estimatedValue)
          });
        }
      }
      setListings(activeListings);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Handle Selling
  const handleApproveNFT = (tokenId) => {
    writeNFT({
      address: GEO_NFT_ADDRESS,
      abi: GeoNFTABI,
      functionName: 'approve',
      args: [LAND_ESCROW_ADDRESS, tokenId]
    });
  };

  const handleCreateEscrow = (tokenId) => {
    if (!sellPrice) return alert("Enter a price");
    writeEscrow({
      address: LAND_ESCROW_ADDRESS,
      abi: LandEscrowABI,
      functionName: 'createEscrow',
      args: [tokenId, BigInt(sellPrice)]
    });
  };

  // Handle Buying
  const handleApproveToken = (price) => {
    writeToken({
      address: GEO_TOKEN_ADDRESS,
      abi: GeoTokenABI,
      functionName: 'approve',
      args: [LAND_ESCROW_ADDRESS, BigInt(price)]
    });
  };

  const handleFundEscrow = (escrowId) => {
    writeEscrow({
      address: LAND_ESCROW_ADDRESS,
      abi: LandEscrowABI,
      functionName: 'fundEscrow',
      args: [escrowId]
    });
  };

  const handleCompleteEscrow = (escrowId) => {
    writeEscrow({
      address: LAND_ESCROW_ADDRESS,
      abi: LandEscrowABI,
      functionName: 'completeEscrow',
      args: [escrowId]
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-200">
      <Navbar />
      
      <main className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Decentralized Marketplace</h1>
            <p className="text-slate-400">P2P Escrow Trading for Tokenized Land</p>
          </div>
          
          <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
            <button 
              onClick={() => setActiveTab('buy')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'buy' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Active Listings
            </button>
            <button 
              onClick={() => setActiveTab('sell')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'sell' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Sell Your Land
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : activeTab === 'buy' ? (
          /* ACTIVE LISTINGS */
          listings.length === 0 ? (
            <div className="glass-panel p-20 text-center rounded-2xl border-white/5 border-dashed border-2 border-slate-700 bg-transparent flex flex-col items-center">
              <h2 className="text-xl font-semibold text-white mb-2">No Land Available</h2>
              <p className="text-slate-400 max-w-md">There are currently no land parcels listed for sale in the marketplace.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map(listing => (
                <div key={listing.escrowId} className="glass-panel rounded-2xl overflow-hidden border border-white/10 transition-all hover:border-blue-500/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                  <div className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 p-4 border-b border-white/5 flex justify-between items-center">
                    <span className="font-bold text-white text-lg">Parcel #{listing.tokenId}</span>
                    <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded-full border border-blue-500/30">
                      {listing.isFunded ? 'Funded (Ready to Complete)' : 'Awaiting Buyer'}
                    </span>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">Area</span>
                      <span className="font-medium text-white">{listing.area} ha</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 text-sm">AI Appraisal</span>
                      <span className="font-medium text-emerald-400">{listing.estimatedValue} GEO</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-white/5">
                      <span className="text-slate-300">Asking Price</span>
                      <span className="font-bold text-xl text-blue-400">{listing.price} GEO</span>
                    </div>
                    
                    <div className="pt-4 space-y-2">
                      <p className="text-xs text-slate-500 text-center mb-2">Seller: {listing.seller.slice(0,6)}...{listing.seller.slice(-4)}</p>
                      
                      {!listing.isFunded ? (
                        <>
                          <button 
                            onClick={() => handleApproveToken(listing.price)}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-sm font-medium transition-colors border border-slate-600"
                          >
                            1. Approve GEO Tokens
                          </button>
                          <button 
                            onClick={() => handleFundEscrow(listing.escrowId)}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
                          >
                            2. Fund Escrow (Buy)
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => handleCompleteEscrow(listing.escrowId)}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-lg font-bold transition-colors shadow-lg shadow-emerald-500/20"
                        >
                          Complete Transfer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* SELL LAND */
          !isConnected ? (
             <div className="glass-panel p-12 text-center rounded-2xl border-white/5 flex flex-col items-center">
               <h2 className="text-xl font-semibold text-white mb-2">Connect Wallet to Sell</h2>
             </div>
          ) : myNFTs.length === 0 ? (
            <div className="glass-panel p-20 text-center rounded-2xl border-white/5 border-dashed border-2 border-slate-700 bg-transparent flex flex-col items-center">
              <h2 className="text-xl font-semibold text-white mb-2">You don't own any land</h2>
              <p className="text-slate-400 max-w-md mb-6">Head to the Map Interface to discover and mint your first parcel.</p>
              <a href="/geosense" className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-lg text-white text-sm">Go to Map</a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myNFTs.map(nft => (
                <div key={nft.tokenId} className="glass-panel rounded-2xl overflow-hidden border border-white/10">
                   <div className="p-4 bg-slate-800/50 border-b border-white/5">
                      <h3 className="font-bold text-white">Parcel #{nft.tokenId}</h3>
                   </div>
                   <div className="p-6 space-y-4">
                     <div className="flex justify-between">
                       <span className="text-slate-400 text-sm">Area</span>
                       <span className="text-white">{nft.area} ha</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-slate-400 text-sm">Appraised Value</span>
                       <span className="text-emerald-400">{nft.estimatedValue} GEO</span>
                     </div>
                     
                     <div className="pt-4 border-t border-white/5">
                       <label className="block text-xs text-slate-400 mb-1">Set Asking Price (GEO)</label>
                       <input 
                         type="number"
                         placeholder={nft.estimatedValue}
                         onChange={(e) => {
                           setSellPrice(e.target.value);
                           setSelectedTokenId(nft.tokenId);
                         }}
                         className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 mb-4"
                       />
                       
                       <div className="space-y-2">
                         <button 
                           onClick={() => handleApproveNFT(nft.tokenId)}
                           disabled={selectedTokenId !== nft.tokenId}
                           className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors border border-slate-600"
                         >
                           1. Approve NFT Transfer
                         </button>
                         <button 
                           onClick={() => handleCreateEscrow(nft.tokenId)}
                           disabled={selectedTokenId !== nft.tokenId}
                           className="w-full bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-pink-500/20"
                         >
                           2. Create Escrow Listing
                         </button>
                       </div>
                     </div>
                   </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}
