'use client'
import dynamic from 'next/dynamic'
import SideBar from '@/components/SideBar'
import React, { useState } from 'react'

// Dynamically import the MapComponent with SSR disabled to avoid Leaflet
// (which accesses `window`) being required during server-side rendering.
const MapComponent = dynamic(() => import('@/components/MapComponent'), { ssr: false });

const page = () => {
  const [textMode, setTextMode] = useState(false)
  const [features, setFeatures] = useState([])
  const [editDetails, setEditDetails] = useState({ id: null, newText: '' });
  const [selectionHandlers, setSelectionHandlers] = useState(null);

  const handleSegmentationComplete = async () => {
    const mapComponent = document.querySelector('#map-container');
    if (mapComponent && mapComponent.fetchSegmentationData) {
      await mapComponent.fetchSegmentationData();
    }
  };

  // const MapComponentWithoutSSR = dynamic(() => import('@/components/MapComponent'), { ssr: false });
  return (
    <>
          <div className='w-full h-full' >
    
            {/* Main Component */}
            <div id="main-container">
              <MapComponent
                textMode={textMode} 
                editDetails={editDetails} 
                features={features}
                setFeatures={setFeatures}
                setSelectionHandlers={setSelectionHandlers}
              />
              {/* <EditMode textMode={textMode} setTextMode={setTextMode}/> */}
            </div>
    
            {/* Sidebar */}
            <SideBar 
              features={features} 
              setEditDetails={setEditDetails}
              onSegmentationComplete={handleSegmentationComplete}
              selectionHandlers={selectionHandlers}
            />
          </div>
        </>
  )
}

export default page
