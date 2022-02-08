import { Map, MapOptions } from './components/Map';
import { Marker } from './components/Marker';
import { Status, Wrapper } from '@googlemaps/react-wrapper';
import { toast, ToastContainer } from 'react-toastify';
import { useEffect, useMemo, useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';

type ActiveInput = 'origin' | 'destination' | 'waypoint';
export interface Itinerary {
    origin?: { location: google.maps.LatLng; address: string };
    destination?: { location: google.maps.LatLng; address: string };
    waypoints?: {
        location: google.maps.DirectionsWaypoint;
        address: string;
    }[];
}
interface NewLocation {
    location: google.maps.LatLng;
    address: string;
}

export default function App() {
    // LOCATION INPUTS
    const [input_origin, setInputOrigin] = useState<string>('');
    const [input_destination, setInputDestination] = useState<string>('');
    const [input_waypoint, setInputWaypoint] = useState<string>('');
    const [active_input, setActiveInput] = useState<ActiveInput>('origin');
    const [itinerary, setItinerary] = useState<Itinerary>();

    // MAP DEFINITIONS ------------------------------------------
    const [map, setMap] = useState<google.maps.Map>();
    const [map_options, setOptions] = useState<MapOptions>({
        zoom: 12,
        center: {
            lat: -16.6,
            lng: -49.2,
        },
    });

    // GOOGLE MAPS SERVICES ------------------------------------------
    const [geocoder, setGeocoder] = useState<google.maps.Geocoder>();
    const [DirectionsService, setDirectionsService] =
        useState<google.maps.DirectionsService>();
    const [DirectionsRenderer, setDirectionsRenderer] =
        useState<google.maps.DirectionsRenderer>();

    // OBTÉM DIREÇÕES SE ITINERÁRIO FOR MUDADO
    useEffect(() => {
        getDirections();
    }, [itinerary, getDirections]);

    // HANDLERS ------------------------------------------

    function handleUpdateItinerary(update: {
        location: google.maps.LatLng;
        address: string;
    }) {
        if (active_input === 'origin') {
            setItinerary({
                ...itinerary,
                origin: { location: update.location, address: update.address },
            });
            setInputOrigin(update.address);
        } else if (active_input === 'destination') {
            setItinerary({
                ...itinerary,
                destination: {
                    location: update.location,
                    address: update.address,
                },
            });
            setInputDestination(update.address);
        } else if (active_input === 'waypoint') {
            setItinerary({
                ...itinerary,
                waypoints: [
                    {
                        location: {
                            location: update.location,
                            stopover: true,
                        },
                        address: update.address,
                    },
                ],
            });
            setInputWaypoint(update.address);
        }
    }

    // OBTER LOCAL A PARTIR DE ENDEREÇO DIGITADO
    async function findAddress() {
        let address = '';
        switch (active_input) {
            case 'origin':
                address = input_origin;
                break;
            case 'destination':
                address = input_destination;
                break;
            case 'waypoint':
                address = input_waypoint;
                break;
            default:
                break;
        }

        const geocoding = await getGeocoding(
            { address, location: {} as google.maps.LatLng },
            'address'
        );
        if (geocoding) {
            handleUpdateItinerary({
                location: geocoding.geometry.location,
                address: geocoding.formatted_address,
            });
        }
    }

    // EVENTS ------------------------------------------
    async function onClick(e: google.maps.MapMouseEvent) {
        // handleItineraryChange({
        //     newLocation: { location: e.latLng!, address: '' },
        //     mode: 'map_click',
        // });
        const geocoding = await getGeocoding(
            { location: e.latLng!, address: '' },
            'location'
        );

        if (geocoding) {
            // ATUALIZA ITINERÁRIO
            handleUpdateItinerary({
                location: geocoding.geometry.location,
                address: geocoding.formatted_address,
            });

            if (active_input === 'origin') {
                setActiveInput('destination');
            } else if (active_input === 'destination') {
                setActiveInput('waypoint');
            } else if (active_input === 'waypoint') {
                setActiveInput('waypoint');
            }
        } else {
            toast('Sem resultados');
        }
    }

    function onIdle(m: google.maps.Map) {
        // console.log('onIdle');
        // setZoom(m.getZoom()!);
        // setCenter(m.getCenter()!.toJSON());
    }

    function render(status: Status) {
        return <h1>{status}</h1>;
    }

    // SERVICES ------------------------------------------

    async function getGeocoding(
        new_location: NewLocation,
        type: 'address' | 'location'
    ): Promise<google.maps.GeocoderResult | null> {
        let geocoding = null;
        let request = null;

        if (type === 'location') {
            request = { location: new_location.location };
        } else if (type === 'address') {
            request = { address: new_location.address };
        }

        if (geocoder && request) {
            await geocoder.geocode(request, (results, status) => {
                console.log('GEOCODING --------');
                console.log('results', results);
                console.log('status', status);

                // SE LOCAL EXISTIR
                if (status === 'OK' && results) {
                    geocoding = results[0];
                } else {
                    toast(
                        'Geocode was not successful for the following reason: ' +
                            status
                    );
                }
            });
        } else {
            toast('Geocode / Request / Map inexistentes');
        }

        return geocoding;
    }

    function getDirections() {
        if (itinerary) {
            if (itinerary.origin && itinerary.destination) {
                if (DirectionsService && DirectionsRenderer) {
                    const defaultOptions = {
                        travelMode: google.maps.TravelMode.DRIVING,
                        optimizeWaypoints: false,
                        provideRouteAlternatives: false,
                        // trafficModel:
                    };

                    // MONTA REQUEST
                    const request: google.maps.DirectionsRequest = {
                        ...defaultOptions,
                        origin: itinerary?.origin.location,
                        destination: itinerary.destination.location,
                        waypoints: itinerary.waypoints?.map(
                            (waypoint) => waypoint.location
                        ),
                    };

                    console.log('request', request);
                    // FAZ REQUISIÇÃO
                    DirectionsService.route(request, (result, status) => {
                        console.log('DIRECTIONS ------');
                        console.log('result', result);
                        console.log('status', status);

                        // SE HOUVER ROTAS
                        if (status === 'OK') {
                            DirectionsRenderer.setDirections(result);
                        }
                        // SE NÃO HOUVER ROTAS
                        else if (status === 'ZERO_RESULTS') {
                            toast('Sem rotas disponíveis...');
                        }
                    });
                }
            }
        }
    }

    return (
        <div className="h-screen flex">
            <div className="px-8 py-10 flex-col flex gap-3 w-full max-w-sm">
                <span className="p-3 text-xl">{active_input}</span>
                <input
                    type="text"
                    className="px-3 py-2 bg-gray-100 rounded-xl"
                    placeholder="Origem"
                    id="origin"
                    value={input_origin}
                    onChange={(e) => setInputOrigin(e.target.value)}
                    onFocus={() => setActiveInput('origin')}
                />
                <input
                    type="text"
                    className="px-3 py-2 bg-gray-100 rounded-xl"
                    placeholder="Destino"
                    id="destination"
                    value={input_destination}
                    onChange={(e) => setInputDestination(e.target.value)}
                    onFocus={() => setActiveInput('destination')}
                />
                <input
                    type="text"
                    className="px-3 py-2 bg-gray-100 rounded-xl"
                    placeholder="Parada"
                    value={input_waypoint}
                    onChange={(e) => setInputWaypoint(e.target.value)}
                    onFocus={() => setActiveInput('waypoint')}
                />
                {/* <button
                    className="px-3 py-2 bg-gray-300 rounded-xl"
                >
                    Nova parada
                </button> */}
                <button
                    className="px-3 py-2 bg-blue-500 rounded-xl"
                    onClick={findAddress}
                >
                    Pesquisar
                </button>
            </div>
            <div className="flex-1">
                <ToastContainer />
                <Wrapper
                    apiKey={'AIzaSyCB-ooZaneGDgT8y3WSfQchHMfdN5MSIAE'}
                    render={render}
                >
                    <Map
                        map={map as google.maps.Map}
                        setMap={setMap}
                        map_options={map_options}
                        setOptions={setOptions}
                        className="h-screen"
                        onClick={onClick}
                        onIdle={onIdle}
                        DirectionsService={DirectionsService}
                        DirectionsRenderer={DirectionsRenderer}
                        setDirectionsService={setDirectionsService}
                        setDirectionsRenderer={setDirectionsRenderer}
                        setGeocoder={setGeocoder}
                        geocoder={geocoder as google.maps.Geocoder}
                    >
                        {itinerary?.origin && !itinerary.destination && (
                            <Marker
                                position={itinerary.origin.location}
                                draggable={true}
                            />
                        )}
                        {itinerary?.destination && !itinerary.origin && (
                            <Marker
                                position={itinerary.destination.location}
                                draggable={true}
                            />
                        )}
                        {itinerary?.waypoints &&
                            (!itinerary.destination || !itinerary.origin) && (
                                <Marker
                                    position={
                                        itinerary?.waypoints[0].location
                                            .location as google.maps.LatLng
                                    }
                                    draggable={true}
                                />
                            )}
                    </Map>
                </Wrapper>
            </div>
        </div>
    );
}
