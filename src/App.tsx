import { Itinerary, Map, MapOptions } from './components/Map';
import { Marker } from './components/Marker';
import { Status, Wrapper } from '@googlemaps/react-wrapper';
import { useState } from 'react';

export default function App() {
    const render = (status: Status) => {
        return <h1>{status}</h1>;
    };

    const [clicks, setClicks] = useState<google.maps.LatLng[]>([]);
    // const [zoom, setZoom] = useState(3); // initial zoom
    // const [center, setCenter] = useState<google.maps.LatLngLiteral>();

    const [options, setOptions] = useState<MapOptions>({
        zoom: 12,
        center: {
            lat: -16.6,
            lng: -49.2,
        },
    });

    const [itinerary, setItinerary] = useState<Itinerary>({} as Itinerary);

    // const useEffect(()=>{}, [clicks])

    const onClick = (e: google.maps.MapMouseEvent) => {
        // avoid directly mutating state

        // setClicks([...clicks, e.latLng!]);

        if (!itinerary.origin) {
            setItinerary({ ...itinerary, origin: e.latLng! });
            return;
        }

        if (itinerary.origin && !itinerary.destination) {
            setItinerary({ ...itinerary, destination: e.latLng! });
            return;
        }

        if (itinerary.origin && itinerary.destination) {
            const newItinerary = { ...itinerary };
            const newWaypoints = newItinerary.waypoints || [];
            setItinerary({
                ...itinerary,
                destination: e.latLng!,
                waypoints: [
                    ...newWaypoints,
                    { location: itinerary.destination, stopover: true },
                ],
            });
            return;
        }
    };

    const onIdle = (m: google.maps.Map) => {
        // console.log('onIdle');
        // setZoom(m.getZoom()!);
        // setCenter(m.getCenter()!.toJSON());
    };

    return (
        <div className="h-screen">
            <Wrapper
                apiKey={'AIzaSyCB-ooZaneGDgT8y3WSfQchHMfdN5MSIAE'}
                render={render}
            >
                <Map
                    options={options}
                    setOptions={setOptions}
                    className="h-screen"
                    onClick={onClick}
                    onIdle={onIdle}
                    itinerary={itinerary}
                >
                    {/* {clicks.map((click, i) => {
                        return <Marker position={click} key={i} />;
                    })} */}
                    {itinerary.origin && !itinerary.destination && (
                        <Marker position={itinerary.origin} />
                    )}
                    ;
                </Map>
            </Wrapper>
        </div>
    );
}
