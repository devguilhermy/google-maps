import { Map, MapOptions } from './components/Map';
import { Marker } from './components/Marker';
import { Status, Wrapper } from '@googlemaps/react-wrapper';
import { toast, ToastContainer } from 'react-toastify';
import { useState } from 'react';
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

export default function App() {
    // LOCATION INPUTS
    const [input_origin, setInputOrigin] = useState<string>('');
    const [input_destination, setInputDestination] = useState<string>('');
    const [input_waypoint, setInputWaypoint] = useState<string>();
    const [active_input, setActiveInput] = useState<ActiveInput>('origin');

    // ITINERARY ------------------------------------------
    const [itinerary, setItinerary] = useState<Itinerary>({} as Itinerary);

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

    // EVENTS ------------------------------------------
    const onClick = (e: google.maps.MapMouseEvent) => {
        handleItineraryChange({
            newLocation: { location: e.latLng!, address: '' },
            mode: 'map_click',
        });
    };
    const onIdle = (m: google.maps.Map) => {
        // console.log('onIdle');
        // setZoom(m.getZoom()!);
        // setCenter(m.getCenter()!.toJSON());
    };
    const render = (status: Status) => {
        return <h1>{status}</h1>;
    };

    // HANDLERS ------------------------------------------

    function getDirections(
        new_location: NewLocation,
        input_modified: ActiveInput
    ) {
        const defaultOptions = {
            travelMode: google.maps.TravelMode.DRIVING,
            optimizeWaypoints: false,
            provideRouteAlternatives: false,
            // trafficModel:
        };

        // MONTA REQUEST
        const request: google.maps.DirectionsRequest = {
            ...defaultOptions,
            origin:
                input_modified === 'origin'
                    ? new_location.location!
                    : itinerary.origin?.location!,
            destination:
                input_modified === 'destination'
                    ? new_location.location!
                    : itinerary.destination?.location!,
            waypoints:
                input_modified === 'waypoint'
                    ? [{ location: new_location.location, stopover: true }]
                    : itinerary.waypoints?.map((waypoint) => waypoint.location),
        };

        console.log('request', request);

        // SE SERVIÇOS ESTIVEREM CARREGADOS
        if (map && DirectionsService && DirectionsRenderer)
            // FAZ REQUISIÇÃO
            DirectionsService.route(request, (result, status) => {
                console.log('DIRECTIONS ------');
                console.log('result', result);
                console.log('status', status);

                // SE HOUVER ROTAS
                if (status === 'OK') {
                    // RENDERIZA A ROTA
                    DirectionsRenderer.setDirections(result);

                    // INSERE ENDEREÇO NO CAMPO
                    if (input_modified === 'origin') {
                        setInputOrigin(new_location.address || '');
                    } else if (input_modified === 'destination') {
                        setInputDestination(new_location.address || '');
                    } else if (input_modified === 'waypoint') {
                        setInputWaypoint(new_location.address || '');
                    }

                    // ATUALIZA ITINERÁRIO
                    setItinerary({
                        origin:
                            input_modified === 'origin'
                                ? new_location
                                : itinerary.origin,
                        destination:
                            input_modified === 'destination'
                                ? new_location
                                : itinerary.destination,
                        waypoints:
                            input_modified === 'waypoint'
                                ? [
                                      {
                                          location: {
                                              location: new_location.location,
                                              stopover: true,
                                          },
                                          address: new_location.address,
                                      },
                                  ]
                                : itinerary.waypoints,
                    });
                }
                // SE NÃO HOUVER ROTAS
                else if (status === 'ZERO_RESULTS') {
                    toast('Sem rotas disponíveis...');
                }
            });
    }

    interface NewLocation {
        location: google.maps.LatLng;
        address: string;
    }

    interface HandleItineraryChangeProps {
        newLocation: NewLocation;
        mode: 'input' | 'map_click';
    }

    // VERIFICA OS VALORES PRESENTES NO ITINERÁRIO PRA SABER QUAIS CAMPOS ALTERAR
    // RESPONSÁVEL PELOS SERVIÇOS DE DIREÇÃO E LOCAL
    function handleItineraryChange({
        newLocation,
        mode,
    }: HandleItineraryChangeProps) {
        // CASO TENHA CLICADO NO MAPA
        if (mode === 'map_click') {
            // CLIQUE COM CAMPO ORIGEM
            if (active_input === 'origin') {
                geocoder &&
                    // GEOCODER BUSCA NOME DO LOCAL CLICADO
                    geocoder.geocode(
                        { location: newLocation.location },
                        (results, status) => {
                            console.log('GEOCODING --------');
                            console.log('results', results);
                            console.log('status', status);

                            // SE LOCAL EXISTIR
                            if (status === 'OK' && results && map) {
                                // DEIXA O CAMPO DE DESTINO ATIVO
                                setActiveInput('destination');

                                const geocoding = results[0];

                                // SE NÃO HOUVER DESTINO DEFINIDO
                                if (!itinerary.destination) {
                                    // CENTRALIZA O MAPA NO LOCAL CLICADO
                                    map.setCenter(geocoding.geometry.location);

                                    // INSERE ENDEREÇO NO CAMPO DE ORIGEM
                                    setInputOrigin(geocoding.formatted_address);

                                    // ATUALIZA ORIGEM NO ITINERÁRIO
                                    setItinerary({
                                        ...itinerary,
                                        origin: {
                                            location:
                                                geocoding.geometry.location,
                                            address:
                                                geocoding.formatted_address,
                                        },
                                    });
                                }
                                // SE HOUVER DESTINO DEFINIDO
                                else {
                                    // BUSCA DIREÇÕES COM NOVO DESTINO
                                    getDirections(
                                        {
                                            location:
                                                geocoding.geometry.location,
                                            address:
                                                geocoding.formatted_address,
                                        },
                                        'origin'
                                    );
                                }

                                // new google.maps.Marker({
                                //     map: map,
                                //     position: results[0].geometry.location,
                                // });
                            } else {
                                alert(
                                    'Geocode was not successful for the following reason: ' +
                                        status
                                );
                            }
                        }
                    );
            } else if (active_input === 'destination') {
                geocoder &&
                    // BUSCA NOME DO LOCAL CLICADO
                    geocoder.geocode(
                        { location: newLocation.location },
                        (results, status) => {
                            console.log('GEOCODING --------');
                            console.log('results', results);
                            console.log('status', status);

                            // SE LOCAL EXISTIR
                            if (status === 'OK' && results && map) {
                                // DEIXA O CAMPO DE PARADA ATIVO
                                setActiveInput('waypoint');

                                const geocoding = results[0];
                                // SE NAO HOUVER DEFINIDO A ORIGEM AINDA
                                if (!itinerary.origin) {
                                    // CENTRALIZA O MAPA NO LOCAL CLICADO
                                    map.setCenter(geocoding.geometry.location);

                                    // INSERE ENDEREÇO NO CAMPO DE ORIGEM
                                    setInputDestination(
                                        geocoding.formatted_address
                                    );

                                    // ATUALIZA ORIGEM NO ITINERÁRIO
                                    setItinerary({
                                        ...itinerary,
                                        destination: {
                                            location:
                                                geocoding.geometry.location,
                                            address:
                                                geocoding.formatted_address,
                                        },
                                    });
                                }
                                // SE JÁ TIVER DEFINIDO A ORIGEM
                                else {
                                    getDirections(
                                        {
                                            location:
                                                geocoding.geometry.location,
                                            address:
                                                geocoding.formatted_address,
                                        },
                                        'destination'
                                    );
                                }
                            } else {
                                alert(
                                    'Geocode was not successful for the following reason: ' +
                                        status
                                );
                            }
                        }
                    );
            } else if (active_input === 'waypoint') {
                geocoder &&
                    // BUSCA NOME DO LOCAL DIGITADO
                    geocoder.geocode(
                        { location: newLocation.location },
                        (results, status) => {
                            console.log('GEOCODING --------');
                            console.log('results', results);
                            console.log('status', status);

                            // SE LOCAL EXISTIR
                            if (status === 'OK' && results && map) {
                                // DEIXA O CAMPO DE ORIGEM ATIVO
                                setActiveInput('origin');
                                const geocoding = results[0];

                                if (
                                    !itinerary.origin ||
                                    !itinerary.destination
                                ) {
                                    map.setCenter(geocoding.geometry.location);
                                    setInputWaypoint(
                                        geocoding.formatted_address
                                    );
                                    setItinerary({
                                        ...itinerary,
                                        waypoints: [
                                            {
                                                location: {
                                                    location:
                                                        geocoding.geometry
                                                            .location,
                                                    stopover: true,
                                                },
                                                address:
                                                    geocoding.formatted_address,
                                            },
                                        ],
                                    });
                                }
                                // else if (
                                //     (!itinerary.origin &&
                                //         itinerary.destination) ||
                                //     (itinerary.origin && !itinerary.destination)
                                // ) {
                                //     toast(
                                //         'Defina origem ou destino para ver a rota!'
                                //     );
                                // }
                                else if (
                                    itinerary.origin &&
                                    itinerary.destination
                                ) {
                                    getDirections(
                                        {
                                            location:
                                                geocoding.geometry.location,
                                            address:
                                                geocoding.formatted_address,
                                        },
                                        'waypoint'
                                    );
                                }
                            } else {
                                toast(
                                    'Geocode was not successful for the following reason: ' +
                                        status
                                );
                            }
                        }
                    );
            }
            // BUSCA DE LOCAL POR ENDEREÇO
        }
        // CASO TENHA DIGITADO O ENDEREÇO
        else if (mode === 'input') {
            if (active_input === 'origin') {
                geocoder &&
                    // GEOCODER BUSCA NOME DO LOCAL CLICADO
                    geocoder.geocode(
                        { address: newLocation.address },
                        (results, status) => {
                            // SE LOCAL EXISTIR
                            if (status === 'OK' && results && map) {
                                // DEIXA O CAMPO DE DESTINO ATIVO
                                console.log('GEOCODING --------');
                                console.log('results', results);
                                console.log('status', status);
                                const geocoding = results[0];
                                // SE NÃO HOUVER DESTINO DEFINIDO
                                if (!itinerary.destination) {
                                    setActiveInput('destination');
                                    // CENTRALIZA O MAPA NO LOCAL DIGITADO
                                    map.setCenter(geocoding.geometry.location);
                                    // INSERE ENDEREÇO NO CAMPO DE ORIGEM
                                    setInputOrigin(geocoding.formatted_address);
                                    // ATUALIZA ORIGEM NO ITINERÁRIO
                                    setItinerary({
                                        ...itinerary,
                                        origin: {
                                            location:
                                                geocoding.geometry.location,
                                            address:
                                                geocoding.formatted_address,
                                        },
                                    });
                                }
                                // SE HOUVER DESTINO DEFINIDO
                                else {
                                    getDirections(
                                        {
                                            location:
                                                geocoding.geometry.location,
                                            address:
                                                geocoding.formatted_address,
                                        },
                                        'origin'
                                    );
                                }
                            } else {
                                alert(
                                    'Geocode was not successful for the following reason: ' +
                                        status
                                );
                            }
                        }
                    );
            } else if (active_input === 'destination') {
                geocoder &&
                    // BUSCA NOME DO LOCAL DIGITADO
                    geocoder.geocode(
                        { address: newLocation.address },
                        (results, status) => {
                            console.log('GEOCODING --------');
                            console.log('results', results);
                            console.log('status', status);
                            // SE LOCAL EXISTIR
                            if (status === 'OK' && results && map) {
                                // DEIXA O CAMPO DE ORIGEM ATIVO
                                setActiveInput('origin');
                                const geocoding = results[0];
                                if (!itinerary.origin) {
                                    // CENTRALIZA O MAPA NO LOCAL CLICADO
                                    map.setCenter(geocoding.geometry.location);
                                    // INSERE ENDEREÇO NO CAMPO DE ORIGEM
                                    setInputDestination(
                                        geocoding.formatted_address
                                    );
                                    // ATUALIZA ORIGEM NO ITINERÁRIO
                                    setItinerary({
                                        ...itinerary,
                                        destination: {
                                            location:
                                                geocoding.geometry.location,
                                            address:
                                                geocoding.formatted_address,
                                        },
                                    });
                                } else {
                                    getDirections(
                                        {
                                            location:
                                                geocoding.geometry.location,
                                            address:
                                                geocoding.formatted_address,
                                        },
                                        'destination'
                                    );
                                }
                            } else {
                                alert(
                                    'Geocode was not successful for the following reason: ' +
                                        status
                                );
                            }
                        }
                    );
            } else if (active_input === 'waypoint') {
                geocoder &&
                    // BUSCA NOME DO LOCAL DIGITADO
                    geocoder.geocode(
                        { address: newLocation.address },
                        (results, status) => {
                            console.log('GEOCODING --------');
                            console.log('results', results);
                            console.log('status', status);
                            // SE LOCAL EXISTIR
                            if (status === 'OK' && results && map) {
                                // DEIXA O CAMPO DE ORIGEM ATIVO
                                setActiveInput('origin');
                                const geocoding = results[0];
                                if (itinerary.origin && itinerary.destination) {
                                    getDirections(
                                        {
                                            location:
                                                geocoding.geometry.location,
                                            address:
                                                geocoding.formatted_address,
                                        },
                                        'waypoint'
                                    );
                                }
                            } else {
                                alert(
                                    'Geocode was not successful for the following reason: ' +
                                        status
                                );
                            }
                        }
                    );
            }
        }
    }

    // OBTER LOCAL A PARTIR DE ENDEREÇO DIGITADO
    function findAddress() {
        if (active_input === 'origin') {
            handleItineraryChange({
                newLocation: {
                    location: {} as google.maps.LatLng,
                    address: input_origin,
                },
                mode: 'input',
            });
        } else if (active_input === 'destination') {
            handleItineraryChange({
                newLocation: {
                    location: {} as google.maps.LatLng,
                    address: input_destination,
                },
                mode: 'input',
            });
        } else if (active_input === 'waypoint') {
            handleItineraryChange({
                newLocation: {
                    location: {} as google.maps.LatLng,
                    address: input_waypoint || '',
                },
                mode: 'input',
            });
        }
    }

    // ADICIONAR NOVO WAYPOINT
    function newWaypoint() {
        // setInputsWaypoints([...inputs_waypoints, { id: 'wqqwe', value: '' }]);
        setActiveInput('waypoint');
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
                <button
                    className="px-3 py-2 bg-gray-300 rounded-xl"
                    onClick={newWaypoint}
                >
                    Nova parada
                </button>
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
                        {itinerary.origin && !itinerary.destination && (
                            <Marker
                                position={itinerary.origin.location}
                                draggable={true}
                            />
                        )}
                        {!itinerary.origin && itinerary.destination && (
                            <Marker
                                position={itinerary.destination.location}
                                draggable={true}
                            />
                        )}
                        {(!itinerary.origin || !itinerary.destination) &&
                            itinerary.waypoints && (
                                <Marker
                                    position={
                                        itinerary.waypoints[0].location
                                            .location as google.maps.LatLng
                                    }
                                    draggable={true}
                                />
                            )}
                        ;
                    </Map>
                </Wrapper>
            </div>
        </div>
    );
}
