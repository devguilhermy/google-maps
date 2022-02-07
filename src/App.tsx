import { Map, MapOptions } from './components/Map';
import { Marker } from './components/Marker';
import { Status, Wrapper } from '@googlemaps/react-wrapper';
import { toast, ToastContainer } from 'react-toastify';
import { useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';

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
    const [active_input, setActiveInput] = useState<
        'origin' | 'destination' | 'waypoint'
    >('origin');

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
            newLocation: { location: e.latLng! },
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
    interface HandleItineraryChangeProps {
        newLocation: {
            location?: google.maps.LatLng;
            address?: string;
        };
        mode: 'input' | 'map_click';
    }

    // VERIFICA OS VALORES PRESENTES NO ITINERÁRIO PRA SABER QUAIS CAMPOS ALTERAR
    // RESPONSÁVEL PELOS SERVIÇOS DE DIREÇÃO E LOCAL
    function handleItineraryChange({
        newLocation,
        mode,
    }: HandleItineraryChangeProps) {
        const defaultOptions = {
            travelMode: google.maps.TravelMode.DRIVING,
            optimizeWaypoints: false,
            provideRouteAlternatives: false,
            // trafficModel:
        };

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
                                    // MONTA REQUISIÇÃO DE DIREÇÕES
                                    const request: google.maps.DirectionsRequest =
                                        {
                                            origin:
                                                geocoding.geometry.location ||
                                                '',
                                            destination:
                                                itinerary.destination.location,
                                            waypoints: itinerary.waypoints?.map(
                                                (waypoint) => waypoint.location
                                            ),
                                            ...defaultOptions,
                                        };

                                    // SE SERVIÇOS DE DIREÇÃO ESTIVEREM CARREGADOS
                                    if (DirectionsService && DirectionsRenderer)
                                        // FAZ REQUISIÇÃO
                                        DirectionsService.route(
                                            request,
                                            (result, status) => {
                                                console.log(
                                                    'DIRECTIONS ------'
                                                );
                                                console.log('result', result);
                                                console.log('status', status);

                                                const route = results[0];

                                                // SE HOUVER ROTAS
                                                if (status === 'OK') {
                                                    // RENDERIZA A ROTA
                                                    DirectionsRenderer.setDirections(
                                                        result
                                                    );

                                                    // CENTRALIZA O MAPA NA ROTA
                                                    map.setCenter(
                                                        route.geometry.location
                                                    );

                                                    // INSERE ENDEREÇO NO CAMPO DE ORIGEM
                                                    setInputOrigin(
                                                        results[0]
                                                            .formatted_address
                                                    );

                                                    // ATUALIZA A ORIGEM NO ITINERÁRIO
                                                    setItinerary({
                                                        ...itinerary,
                                                        origin: {
                                                            location:
                                                                geocoding
                                                                    .geometry
                                                                    .location,
                                                            address:
                                                                geocoding.formatted_address,
                                                        },
                                                    });
                                                }
                                                // SE NÃO HOUVER ROTAS
                                                else if (
                                                    status === 'ZERO_RESULTS'
                                                ) {
                                                    toast(
                                                        'Sem rotas disponíveis...'
                                                    );
                                                }
                                            }
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
                                // DEIXA O CAMPO DE ORIGEM ATIVO
                                setActiveInput('waypoint');

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
                                    const request: google.maps.DirectionsRequest =
                                        {
                                            origin: itinerary.origin.location,
                                            destination:
                                                geocoding.geometry.location,
                                            waypoints: itinerary.waypoints?.map(
                                                (waypoint) => waypoint.location
                                            ),
                                            ...defaultOptions,
                                        };

                                    // SE SERVIÇOS DE DIREÇÃO ESTIVEREM CARREGADOS
                                    if (DirectionsService && DirectionsRenderer)
                                        // BUSCA DIREÇÕES
                                        DirectionsService.route(
                                            request,
                                            (result, status) => {
                                                console.log(
                                                    'DIRECTIONS ------'
                                                );
                                                console.log('result', result);
                                                console.log('status', status);

                                                if (status === 'OK') {
                                                    // RENDERIZA A ROTA
                                                    DirectionsRenderer.setDirections(
                                                        result
                                                    );

                                                    map.setCenter(
                                                        geocoding.geometry
                                                            .location
                                                    );
                                                    setInputDestination(
                                                        geocoding.formatted_address
                                                    );
                                                    setItinerary({
                                                        ...itinerary,
                                                        destination: {
                                                            location:
                                                                geocoding
                                                                    .geometry
                                                                    .location,
                                                            address:
                                                                geocoding.formatted_address,
                                                        },
                                                    });
                                                }
                                                // SE NÃO HOUVER RESULTADOS
                                                else if (
                                                    status === 'ZERO_RESULTS'
                                                ) {
                                                    toast(
                                                        'Sem rotas disponíveis...'
                                                    );
                                                }
                                            }
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
                            console.log('address', newLocation);

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
                                } else if (
                                    itinerary.origin &&
                                    itinerary.destination
                                ) {
                                    const request: google.maps.DirectionsRequest =
                                        {
                                            origin: itinerary.origin.location,
                                            destination:
                                                itinerary.destination.location,
                                            waypoints: [
                                                {
                                                    location:
                                                        geocoding.geometry
                                                            .location,
                                                    stopover: true,
                                                },
                                            ],
                                            ...defaultOptions,
                                        };

                                    // SE SERVIÇOS DE DIREÇÃO ESTIVEREM CARREGADOS
                                    if (DirectionsService && DirectionsRenderer)
                                        // BUSCA DIREÇÕES
                                        DirectionsService.route(
                                            request,
                                            (result, status) => {
                                                console.log(
                                                    'DIRECTIONS ------'
                                                );
                                                console.log('result', result);
                                                console.log('status', status);

                                                if (status === 'OK') {
                                                    // RENDERIZA A ROTA
                                                    DirectionsRenderer.setDirections(
                                                        result
                                                    );

                                                    map.setCenter(
                                                        geocoding.geometry
                                                            .location
                                                    );

                                                    setInputWaypoint(
                                                        geocoding.formatted_address
                                                    );

                                                    setItinerary({
                                                        ...itinerary,
                                                        waypoints: [
                                                            {
                                                                location: {
                                                                    location:
                                                                        geocoding
                                                                            .geometry
                                                                            .location,
                                                                    stopover:
                                                                        true,
                                                                },
                                                                address:
                                                                    geocoding.formatted_address,
                                                            },
                                                        ],
                                                    });
                                                }
                                                // SE NÃO HOUVER RESULTADOS
                                                else if (
                                                    status === 'ZERO_RESULTS'
                                                ) {
                                                    toast(
                                                        'Sem rotas disponíveis...'
                                                    );
                                                }
                                            }
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
                                setActiveInput('destination');

                                console.log('GEOCODING --------');
                                console.log('results', results);
                                console.log('status', status);

                                const geocoding = results[0];

                                // SE NÃO HOUVER DESTINO DEFINIDO
                                if (!itinerary.destination) {
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
                                    // MONTA REQUISIÇÃO DE DIREÇÕES
                                    const request: google.maps.DirectionsRequest =
                                        {
                                            origin:
                                                geocoding.geometry.location ||
                                                '',
                                            destination:
                                                itinerary.destination.location,
                                            ...defaultOptions,
                                        };

                                    // SE SERVIÇOS DE DIREÇÃO ESTIVEREM CARREGADOS
                                    if (DirectionsService && DirectionsRenderer)
                                        // FAZ REQUISIÇÃO
                                        DirectionsService.route(
                                            request,
                                            (result, status) => {
                                                console.log(
                                                    'DIRECTIONS ------'
                                                );
                                                console.log('result', result);
                                                console.log('status', status);

                                                const route = results[0];

                                                // SE HOUVER ROTAS
                                                if (status === 'OK') {
                                                    // RENDERIZA A ROTA
                                                    DirectionsRenderer.setDirections(
                                                        result
                                                    );

                                                    // CENTRALIZA O MAPA NA ROTA
                                                    map.setCenter(
                                                        route.geometry.location
                                                    );

                                                    // INSERE ENDEREÇO NO CAMPO DE ORIGEM
                                                    setInputOrigin(
                                                        results[0]
                                                            .formatted_address
                                                    );

                                                    // ATUALIZA A ORIGEM NO ITINERÁRIO
                                                    setItinerary({
                                                        ...itinerary,
                                                        origin: {
                                                            location:
                                                                geocoding
                                                                    .geometry
                                                                    .location,
                                                            address:
                                                                geocoding.formatted_address,
                                                        },
                                                    });
                                                }
                                                // SE NÃO HOUVER ROTAS
                                                else if (
                                                    status === 'ZERO_RESULTS'
                                                ) {
                                                    toast(
                                                        'Sem rotas disponíveis...'
                                                    );
                                                }
                                            }
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
                                    const request: google.maps.DirectionsRequest =
                                        {
                                            origin: itinerary.origin.location,
                                            destination:
                                                geocoding.geometry.location,
                                            ...defaultOptions,
                                        };

                                    // SE SERVIÇOS DE DIREÇÃO ESTIVEREM CARREGADOS
                                    if (DirectionsService && DirectionsRenderer)
                                        // BUSCA DIREÇÕES
                                        DirectionsService.route(
                                            request,
                                            (result, status) => {
                                                console.log(
                                                    'DIRECTIONS ------'
                                                );
                                                console.log('result', result);
                                                console.log('status', status);

                                                if (status === 'OK') {
                                                    // RENDERIZA A ROTA
                                                    DirectionsRenderer.setDirections(
                                                        result
                                                    );

                                                    map.setCenter(
                                                        geocoding.geometry
                                                            .location
                                                    );
                                                    setInputDestination(
                                                        geocoding.formatted_address
                                                    );
                                                    setItinerary({
                                                        ...itinerary,
                                                        destination: {
                                                            location:
                                                                geocoding
                                                                    .geometry
                                                                    .location,
                                                            address:
                                                                geocoding.formatted_address,
                                                        },
                                                    });
                                                }
                                                // SE NÃO HOUVER RESULTADOS
                                                else if (
                                                    status === 'ZERO_RESULTS'
                                                ) {
                                                    toast(
                                                        'Sem rotas disponíveis...'
                                                    );
                                                }
                                            }
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
                                    const request: google.maps.DirectionsRequest =
                                        {
                                            origin: itinerary.origin.location,
                                            destination:
                                                itinerary.destination.location,
                                            waypoints: [
                                                {
                                                    location:
                                                        geocoding.geometry
                                                            .location,
                                                    stopover: true,
                                                },
                                            ],
                                            ...defaultOptions,
                                        };

                                    // SE SERVIÇOS DE DIREÇÃO ESTIVEREM CARREGADOS
                                    if (DirectionsService && DirectionsRenderer)
                                        // BUSCA DIREÇÕES
                                        DirectionsService.route(
                                            request,
                                            (result, status) => {
                                                console.log(
                                                    'DIRECTIONS ------'
                                                );
                                                console.log('result', result);
                                                console.log('status', status);

                                                if (status === 'OK') {
                                                    // RENDERIZA A ROTA
                                                    DirectionsRenderer.setDirections(
                                                        result
                                                    );

                                                    map.setCenter(
                                                        geocoding.geometry
                                                            .location
                                                    );

                                                    setInputWaypoint(
                                                        geocoding.formatted_address
                                                    );

                                                    setItinerary({
                                                        ...itinerary,
                                                        waypoints: [
                                                            {
                                                                location: {
                                                                    location:
                                                                        geocoding
                                                                            .geometry
                                                                            .location,
                                                                    stopover:
                                                                        true,
                                                                },
                                                                address:
                                                                    geocoding.formatted_address,
                                                            },
                                                        ],
                                                    });
                                                }
                                                // SE NÃO HOUVER RESULTADOS
                                                else if (
                                                    status === 'ZERO_RESULTS'
                                                ) {
                                                    toast(
                                                        'Sem rotas disponíveis...'
                                                    );
                                                }
                                            }
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
                newLocation: { address: input_origin },
                mode: 'input',
            });
        } else if (active_input === 'destination') {
            handleItineraryChange({
                newLocation: { address: input_destination },
                mode: 'input',
            });
        } else if (active_input === 'waypoint') {
            handleItineraryChange({
                newLocation: {
                    address: input_waypoint,
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
                        ;
                    </Map>
                </Wrapper>
            </div>
        </div>
    );
}
