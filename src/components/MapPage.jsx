import React, { useEffect, useCallback } from 'react';

const MapPage = () => {
    // Map Initialization Logic
    const initMap = useCallback(() => {
        // Only run if the Google Maps API object is available
        if (typeof window.google === 'object' && typeof window.google.maps === 'object') {
            const mapElement = document.getElementById('map-canvas');
            if (mapElement) {
                const center = { lat: 34.0522, lng: -118.2437 }; // Los Angeles

                const map = new window.google.maps.Map(mapElement, {
                    center: center,
                    zoom: 10,
                    mapId: "HTML_GEOPORTAL_MAP",
                });

                new window.google.maps.Marker({
                    position: center,
                    map: map,
                    title: 'Center Location',
                });
            }
        }
    }, []);

    // Load Google Maps Script
    useEffect(() => {
        // Check if the script is already loaded
        if (document.querySelector('script[data-map-script]')) {
            initMap();
            return;
        }

        const script = document.createElement('script');
        script.src = "https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY_HERE&callback=initMapWrapper&v=weekly";
        script.async = true;
        script.defer = true;
        script.setAttribute('data-map-script', 'true');

        // Expose the initMap function globally for the API callback
        window.initMapWrapper = initMap;

        document.head.appendChild(script);

        return () => {
            // Optional cleanup
            window.initMapWrapper = null;
        };
    }, [initMap]);

    return (
        <section id="map" className="page-content bg-white p-6 md:p-10 rounded-xl shadow-2xl">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 border-b-2 pb-2">Interactive Map</h2>
            <p className="text-gray-700 mb-6">Explore the world or find specific locations using the interactive map powered by Google Maps.</p>
            <div id="map-container" className="shadow-xl border border-gray-200" style={{ height: '60vh', width: '100%', borderRadius: '0.5rem', overflow: 'hidden' }}>
                {/* The map div */}
                <div id="map-canvas" className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold">
                    Loading Map...
                </div>
            </div>
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-yellow-800">
                **Note:** For the live map to work, you must use a valid Google Maps API Key in the script loading code above.
            </div>
        </section>
    );
};

export default MapPage;