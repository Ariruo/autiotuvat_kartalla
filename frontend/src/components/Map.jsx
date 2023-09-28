import React, { useState, useEffect, lazy, useRef  } from "react";
import Map, { Marker, Popup, Source, Layer, NavigationControl,GeolocateControl,} from "react-map-gl";

import Coordinatecabin from "./Coordinatescabin";
import getUserCoordinates from "../service/getUserCoordinates";
import calculateDistance from "../service/calculateDistance"; 
import SearchBar from "./Searchbar";
import SearchResultList from "./SearchResultList";
;
import fetchData from "../api/fetch";
import CustomMarker from "./CustomMarker";
import useToggleAndFetchData from "../hooks/toggleAndFetchData";
import 'mapbox-gl/dist/mapbox-gl.css';

import CustomClusterMarker from "./CustomClusterMarker";
import useCluster from "../hooks/useCluster";
import Sidebar from "./Sidebar";
import autiotupaIcon from '../../assets/autiotupa.png'



export default function Mapp() {


  const MapID = import.meta.env.VITE_MAPBOX_TOKEN || process.env.MAPID;
  const GeoAPI = import.meta.env.VITE_GEOAPI_TOKEN || process.env.GEOAPI;

const [open, setOpen] = useState(false);
const [distance, setDistance] = useState(null)
const [userCoordinates, setUserCoordinates] = useState(null);
const [closestParkIndex, setClosestParkIndex] = useState();


const [showCabins, setShowCabins] = useState(true);
const [originalData , setOriginaldata] = useState([]);
const [FilteredData, setFilteredData] = useState([]);  
const [selectedPark, setSelectedPark] = useState(null);
const [input, setInput] = useState("");
const [showSearchResults, setShowSearchResults] = useState(false);
const [hoveredPark, setHoveredPark] = useState(null);

const [viewState, setViewState] = useState({longitude: 23.72018736381,latitude: 68.342938678895,zoom: 10,})

const [nuotiopaikkaData, loadingnuotipaikka] = useToggleAndFetchData(async () => await fetchData("http://localhost:9000/api/allnuotiopaikkapoints"));
const [showNuotipaikka, setShowNuotipaikka] = useState(false);
const [varaustupaData, loadingvaraus ] = useToggleAndFetchData(async () => await fetchData("http://localhost:9000/api/allvaraustupapoints"));
const [showVaraustupas, setShowVaraustupas] = useState(false);
const [kotaData, loadingkota] = useToggleAndFetchData(async () => await fetchData("http://localhost:9000/api/allkotapoints"));
const [showKota, setShowKota] = useState(false);
const [laavuData, loadinglaavu] = useToggleAndFetchData(async () => await fetchData("http://localhost:9000/api/alllaavupoints"));
const [showLaavu, setShowLaavu] = useState(false);
const [paivatupaData, loadingpaivatupa] = useToggleAndFetchData(async () => await fetchData("http://localhost:9000/api/allpaivatupapoints"));
const [showPaivatupa, setShowPaivatupa] = useState(false);
const [kammiData, loadingkammi] = useToggleAndFetchData(async () => await fetchData("http://localhost:9000/api/allkammipoints"));
const [showKammi, setShowKammi] = useState(false);
const [saunaData, loadingsauna] = useToggleAndFetchData(async () => await fetchData("http://localhost:9000/api/allsaunapoints"));
const [showSauna, setShowSauna] = useState(false);
const [lintutorniData, loadinglintutorni] = useToggleAndFetchData(async () => await fetchData("http://localhost:9000/api/alllintutornipoints"));
const [showLintutorni, setShowLintutorni] = useState(false);
const [nahtavyysData, loadingnahtavyys] = useToggleAndFetchData(async () => await fetchData("http://localhost:9000/api/allnahtavyyspoints"));
const [showNahtavyys, setShowNahtavyys] = useState(false);
const [luolaData, loadingluola] = useToggleAndFetchData(async () => await fetchData("http://localhost:9000/api/allluolapoints"));
const [showLuola, setShowLuola] = useState(false);
const [lahdeData, loadinglahde] = useToggleAndFetchData(async () => await fetchData("http://localhost:9000/api/alllahdepoints"));
const [showLahde, setShowLahde] = useState(false);








useEffect(() => {
  fetchData('http://localhost:9000/api/allcabinspoints')
    .then((parks) => {
      setFilteredData(parks);
      setOriginaldata(parks);
    });
}, []);

const autiotupapoints = originalData
? originalData.map(feature => ({
    type: "Feature",
    properties: { cluster: false, name: feature.properties.name, tyyppi: feature.properties.tyyppi, maakunta: feature.properties.maakunta },
    geometry: {
      type: "Point",
      coordinates: [
        feature.geometry.coordinates[1], 
        feature.geometry.coordinates[0]
      ]
    }
  }))
: [];






     const mapRef = useRef();
    const bounds = mapRef.current
    ? mapRef.current
        .getMap()
        .getBounds()
        .toArray()
        .flat()
    : null;

    const { clusters: varaustupa } = useCluster(varaustupaData, bounds, viewState.zoom);
    const { clusters: autiotupa } = useCluster(autiotupapoints, bounds, viewState.zoom);
    const { clusters: nuotiopaikka } = useCluster(nuotiopaikkaData, bounds, viewState.zoom);
    const { clusters: kota } = useCluster(kotaData, bounds, viewState.zoom);
    const { clusters: laavu } = useCluster(laavuData, bounds, viewState.zoom);
    const { clusters: paivatupa } = useCluster(paivatupaData, bounds, viewState.zoom);
    const { clusters: kammi } = useCluster(kammiData, bounds, viewState.zoom);
    const { clusters: sauna } = useCluster(saunaData, bounds, viewState.zoom);
    const { clusters: lintutorni } = useCluster(lintutorniData, bounds, viewState.zoom);
    const { clusters: nahtavyys } = useCluster(nahtavyysData, bounds, viewState.zoom);
    const { clusters: luola } = useCluster(luolaData, bounds, viewState.zoom);
    const { clusters: lahde } = useCluster(lahdeData, bounds, viewState.zoom);



    useEffect(() => {
      // Get the user's real-time coordinates
      getUserCoordinates().then((coordinates) => {
        setUserCoordinates(coordinates);
        setViewState({
          longitude: coordinates.longitude,
          latitude: coordinates.latitude,
          zoom: 13,
        });
      });
    }, []);

    const calculateAndSetDistance = (park) => {
      if (userCoordinates && park) {
        const userLat = userCoordinates.latitude;
        const userLon = userCoordinates.longitude;
        const parkCoordinates = {
          latitude: park.geometry.coordinates[1],
          longitude: park.geometry.coordinates[0],
        };
        const dist = calculateDistance(
          userLat,
          userLon,
          parkCoordinates.latitude,
          parkCoordinates.longitude
        );
        setDistance(dist);
      } else {
        setDistance(null);
      }
    };
  
    useEffect(() => {
      // Calculate the distance when a park is selected or deselected
      calculateAndSetDistance(selectedPark);
    }, [selectedPark, userCoordinates]);


const handleMarkerHover = (event, park) => {
  event.preventDefault();
  setHoveredPark(park);
};

const handleMarkerLeave = () => {
  setHoveredPark(null);
};

const handleFindClosestPark = () => {
  if (FilteredData.length > 0) {
    const closestPark = FilteredData[0];

    // Swap coordinates and create a new closestPark object
    const swappedClosestPark = {
      ...closestPark,
      geometry: {
        type: closestPark.geometry.type,
        coordinates: [closestPark.geometry.coordinates[1], closestPark.geometry.coordinates[0]],
      },
    };
    const newZoom = viewState.zoom + 1
    setSelectedPark(swappedClosestPark); // Set the closestPark with swapped coordinates
    setInput("");
    setShowSearchResults(false);
    mapRef.current.getMap().easeTo({
      center: [closestPark.geometry.coordinates[1], closestPark.geometry.coordinates[0]], // Set the new center
      zoom: newZoom, // Use the updated zoom level
      essential: true, // This ensures the animation is treated as an essential gesture
       
    });
    setShowCabins(true)
  }
};

const toggleSidebar = () => {
  setOpen(!open);
};

const handleResultClick = (park) => {
  // Swap coordinates and create a new park object
  const swappedPark = {
    ...park,
    geometry: {
      type: park.geometry.type,
      coordinates: [park.geometry.coordinates[1], park.geometry.coordinates[0]],
    },
  };

  setSelectedPark(swappedPark); // Set the park with swapped coordinates
  setInput("");
  setShowSearchResults(false);

  // Calculate the new zoom level
  const newZoom = viewState.zoom + 1; // You can adjust the value as needed

  // Use map.flyTo to smoothly transition to the new viewState with a zooming effect
  mapRef.current.getMap().easeTo({
    center: [park.geometry.coordinates[1], park.geometry.coordinates[0]], // Set the new center
    zoom: newZoom, // Use the updated zoom level
    essential: true, // This ensures the animation is treated as an essential gesture
     
  });

  // Set showCabins to true when handling the result click
  setShowCabins(true);
};



  
  useEffect(() => {
    console.log(showNuotipaikka)
    console.log(showLaavu)
  }, [showNuotipaikka, showLaavu])



  const handleFindClosestParkbutton = () => {
    if (userCoordinates && FilteredData.length > 0) {
      const allDataPoints = [
        autiotupapoints,
        varaustupaData,
        nuotiopaikkaData,
        kotaData,
        laavuData,
        paivatupaData,
        kammiData,
        saunaData,
        lintutorniData,
        nahtavyysData,
        luolaData,
        lahdeData,
      ].flat();
  
      // Find the closest parks
      const getClosestParks = (numParks) => {
        const sortedParks = allDataPoints.slice().sort((a, b) => {
          const distanceA = calculateDistance(
            userCoordinates.latitude,
            userCoordinates.longitude,
            a.geometry.coordinates[1],
            a.geometry.coordinates[0]
          );
          const distanceB = calculateDistance(
            userCoordinates.latitude,
            userCoordinates.longitude,
            b.geometry.coordinates[1],
            b.geometry.coordinates[0]
          );
          return distanceA - distanceB;
        });
  
        return sortedParks.slice(0, numParks);
      };
  
      if (!selectedPark) {
        // If no park is selected, select the first one
        const closestParks = getClosestParks(10); // Change 10 to the desired number of closest parks to display
        if (closestParks.length > 0) {
          const newSelectedPark = closestParks[0]; // Select the first park in the list
          setSelectedPark(newSelectedPark);
          setClosestParkIndex(0); // Initialize the index
  
          // Update the viewState to focus on the selected park
         
          mapRef.current.getMap().easeTo({
            center: [
              newSelectedPark.geometry.coordinates[0],
              newSelectedPark.geometry.coordinates[1],
            ],
            zoom: 12,
            essential: true,
          });
  
          // Set showLaavu and showNuotipaikka states based on the park type
          setShowLaavu(newSelectedPark.properties.tyyppi === 'Laavu');
          setShowNuotipaikka(newSelectedPark.properties.tyyppi === 'Nuotiopaikka');
          setShowCabins(newSelectedPark.properties.tyyppi === 'Autiotupa');
          setShowVaraustupas(newSelectedPark.properties.tyyppi === 'Varaustupa');
          setShowKota(newSelectedPark.properties.tyyppi === 'Kota');
          setShowPaivatupa(newSelectedPark.properties.tyyppi === 'Päivätupa');
          setShowKammi(newSelectedPark.properties.tyyppi === 'Kammi');
          setShowSauna(newSelectedPark.properties.tyyppi === 'Sauna');
          setShowLintutorni(newSelectedPark.properties.tyyppi === 'Lintutorni');
          setShowNahtavyys(newSelectedPark.properties.tyyppi === 'Nähtävyys');
          setShowLuola(newSelectedPark.properties.tyyppi === 'Luola');
          setShowLahde(newSelectedPark.properties.tyyppi === 'Lähde');
  
       
        }
      } else {
        // If a park is already selected, move to the next one in the list
        const closestParks = getClosestParks(10); // Change 10 to the desired number of closest parks to display
        const currentIndex = closestParkIndex;
        const nextIndex = (currentIndex + 1) % closestParks.length; // Circular index
        const newSelectedPark = closestParks[nextIndex]; // Select the next park in the list
  
        setSelectedPark(newSelectedPark);
        setClosestParkIndex(nextIndex); // Update the index
  
        // Update the viewState to focus on the selected park
       
        mapRef.current.getMap().easeTo({
          center: [
            newSelectedPark.geometry.coordinates[0],
            newSelectedPark.geometry.coordinates[1],
          ],
          zoom: 12,
          essential: true,
        });
  
        // Set show states based on the park type
        setShowLaavu(newSelectedPark.properties.tyyppi === 'Laavu');
        setShowNuotipaikka(newSelectedPark.properties.tyyppi === 'Nuotiopaikka');
        setShowCabins(newSelectedPark.properties.tyyppi === 'Autiotupa');
        setShowVaraustupas(newSelectedPark.properties.tyyppi === 'Varaustupa');
        setShowKota(newSelectedPark.properties.tyyppi === 'Kota');
        setShowPaivatupa(newSelectedPark.properties.tyyppi === 'Päivätupa');
        setShowKammi(newSelectedPark.properties.tyyppi === 'Kammi');
        setShowSauna(newSelectedPark.properties.tyyppi === 'Sauna');
        setShowLintutorni(newSelectedPark.properties.tyyppi === 'Lintutorni');
        setShowNahtavyys(newSelectedPark.properties.tyyppi === 'Nähtävyys');
        setShowLuola(newSelectedPark.properties.tyyppi === 'Luola');
        setShowLahde(newSelectedPark.properties.tyyppi === 'Lähde');

      }
    }
  };
  
  

  
   
  
  

 
  return (
    <div>
 


      <Map
        mapboxAccessToken={MapID}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        
        mapStyle="mapbox://styles/mapbox/outdoors-v12"
        style={{ width: "99,9vw", height: "94vh", position: "relative", top: 0, left: 0 }}
        ref={mapRef}
        >

<SearchBar 
setResults={setFilteredData} 
setInput={setInput} 
input={input} 
setShowSearchResults={setShowSearchResults} 
open={open}
setOpen={setOpen}
toggleSidebar={toggleSidebar} 
onClick={handleFindClosestPark}
/>



{showSearchResults && FilteredData && FilteredData.length > 0 && <SearchResultList results={FilteredData} onResultClick={handleResultClick} />}
 
 <Sidebar
 setOpen={setOpen}
 open={open}
 toggleSidebar={toggleSidebar}
 showCabins={showCabins}
 setShowCabins={setShowCabins}
 
 showVaraustupas={showVaraustupas}
 setShowVaraustupas={setShowVaraustupas}
showNuotipaikka={showNuotipaikka}
setShowNuotipaikka={setShowNuotipaikka}
showKota={showKota}
setShowKota={setShowKota}
showLaavu={showLaavu}
setShowLaavu={setShowLaavu}
showPaivatupa={showPaivatupa}
setShowPaivatupa={setShowPaivatupa}
showKammi={showKammi}
setShowKammi={setShowKammi}
showSauna={showSauna}
setShowSauna={setShowSauna}
 showLintutorni={showLintutorni}
  setShowLintutorni={setShowLintutorni}
showNahtavyys={showNahtavyys}
setShowNahtavyys={setShowNahtavyys}
 showLuola={showLuola}
  setShowLuola={setShowLuola}
 showLahde={showLahde}
 setShowLahde={setShowLahde}
 
 />

<button
  className="z-50 fixed top-20  bg-white p-2 border rounded-md shadow-md cursor-pointer"
  onClick={handleFindClosestParkbutton}
  style={{ left: '17%' }}
>
  <img src="assets/nearby-icon-15.jpg" alt="nearby.png" style={{ width: '30px', height: '30px' }} />
</button>
 

{hoveredPark && (
          <Popup
            latitude={hoveredPark.geometry.coordinates[1]}
            longitude={hoveredPark.geometry.coordinates[0]}
            closeButton={false}
            onClose={() => setHoveredPark(null)}
            anchor="bottom"
          >
            <div>
              <div>{hoveredPark.properties.name} ({hoveredPark.properties.tyyppi})</div>
            </div>
          </Popup>
        )}



{showCabins && autiotupa.map((cluster, index) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const {cluster: isCluster} = cluster.properties;

          if (isCluster) {
            return (
            <CustomClusterMarker key={`cluster-${cluster.id}`} cluster={cluster} points={autiotupapoints} backgroundColor="#fd0303" />
              );
            }
          return (
            <CustomMarker
            key={index}
            latitude={latitude}
            longitude={longitude}
            handleMarkerHover={handleMarkerHover}
            setSelectedPark={setSelectedPark}
            handleMarkerLeave={handleMarkerLeave}
            park={cluster}
            iconUrl={autiotupaIcon}
           
            />
              
          );
        })}

{showVaraustupas && varaustupa.map((cluster, index) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const {cluster: isCluster} = cluster.properties;
        
          if (isCluster) {
            return (
            <CustomClusterMarker key={`cluster-${cluster.id}`} cluster={cluster} points={varaustupaData} backgroundColor="#a50000" />
              );
            }
          return (
            <CustomMarker
            key={index}
            latitude={latitude}
            longitude={longitude}
            handleMarkerHover={handleMarkerHover}
            setSelectedPark={setSelectedPark}
            handleMarkerLeave={handleMarkerLeave}
            park={cluster}
            iconUrl={`https://api.geoapify.com/v1/icon/?type=material&color=%23a50000&size=small&iconType=awesome&iconSize=small&textSize=small&noWhiteCircle&apiKey=${GeoAPI}`}
            />
            
          );
        })}



             
 
