import { LegacyRef, useRef, useState } from 'react';
import { Map, MapOptions } from './components/Map';
import { Marker } from './components/Marker';
import { Status, Wrapper } from '@googlemaps/react-wrapper';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export interface Itinerary {
    origin?: { location: google.maps.LatLng; address: string };
    destination?: { location: google.maps.LatLng; address: string };
    waypoints?: { location: google.maps.DirectionsWaypoint; address: string }[];
    origin_address?: string;
    destination_address?: string;
    waypoints_address?: string[];
}

export default function App() {
    const [options, setOptions] = useState<MapOptions>({
        zoom: 12,
        center: {
            lat: -16.6,
            lng: -49.2,
        },
    });

    const [itinerary, setItinerary] = useState<Itinerary>({} as Itinerary);
    // const [invalid_point, setInvalidPoint] = useState<boolean>(false);

    const [DirectionsService, setDirectionsService] =
        useState<google.maps.DirectionsService>();
    // new google.maps.DirectionsService() || undefined
    const [DirectionsRenderer, setDirectionsRenderer] =
        useState<google.maps.DirectionsRenderer>();
    // new google.maps.DirectionsRenderer() || undefined

    const [map, setMap] = useState<google.maps.Map>();

    const [geocoder, setGeocoder] = useState<google.maps.Geocoder>();

    const onClick = (e: google.maps.MapMouseEvent) => {
        console.log(e.latLng);
        // const defaultOptions = {
        //     travelMode: google.maps.TravelMode.DRIVING,
        //     optimizeWaypoints: false,
        //     provideRouteAlternatives: false,
        //     // trafficModel:
        // };

        handleItineraryChange({
            newLocation: { location: e.latLng!, address: '' },
            input: active_input,
            mode: 'map_click',
        });

        // SE SERVIÇO E RENDERER DA API DIRECTIONS FORAM CARREGADA
        // if (DirectionsService && DirectionsRenderer) {

        //     // SE NÃO POSSUI NENHUM PONTO DEFINIDO
        //     if (
        //         !itinerary.origin &&
        //         !itinerary.destination &&
        //         !itinerary.waypoints
        //     ) {
        //         // DEFINE A ORIGEM
        //         // setItinerary({ origin: { location: e.latLng! } });

        // 		handleItineraryChange({location: e.latLng!, address: ""})
        //     }

        //     // SE POSSUI APENAS A ORIGEM DEFINIDA
        //     if (
        //         itinerary.origin &&
        //         !itinerary.destination &&
        //         !itinerary.waypoints
        //     ) {
        // 		handleItineraryChange({location: e.latLng!, address: ""})

        //         // // MONTA REQUEST COM A ORIGEM PREDEFINIDA E O NOVO DESTINO
        //         // const request: google.maps.DirectionsRequest = {
        //         //     origin: itinerary.origin,
        //         //     destination: e.latLng!,
        //         //     ...defaultOptions,
        //         // };

        //         // DirectionsService.route(request, (result, status) => {
        //         //     console.log('result', result);
        //         //     console.log('status', status);

        //         //     if (status === 'OK') {
        //         //         // RENDERIZA A ROTA
        //         //         DirectionsRenderer.setDirections(result);
        //         //         // DEFINE O DESTINO
        //         //         setItinerary({
        //         //             origin: itinerary.origin,
        //         //             destination: e.latLng!,
        //         //         });
        //         //     }
        //         //     // SE NÃO HOUVER RESULTADOS
        //         //     else if (status === 'ZERO_RESULTS') {
        //         //         toast('Sem rotas disponíveis...');
        //         //     }
        //         // });
        //     }

        //     // SE POSSUI ORIGEM E DESTINO DEFINIDOS
        //     if (
        //         itinerary.origin &&
        //         itinerary.destination &&
        //         !itinerary.waypoints
        //     ) {
        // 		handleItineraryChange({location: e.latLng!, address: ""})

        //         // MONTA REQUEST
        //         // ORIGEM PREDEFINIDA,
        //         // NOVO DESTINO
        //         // TRANSFORMA DESTINO ANTERIOR EM PARADA
        //         // const request: google.maps.DirectionsRequest = {
        //         //     origin: itinerary.origin,
        //         //     destination: e.latLng!,
        //         //     waypoints: [{ location: itinerary.destination }],
        //         //     ...defaultOptions,
        //         // };

        //         // DirectionsService.route(request, (result, status) => {
        //         //     console.log('result', result);
        //         //     console.log('status', status);

        //         //     if (status === 'OK') {
        //         //         // RENDERIZA ROTA
        //         //         DirectionsRenderer.setDirections(result);
        //         //         // TRANSFORMA DESTINO EM PARADA, E DEFINE NOVO DESTINO
        //         //         setItinerary({
        //         //             origin: itinerary.origin,
        //         //             destination: e.latLng!,
        //         //             waypoints: [{ location: itinerary.destination }],
        //         //         });
        //         //         // SE NÃO HOUVER RESULTADOS
        //         //     } else if (status === 'ZERO_RESULTS') {
        //         //         toast('Sem rotas disponíveis...');
        //         //     }
        //         // });
        //     }

        //     // SE POSSUI ORIGEM, DESTINO E PARADAS DEFINIDOS
        //     if (
        //         itinerary.origin &&
        //         itinerary.destination &&
        //         itinerary.waypoints
        //     ) {
        //         // MONTA REQUEST
        //         // ORIGEM PREDEFINIDA
        //         // NOVO DESTINO
        //         // TRANSFORMA DESTINO ANTERIOR EM NOVA PARADA
        //         const request: google.maps.DirectionsRequest = {
        //             origin: itinerary.origin,
        //             destination: e.latLng!,
        //             waypoints: [
        //                 ...(itinerary.waypoints || []),
        //                 { location: itinerary.destination },
        //             ],
        //             ...defaultOptions,
        //         };

        //         DirectionsService.route(request, (result, status) => {
        //             console.log('result', result);
        //             console.log('status', status);

        //             if (status === 'OK') {
        //                 // RENDERIZA A ROTA
        //                 DirectionsRenderer.setDirections(result);
        //                 // DEFINE NOVO DESTINO E TRANSFORMA DESTINO EM NOVA PARADA
        //                 setItinerary({
        //                     origin: itinerary.origin,
        //                     destination: e.latLng!,
        //                     waypoints: [
        //                         ...(itinerary.waypoints || []),
        //                         { location: itinerary.destination },
        //                     ],
        //                 });
        //                 // SE NÃO HOUVER RESULTADOS
        //             } else if (status === 'ZERO_RESULTS') {
        //                 toast('Sem rotas disponíveis...');
        //             }
        //         });
        //     }
        // }
        return;
    };

    const [active_input, setActiveInput] = useState<'origin' | 'destination'>(
        'origin'
    );

    const onIdle = (m: google.maps.Map) => {
        // console.log('onIdle');
        // setZoom(m.getZoom()!);
        // setCenter(m.getCenter()!.toJSON());
    };

    const render = (status: Status) => {
        return <h1>{status}</h1>;
    };

    interface HandleItineraryChangeProps {
        newLocation: {
            location: google.maps.LatLng;
            address: string;
        };
        input: 'origin' | 'destination' | 'waypoint';
        mode: 'input' | 'map_click';
    }

    // FUNÇÃO PRA COMANDAR A EDIÇÃO DE ITINERÁRIO
    // VERIFICA OS VALORES PRESENTES NO ITINERÁRIO PRA SABER QUAIS CAMPOS ALTERAR
    // RESPONSÁVEL PELOS SERVIÇOS DE DIREÇÃO E LOCAL
    function handleItineraryChange({
        newLocation,
        input,
        mode,
    }: HandleItineraryChangeProps) {
        const defaultOptions = {
            travelMode: google.maps.TravelMode.DRIVING,
            optimizeWaypoints: false,
            provideRouteAlternatives: false,
            // trafficModel:
        };

        // CLIQUE COM CAMPO ORIGEM
        if (input === 'origin' && mode === 'map_click') {
            geocoder &&
                // GEOCODER RETORNA NOME DO ENDEREÇO
                geocoder.geocode(
                    { location: newLocation.location },
                    (results, status) => {
                        if (status === 'OK' && results && map) {
                            // setItinerary({origin: results.})

                            console.log('GEOCODING --------');
                            console.log('results', results);
                            console.log('status', status);

                            if (itinerary.destination) {
                                const request: google.maps.DirectionsRequest = {
                                    origin: results[0].geometry.location || '',
                                    destination: itinerary.destination.location,
                                    ...defaultOptions,
                                };

                                if (DirectionsService && DirectionsRenderer)
                                    DirectionsService.route(
                                        request,
                                        (result, status) => {
                                            console.log('DIRECTIONS ------');
                                            console.log('result', result);
                                            console.log('status', status);

                                            if (status === 'OK') {
                                                // RENDERIZA A ROTA
                                                DirectionsRenderer.setDirections(
                                                    result
                                                );

                                                map.setCenter(
                                                    results[0].geometry.location
                                                );

                                                setInputOrigin(
                                                    results[0].formatted_address
                                                );
                                                setItinerary({
                                                    ...itinerary,
                                                    origin: {
                                                        location:
                                                            results[0].geometry
                                                                .location,
                                                        address:
                                                            results[0]
                                                                .formatted_address,
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
                            } else {
                                map.setCenter(results[0].geometry.location);
                                setInputOrigin(results[0].formatted_address);
                                setItinerary({
                                    ...itinerary,
                                    origin: {
                                        location: results[0].geometry.location,
                                        address: results[0].formatted_address,
                                    },
                                });
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
        } else if (input === 'destination' && mode === 'map_click') {
            geocoder &&
                geocoder.geocode(
                    { location: newLocation.location },
                    (results, status) => {
                        if (status === 'OK' && results && map) {
                            console.log(results);

                            const request: google.maps.DirectionsRequest = {
                                origin: itinerary.origin?.location || '',
                                destination: results[0].geometry.location,
                                ...defaultOptions,
                            };

                            if (DirectionsService && DirectionsRenderer)
                                DirectionsService.route(
                                    request,
                                    (result, status) => {
                                        console.log('DIRECTIONS ------');
                                        console.log('result', result);
                                        console.log('status', status);

                                        if (status === 'OK') {
                                            // RENDERIZA A ROTA
                                            DirectionsRenderer.setDirections(
                                                result
                                            );

                                            map.setCenter(
                                                results[0].geometry.location
                                            );
                                            setInputDestination(
                                                results[0].formatted_address
                                            );
                                            setItinerary({
                                                ...itinerary,
                                                destination: {
                                                    location:
                                                        results[0].geometry
                                                            .location,
                                                    address:
                                                        results[0]
                                                            .formatted_address,
                                                },
                                            });
                                        }
                                        // SE NÃO HOUVER RESULTADOS
                                        else if (status === 'ZERO_RESULTS') {
                                            toast('Sem rotas disponíveis...');
                                        }
                                    }
                                );
                        } else {
                            alert(
                                'Geocode was not successful for the following reason: ' +
                                    status
                            );
                        }
                    }
                );
        }

        //     if (
        //         !itinerary.origin &&
        //         !itinerary.destination &&
        //         !itinerary.waypoints
        //     ) {

        //         geocoder &&
        //             geocoder.geocode({ address: address.address }, (results, status) => {
        //                 if (status === 'OK' && results && map) {
        //                     map.setCenter(results[0].geometry.location);
        //                     // setItinerary({origin: results.})

        //                     console.log(results);

        //                     setInputOrigin(results[0].formatted_address);
        //                     setItinerary({
        //                         origin: results[0].geometry.location,
        //                         origin_address: results[0].formatted_address,
        //                     });

        //                     new google.maps.Marker({
        //                         map: map,
        //                         position: results[0].geometry.location,
        //                     });
        //                 } else {
        //                     alert(
        //                         'Geocode was not successful for the following reason: ' +
        //                             status
        //                     );
        //                 }
        //             });
        //         setItinerary({
        //             origin: address,
        //         });
        //         setInputOrigin(address.address);
        //     } else if (
        //         itinerary.origin &&
        //         !itinerary.destination &&
        //         !itinerary.waypoints
        //     ) {

        // 		const request: google.maps.DirectionsRequest = {
        // 			origin: itinerary.origin?.location || "",
        // 			destination: address.,
        // 			...defaultOptions,
        // 		};

        //         if (DirectionsService && DirectionsRenderer)
        //             DirectionsService.route(request, (result, status) => {
        //                 console.log('result', result);
        //                 console.log('status', status);

        //                 if (status === 'OK') {
        //                     // RENDERIZA A ROTA
        //                     DirectionsRenderer.setDirections(result);
        //                     // DEFINE O DESTINO

        //                     setItinerary({
        //                         origin: address,
        //                     });
        //                     setInputOrigin(address.address);
        //                 }
        //                 // SE NÃO HOUVER RESULTADOS
        //                 else if (status === 'ZERO_RESULTS') {
        //                     toast('Sem rotas disponíveis...');
        //                 }
        //             });
        //         setItinerary({
        //             ...itinerary,
        //             destination: address,
        //         });
        //         setInputDestination(address.address);
        //     } else if (
        //         itinerary.origin &&
        //         itinerary.destination &&
        //         !itinerary.waypoints
        //     ) {
        //         // setItinerary({
        //         // 	...itinerary,
        //         //     waypoints: [{itinerary.destination}],
        //         //     destination_address: input_destination,
        //         // });
        //     }
    }

    // const addressRef = useRef<HTMLInputElement>();

    function findAddress() {
        // address: string,
        // input: 'origin' | 'destination' | 'waypoint'
        // let address = '';
        // if (input_origin !== '' && input_destination === '') {
        //     address = input_origin;
        // } else if (input_origin !== '' && input_destination !== '') {
        //     address = input_destination;
        // }
        // handleItineraryChange({
        //     newLocation: {
        //         location: {} as google.maps.LatLng,
        //         address,
        //     },
        //     input,
        // });
        // geocoder &&
        //     geocoder.geocode({ address }, (results, status) => {
        //         if (status === 'OK' && results && map) {
        //             map.setCenter(results[0].geometry.location);
        //             // setItinerary({origin: results.})
        //             console.log(results);
        //             setInputOrigin(results[0].formatted_address);
        //             setItinerary({
        //                 origin: results[0].geometry.location,
        //                 origin_address: results[0].formatted_address,
        //             });
        //             new google.maps.Marker({
        //                 map: map,
        //                 position: results[0].geometry.location,
        //             });
        //         } else {
        //             alert(
        //                 'Geocode was not successful for the following reason: ' +
        //                     status
        //             );
        //         }
        //     });
    }
    const [input_origin, setInputOrigin] = useState('');
    const [input_destination, setInputDestination] = useState('');

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
                    // onChange={(e) => findAddress(e.target.value, 'origin')}
                    onFocus={() => setActiveInput('origin')}
                    // ref={addressRef as LegacyRef<HTMLInputElement>}
                />
                {/* <input
                    type="text"
                    className="px-3 py-2 bg-gray-100 rounded-xl"
                    placeholder="Paradas"
                    // ref={addressRef as LegacyRef<HTMLInputElement>}
                /> */}
                <input
                    type="text"
                    className="px-3 py-2 bg-gray-100 rounded-xl"
                    placeholder="Destino"
                    id="destination"
                    value={input_destination}
                    // onChange={(e) => findAddress(e.target.value, 'destination')}
                    onFocus={() => setActiveInput('destination')}
                />
                <button
                    type="submit"
                    className="px-3 py-2 bg-blue-500 rounded-xl"
                    // onClick={getAddresses}
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
                        options={options}
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
                        {/* {clicks.map((click, i) => {
                        return <Marker position={click} key={i} />;
                    })} */}
                        {itinerary.origin && !itinerary.destination && (
                            <Marker
                                position={itinerary.origin.location}
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
