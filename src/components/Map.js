import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 22.3072,  // Vadodara
  lng: 73.1812
};

function MapComponent() {
  return (
    <LoadScript googleMapsApiKey="AIzaSyBnIOWkTQZfDW0zMjU0wE5fJUmBELqYxo4">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
      >
        <Marker position={center} />
      </GoogleMap>
    </LoadScript>
  );
}

export default MapComponent;