{showNuotipaikka && nuotiopaikka.map((cluster, index) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const {cluster: isCluster} = cluster.properties;
        
          if (isCluster) {
            return (
            <CustomClusterMarker key={`cluster-${cluster.id}`} cluster={cluster} points={nuotiopaikkaData} backgroundColor="#ff4500" />
              );
            }
          return (
            <CustomMarker
            key={index}
            latitude={latitude}
            longitude={longitude}
            handleMarkerHover={handleMarkerHover}
            setSelectedPark={setSelectedPark}
            handleMarkerLeave={handleMarkerLeave}
            park={cluster}
            iconUrl={`https://api.geoapify.com/v1/icon/?type=material&color=%238b4513&size=small&iconType=awesome&iconSize=small&textSize=small&noWhiteCircle&apiKey=${GeoAPI}`}
            />
            
          );
        })}

{showKota && kota.map((cluster, index) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const {cluster: isCluster} = cluster.properties;
        
          if (isCluster) {
            return (
            <CustomClusterMarker key={`cluster-${cluster.id}`} cluster={cluster} points={kotaData} backgroundColor="#8b4513" />
              );
            }
          return (
            <CustomMarker
            key={index}
            latitude={latitude}
            longitude={longitude}
            handleMarkerHover={handleMarkerHover}
            setSelectedPark={setSelectedPark}
            handleMarkerLeave={handleMarkerLeave}
            park={cluster}
            iconUrl={`https://api.geoapify.com/v1/icon/?type=material&color=%238b4513&size=small&iconType=awesome&iconSize=small&textSize=small&noWhiteCircle&apiKey=${GeoAPI}`}
            />
            
          );
        })}


