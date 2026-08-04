import React, { useState, useEffect } from 'react';

const FeatureCard = ({ feature, setEditDetails, searchTerm, onSegmentationComplete }) => {
    const [copied, setCopied] = useState(false);
    const [detecting, setDetecting] = useState(false);

    let geojsonFeature = feature.toGeoJSON();
    let type = geojsonFeature.geometry.type;

    useEffect(() => {
        if (copied) {
            setTimeout(() => {
                setCopied(false);
            }, 1500);
        }
    }, [copied]);

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(geojsonFeature));
        setCopied(true);
    };

    const sendMinMaxToServer = async (min, max) => {
        setDetecting(true);
        console.log(`Sending Min and Max values to server: ${min}, ${max}`);
        try {
            const response = await fetch('http://127.0.0.1:5010/minmax', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ min, max }),
            });
            if (response.ok) {
                console.log('Min and Max values sent successfully');
                if (onSegmentationComplete && typeof onSegmentationComplete === 'function') {
                    await onSegmentationComplete();
                }
            } else {
                console.error('Failed to send Min and Max values', response.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
        setDetecting(false);
    };

    const getMinMaxCoordinates = (coordinates) => {
        let minLat = Number.POSITIVE_INFINITY;
        let maxLat = Number.NEGATIVE_INFINITY;
        let minLng = Number.POSITIVE_INFINITY;
        let maxLng = Number.NEGATIVE_INFINITY;

        coordinates.forEach(line => {
            line.forEach(point => {
                const [lng, lat] = point;
                if (lat < minLat) minLat = lat;
                if (lat > maxLat) maxLat = lat;
                if (lng < minLng) minLng = lng;
                if (lng > maxLng) maxLng = lng;
            });
        });

        return {
            min: [minLat, minLng],
            max: [maxLat, maxLng]
        };
    };

    if (type !== "Polygon") return null;

    const { min, max } = getMinMaxCoordinates(geojsonFeature.geometry.coordinates);

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-blue-500/50 transition-colors backdrop-blur-sm group">
            <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                        <polyline points="2 17 12 22 22 17"></polyline>
                        <polyline points="2 12 12 17 22 12"></polyline>
                    </svg>
                    <span className="font-medium text-slate-200 text-sm">Target BBox</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-mono">#{feature._leaflet_id}</span>
                    <button 
                        onClick={handleCopy}
                        className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
                        title="Copy GeoJSON"
                    >
                        {copied ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        )}
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-400">
                    <div className="bg-black/20 p-2 rounded border border-white/5">
                        <div className="text-[10px] text-slate-500 mb-1 uppercase">Min Coordinates</div>
                        <div>{min[0].toFixed(5)}, {min[1].toFixed(5)}</div>
                    </div>
                    <div className="bg-black/20 p-2 rounded border border-white/5">
                        <div className="text-[10px] text-slate-500 mb-1 uppercase">Max Coordinates</div>
                        <div>{max[0].toFixed(5)}, {max[1].toFixed(5)}</div>
                    </div>
                </div>

                <button 
                    onClick={() => sendMinMaxToServer(min, max)}
                    disabled={detecting}
                    className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] disabled:opacity-50 disabled:cursor-wait"
                >
                    {detecting ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Detecting Parcels...
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                            Start AI Land Detection
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default FeatureCard;