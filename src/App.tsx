import React, { useRef, useEffect, useState } from 'react';
import './App.css';
import USGSEarthquakeMap from './USGSEarthquakeMap';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div>USGS Earthquake Map</div>
      </header>
      <USGSEarthquakeMap/>

    </div>
  );
}

export default App;
