import { useState, useEffect } from 'react';
import { useJsApiLoader } from '@react-google-maps/api'; // <-- IMPORT HERE
import NavBar from './components/NavBar.jsx';
import HomePage from './components/HomePage.jsx';
import AboutPage from './components/AboutPage.jsx';
import ServicesPage from './components/ServicesPage.jsx';
import Footer from './components/Footer.jsx';

// --- CONFIGURATION ---
const libraries = ["places"];
// ---------------------

const App = () => {
  // 1. Load the Google Maps script ONLY ONCE
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyAtGp-mWvulIvwO5pozUn0_S4Q7THlw9lM", // <-- Key moved here
    id: 'geo-portal-map-script',
    libraries: libraries,
  });

  // Определение начальной страницы на основе hash в URL
  const getInitialPage = () => {
    const hash = window.location.hash.substring(1);
    if (hash === 'about' || hash === 'services' || hash === 'home') {
      return hash;
    }
    return 'home';
  };

  const [activePage, setActivePage] = useState(getInitialPage);

  // Обновление hash в URL при изменении активной страницы
  useEffect(() => {
    if (window.location.hash !== `#${activePage}`) {
      window.history.pushState(null, '', `#${activePage}`);
    }
  }, [activePage]);

  // Обработка навигации назад/вперед в браузере
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.substring(1);
      if (hash === 'about' || hash === 'services' || hash === 'home') {
        setActivePage(hash);
      } else {
        setActivePage('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const renderPage = () => {
    switch (activePage) {
      case 'about':
        return <AboutPage />;
      case 'services':
        return <ServicesPage />;
      // case 'map':
      //   // Note: If you still have a separate MapPage, you can pass the status here too.
      //   return <MapPage key="map" />;
      case 'home':
      default:
        // 2. PASS the loading status to the HomePage component
        return <HomePage
          setActivePage={setActivePage}
          isMapLoaded={isLoaded}          // <-- NEW PROP
          mapLoadError={loadError}        // <-- NEW PROP
        />;
    }
  };

  return (
    <div className="antialiased font-inter bg-gray-100 app-wrapper">
      <NavBar activePage={activePage} setActivePage={setActivePage} />
      <main className="max-w-7xl mx-auto p-0 sm:p-0 lg:p-0 app-main-content">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
};

export default App;