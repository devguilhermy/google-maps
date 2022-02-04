import { Map } from './components/Map';
import { Marker } from './components/Marker';
import { Status, Wrapper } from '@googlemaps/react-wrapper';
import { useState } from 'react';

export default function App() {
    const render = (status: Status) => {
        return <h1>{status}</h1>;
    };

    const [clicks, setClicks] = useState<google.maps.LatLng[]>([]);
    const [zoom, setZoom] = useState(3); // initial zoom
    const [center, setCenter] = useState<google.maps.LatLngLiteral>({
        lat: -15.9,
        lng: 46.9,
    });

    const onClick = (e: google.maps.MapMouseEvent) => {
        // avoid directly mutating state
        setClicks([...clicks, e.latLng!]);
    };

    const onIdle = (m: google.maps.Map) => {
        console.log('onIdle');
        setZoom(m.getZoom()!);
        setCenter(m.getCenter()!.toJSON());
    };

    return (
        <div className="h-screen">
            <Wrapper
                apiKey={'AIzaSyCB-ooZaneGDgT8y3WSfQchHMfdN5MSIAE'}
                render={render}
            >
                <Map
                    options={{ zoom, center }}
                    className="h-screen"
                    onClick={onClick}
                    onIdle={onIdle}
                >
                    {clicks.map((click) => {
                        return <Marker position={click} />;
                    })}
                </Map>
            </Wrapper>
        </div>
    );
}
