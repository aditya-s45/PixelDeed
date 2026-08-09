import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';

const SearchControl = () => {
  const map = useMap();

  useEffect(() => {
    // 1. Create the free OpenStreetMap provider
    const provider = new OpenStreetMapProvider();

    // 2. Create the search control
    const searchControl = new GeoSearchControl({
      provider: provider,
      style: 'bar', // This gives it a search bar style
      showMarker: true,
      marker: {
        icon: L.icon({
            iconUrl: '/images/marker-icon.png',
            iconRetinaUrl: '/images/marker-icon-2x.png',
            shadowUrl: '/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        }),
        draggable: false,
      },
      autoClose: true,
      keepResult: true,
    });

    // 3. Add the control to the map
    map.addControl(searchControl);

    // 4. Clean up
    return () => map.removeControl(searchControl);
  }, [map]);

  return null; // This component doesn't render anything itself
};

export default SearchControl;