{showLaavu && laavu.map((cluster, index) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const {cluster: isCluster} = cluster.properties;
        
          if (isCluster) {
            return (
            <CustomClusterMarker key={`cluster-${cluster.id}`} cluster={cluster} points={laavuData} backgroundColor='#f5deb3' />
              );
            }
          return (
            <CustomMarker
            key={index}
            latitude={latitude}
            longitude={longitude}
            handleMarkerHover={handleMarkerHover}
            setSelectedPark={setSelectedPark}
            handleMarkerLeave={handleMarkerLeave}
            park={cluster}
            iconUrl={`https://api.geoapify.com/v1/icon/?type=material&color=%23f5deb3&size=small&iconType=awesome&iconSize=small&textSize=small&noWhiteCircle&apiKey=${GeoAPI}`}
            />
            
          );
        })}

{showPaivatupa && paivatupa.map((cluster, index) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const {cluster: isCluster} = cluster.properties;
        
          if (isCluster) {
            return (
            <CustomClusterMarker key={`cluster-${cluster.id}`} cluster={cluster} points={paivatupaData} backgroundColor='#ff6b6b' />
              );
            }
          return (
            <CustomMarker
            key={index}
            latitude={latitude}
            longitude={longitude}
            handleMarkerHover={handleMarkerHover}
            setSelectedPark={setSelectedPark}
            handleMarkerLeave={handleMarkerLeave}
            park={cluster}
            iconUrl={`https://api.geoapify.com/v1/icon/?type=material&color=%23ff6b6b&size=small&iconType=awesome&iconSize=small&textSize=small&noWhiteCircle&apiKey=${GeoAPI}`}
            />
            
          );
        })}

