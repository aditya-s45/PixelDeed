import React, { useState } from 'react';
import FeatureCard from './FeatureCard';
import { useAccount } from 'wagmi';
import { useTokenizeLand } from '../hooks/useContracts';

const SideBar = ({ features, setEditDetails, onSegmentationComplete, selectionHandlers }) => {
  const [areas, setAreas] = useState({});
  const [values, setValues] = useState({});
  const [calculating, setCalculating] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const { address } = useAccount();
  const { tokenize, isPending } = useTokenizeLand();

  const handleMint = async () => {
    if (!address) {
        alert("Please connect your wallet first.");
        return;
    }
    
    const totalArea = Object.values(areas).reduce((sum, area) => sum + area, 0);
    const totalValue = Object.values(values).reduce((sum, val) => sum + val, 0);
    
    // In a real app we'd upload metadata to IPFS here, but for now we'll just pass a mock URI
    const uri = "ipfs://QmMockGeoNFTMetadataHash";
    const coordinates = JSON.stringify(Object.keys(areas)); // Just a mock for demo
    
    try {
        await tokenize(address, uri, coordinates, Math.round(totalArea), totalValue);
        alert("Transaction submitted! Please confirm in your wallet.");
    } catch (error) {
        console.error("Minting failed", error);
        alert("Minting failed. See console.");
    }
  };

  const calculateAreas = async () => {
    if (!selectionHandlers || !selectionHandlers.getSelectedPolygons) return;
    
    setCalculating(true);
    try {
        const selectedPolygons = selectionHandlers.getSelectedPolygons();
        const selectedIds = Array.from(selectedPolygons);
        
        const calculatedAreas = {};
        const calculatedValues = {};
        
        selectedIds.forEach(id => {
            const feature = selectionHandlers.getFeatureById(id);
            if (feature && feature.properties.area_m2) {
                calculatedAreas[id] = parseFloat(feature.properties.area_m2);
                calculatedValues[id] = parseFloat(feature.properties.estimated_value || 0);
            }
        });
        
        setAreas(calculatedAreas);
        setValues(calculatedValues);
    } catch (error) {
        console.error('Error calculating areas:', error);
    }
    setCalculating(false);
  };

  return (
    <div className={`fixed right-0 top-20 h-[calc(100vh-80px)] w-96 glass-panel border-r-0 border-y-0 rounded-l-2xl rounded-r-none transition-transform duration-500 z-[1000] overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-[360px]'}`}>
      
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute left-2 top-4 w-6 h-12 bg-white/10 hover:bg-white/20 rounded-l-md flex items-center justify-center backdrop-blur-md border border-white/10 border-r-0 transition-colors"
      >
        <div className="w-1 h-4 bg-white/50 rounded-full"></div>
      </button>

      <div className="p-6 pl-10 h-full flex flex-col gap-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
            Geo<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Sense</span> AI
          </h1>
          <p className="text-slate-400 text-sm">Automated Land Parcel Measurement</p>
        </div>

        {/* Instructions Panel */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-md">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            How it works
          </h3>
          <ul className="text-sm text-slate-300 space-y-2">
            <li className="flex gap-2"><span className="text-blue-400">1.</span> Draw a bounding box on the map</li>
            <li className="flex gap-2"><span className="text-blue-400">2.</span> Click "Start Land Detection"</li>
            <li className="flex gap-2"><span className="text-blue-400">3.</span> Select the detected land plots</li>
            <li className="flex gap-2"><span className="text-blue-400">4.</span> Calculate the total area</li>
          </ul>

          {selectionHandlers && (
            <div className="mt-5 space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={selectionHandlers.selectAllPolygons}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors border border-white/5"
                >
                  Select All
                </button>
                <button
                  onClick={selectionHandlers.deselectAllPolygons}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 py-2 px-3 rounded-lg text-sm font-medium transition-colors border border-white/5"
                >
                  Clear
                </button>
              </div>
              <button
                onClick={calculateAreas}
                disabled={calculating}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white py-3 px-4 rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all flex justify-center items-center gap-2"
              >
                {calculating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Calculating...
                  </>
                ) : 'Calculate Total Area'}
              </button>
            </div>
          )}
        </div>

        {/* Results Panel */}
        {Object.keys(areas).length > 0 && (
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-5 backdrop-blur-md">
            <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              Calculation Results
            </h4>
            
            <div className="max-h-32 overflow-y-auto pr-2 space-y-2 mb-4 custom-scrollbar">
              {Object.entries(areas).map(([id, area]) => (
                <div key={id} className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Parcel #{id.substring(0,6)}...</span>
                  <span className="text-slate-200 font-mono">{(area / 10000).toFixed(4)} ha</span>
                </div>
              ))}
            </div>
            
            <div className="pt-3 border-t border-blue-500/30 flex justify-between items-center">
              <span className="font-medium text-white">Total Area:</span>
              <div className="text-right">
                <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-mono">
                  {(Object.values(areas).reduce((sum, area) => sum + area, 0) / 10000).toFixed(4)} ha
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {Object.values(areas).reduce((sum, area) => sum + area, 0).toLocaleString(undefined, {maximumFractionDigits: 2})} m²
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-blue-500/30 flex justify-between items-center">
              <span className="font-medium text-white">Appraised Value:</span>
              <div className="text-right">
                <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 font-mono">
                  {Object.values(values).reduce((sum, val) => sum + val, 0).toLocaleString()} GEO
                </div>
              </div>
            </div>
            
            <button 
              className="w-full mt-5 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white py-2.5 px-4 rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all flex justify-center items-center gap-2 group disabled:opacity-50"
              onClick={handleMint}
              disabled={isPending}
            >
              {isPending ? (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-12 transition-transform"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>
              )}
              {isPending ? "Minting..." : "Mint GeoNFT for these Parcels"}
            </button>
          </div>
        )}

        {/* Drawn Features */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-10">
          {features.length > 0 && <h4 className="font-medium text-slate-300 text-sm pl-1 uppercase tracking-wider">Regions of Interest</h4>}
          {features.map(feature => (
            <FeatureCard 
              key={feature._leaflet_id}
              feature={feature}
              setEditDetails={setEditDetails}
              onSegmentationComplete={onSegmentationComplete}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default SideBar;