{showKammi && kammi.map((cluster, index) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const {cluster: isCluster} = cluster.properties;
        
          if (isCluster) {
            return (
            <CustomClusterMarker key={`cluster-${cluster.id}`} cluster={cluster} points={kammiData} backgroundColor='#6b8e23' />
              );
            }
          return (
            <CustomMarker
            key={index}
            latitude={latitude}
            longitude={longitude}
            handleMarkerHover={handleMarkerHover}
            setSelectedPark={setSelectedPark}
            handleMarkerLeave={handleMarkerLeave}
            park={cluster}
            iconUrl={`https://api.geoapify.com/v1/icon/?type=material&color=%236b8e23&size=small&iconType=awesome&iconSize=small&textSize=small&noWhiteCircle&apiKey=${GeoAPI}`}
            />
            
          );
        })}

{showSauna && sauna.map((cluster, index) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const {cluster: isCluster} = cluster.properties;
        
          if (isCluster) {
            return (
            <CustomClusterMarker key={`cluster-${cluster.id}`} cluster={cluster} points={saunaData} backgroundColor="#8d8067" />
              );
            }
          return (
            <CustomMarker
            key={index}
            latitude={latitude}
            longitude={longitude}
            handleMarkerHover={handleMarkerHover}
            setSelectedPark={setSelectedPark}
            handleMarkerLeave={handleMarkerLeave}
            park={cluster}
            iconUrl={`https://api.geoapify.com/v1/icon/?type=material&color=%238d8067&size=small&iconType=awesome&iconSize=small&textSize=small&noWhiteCircle&apiKey=${GeoAPI}`}
            />
            
          );
        })}

{showLintutorni && lintutorni.map((cluster, index) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const {cluster: isCluster} = cluster.properties;
        
          if (isCluster) {
            return (
            <CustomClusterMarker key={`cluster-${cluster.id}`} cluster={cluster} points={lintutorniData} backgroundColor="#00ca1b" />
              );
            }
          return (
            <CustomMarker
            key={index}
            latitude={latitude}
            longitude={longitude}
            handleMarkerHover={handleMarkerHover}
            setSelectedPark={setSelectedPark}
            handleMarkerLeave={handleMarkerLeave}
            park={cluster}
            iconUrl={`https://api.geoapify.com/v1/icon/?type=material&color=%2300ca1b&size=small&iconType=awesome&iconSize=small&textSize=small&noWhiteCircle&apiKey=${GeoAPI}`}
            />
            
          );
        })}

{showNahtavyys && nahtavyys.map((cluster, index) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const {cluster: isCluster} = cluster.properties;
      
          if (isCluster) {
            return (
            <CustomClusterMarker key={`cluster-${cluster.id}`} cluster={cluster} points={nahtavyysData} backgroundColor="#ffd700" /> 
              );
            }
          return (
            <CustomMarker
            key={index}
            latitude={latitude}
            longitude={longitude}
            handleMarkerHover={handleMarkerHover}
            setSelectedPark={setSelectedPark}
            handleMarkerLeave={handleMarkerLeave}
            park={cluster}
            iconUrl={`https://api.geoapify.com/v1/icon/?type=material&color=%23ffd700&size=small&iconType=awesome&iconSize=small&textSize=small&noWhiteCircle&apiKey=${GeoAPI}`}
            />
            
          );
        })}

{showLuola && luola.map((cluster, index) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const {cluster: isCluster} = cluster.properties;
        
          if (isCluster) {
            return (
            <CustomClusterMarker key={`cluster-${cluster.id}`} cluster={cluster} points={luolaData} backgroundColor="#9b9b9b" />
              );
            }
          return (
            <CustomMarker
            key={index}
            latitude={latitude}
            longitude={longitude}
            handleMarkerHover={handleMarkerHover}
            setSelectedPark={setSelectedPark}
            handleMarkerLeave={handleMarkerLeave}
            park={cluster}
            iconUrl={`https://api.geoapify.com/v1/icon/?type=material&color=%239b9b9b&size=small&iconType=awesome&iconSize=small&textSize=small&noWhiteCircle&apiKey=${GeoAPI}`}
            />
            
          );
        })}

{showLahde && lahde.map((cluster, index) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const {cluster: isCluster} = cluster.properties;
        
          if (isCluster) {
            return (
            <CustomClusterMarker key={`cluster-${cluster.id}`} cluster={cluster} points={lahdeData} backgroundColor="#2900ff" />
              );
            }
          return (
            <CustomMarker
            key={index}
            latitude={latitude}
            longitude={longitude}
            handleMarkerHover={handleMarkerHover}
            setSelectedPark={setSelectedPark}
            handleMarkerLeave={handleMarkerLeave}
            park={cluster}
            iconUrl={`https://api.geoapify.com/v1/icon/?type=material&color=%232900ff&size=small&iconType=awesome&iconSize=small&textSize=small&noWhiteCircle&apiKey=${GeoAPI}`}
            />
            
          );
        })}
   
   



  
 

 
 {selectedPark && (
            <Popup 
            latitude={selectedPark.geometry.coordinates[1]}
            longitude={selectedPark.geometry.coordinates[0]}
            anchor="bottom"
            closeOnClick={false}
            onClose={() => {
              setSelectedPark(null);
            }}
            >
          <h2 className="text-center text-2xl font-semibold">{selectedPark.properties.name}</h2>
          <p className="mt-1 text-center font-semibold">{selectedPark.properties.tyyppi}</p>
<p className="mt-1 text-center font-semibold"> {selectedPark.properties.maakunta}</p>
{distance && (
              <p className="mt-1 text-center font-semibold">Distance: {distance.toFixed(2)} Km</p>
            )}
            <Coordinatecabin
            latitude={selectedPark.geometry.coordinates[1]}
            longitude={selectedPark.geometry.coordinates[0]}
            />
          </Popup>)}


    
       
     
        <GeolocateControl
        positionOptions={{ enableHighAccuracy: true }}
        trackUserLocation={true}
        showUserHeading={true}
        showAccuracyCircle={false}
        showUserLocation={true}
        />
      </Map>




    </div>
  );
}