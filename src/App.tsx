import { Map, MapOptions } from './components/Map';
import { Marker } from './components/Marker';
import { Status, Wrapper } from '@googlemaps/react-wrapper';
import { toast, ToastContainer } from 'react-toastify';
import { useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';

export interface Itinerary {
    origin?: google.maps.LatLng;
    destination?: google.maps.LatLng;
    waypoints?: google.maps.DirectionsWaypoint[];
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

    const onClick = (e: google.maps.MapMouseEvent) => {
        console.log(e.latLng);
        const defaultOptions = {
            travelMode: google.maps.TravelMode.DRIVING,
            optimizeWaypoints: false,
            provideRouteAlternatives: false,
            // trafficModel:
        };

        // SE SERVIÇO E RENDERER DA API DIRECTIONS FORAM CARREGADA
        if (DirectionsService && DirectionsRenderer) {
            // SE NÃO POSSUI NENHUM PONTO DEFINIDO
            if (
                !itinerary.origin &&
                !itinerary.destination &&
                !itinerary.waypoints
            ) {
                // DEFINE A ORIGEM
                setItinerary({ origin: e.latLng! });
            }

            // SE POSSUI APENAS A ORIGEM DEFINIDA
            if (
                itinerary.origin &&
                !itinerary.destination &&
                !itinerary.waypoints
            ) {
                // MONTA REQUEST COM A ORIGEM PREDEFINIDA E O NOVO DESTINO
                const request: google.maps.DirectionsRequest = {
                    origin: itinerary.origin,
                    destination: e.latLng!,
                    ...defaultOptions,
                };

                DirectionsService.route(request, (result, status) => {
                    console.log('result', result);
                    console.log('status', status);

                    if (status === 'OK') {
                        // RENDERIZA A ROTA
                        DirectionsRenderer.setDirections(result);
                        // DEFINE O DESTINO
                        setItinerary({
                            origin: itinerary.origin,
                            destination: e.latLng!,
                        });
                    }
                    // SE NÃO HOUVER RESULTADOS
                    else if (status === 'ZERO_RESULTS') {
                        toast('Sem rotas disponíveis...');
                    }
                });
            }

            // SE POSSUI ORIGEM E DESTINO DEFINIDOS
            if (
                itinerary.origin &&
                itinerary.destination &&
                !itinerary.waypoints
            ) {
                // MONTA REQUEST
                // ORIGEM PREDEFINIDA,
                // NOVO DESTINO
                // TRANSFORMA DESTINO ANTERIOR EM PARADA
                const request: google.maps.DirectionsRequest = {
                    origin: itinerary.origin,
                    destination: e.latLng!,
                    waypoints: [{ location: itinerary.destination }],
                    ...defaultOptions,
                };

                DirectionsService.route(request, (result, status) => {
                    console.log('result', result);
                    console.log('status', status);

                    if (status === 'OK') {
                        // RENDERIZA ROTA
                        DirectionsRenderer.setDirections(result);
                        // TRANSFORMA DESTINO EM PARADA, E DEFINE NOVO DESTINO
                        setItinerary({
                            origin: itinerary.origin,
                            destination: e.latLng!,
                            waypoints: [{ location: itinerary.destination }],
                        });
                        // SE NÃO HOUVER RESULTADOS
                    } else if (status === 'ZERO_RESULTS') {
                        toast('Sem rotas disponíveis...');
                    }
                });
            }

            // SE POSSUI ORIGEM, DESTINO E PARADAS DEFINIDOS
            if (
                itinerary.origin &&
                itinerary.destination &&
                itinerary.waypoints
            ) {
                // MONTA REQUEST
                // ORIGEM PREDEFINIDA
                // NOVO DESTINO
                // TRANSFORMA DESTINO ANTERIOR EM NOVA PARADA
                const request: google.maps.DirectionsRequest = {
                    origin: itinerary.origin,
                    destination: e.latLng!,
                    waypoints: [
                        ...(itinerary.waypoints || []),
                        { location: itinerary.destination },
                    ],
                    ...defaultOptions,
                };

                DirectionsService.route(request, (result, status) => {
                    console.log('result', result);
                    console.log('status', status);

                    if (status === 'OK') {
                        // RENDERIZA A ROTA
                        DirectionsRenderer.setDirections(result);
                        // DEFINE NOVO DESTINO E TRANSFORMA DESTINO EM NOVA PARADA
                        setItinerary({
                            origin: itinerary.origin,
                            destination: e.latLng!,
                            waypoints: [
                                ...(itinerary.waypoints || []),
                                { location: itinerary.destination },
                            ],
                        });
                        // SE NÃO HOUVER RESULTADOS
                    } else if (status === 'ZERO_RESULTS') {
                        toast('Sem rotas disponíveis...');
                    }
                });
            }
        }
        return;
    };

    const onIdle = (m: google.maps.Map) => {
        // console.log('onIdle');
        // setZoom(m.getZoom()!);
        // setCenter(m.getCenter()!.toJSON());
    };

    const render = (status: Status) => {
        return <h1>{status}</h1>;
    };

    return (
        <div className="h-screen">
            <ToastContainer />
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
                    DirectionsService={DirectionsService}
                    DirectionsRenderer={DirectionsRenderer}
                    setDirectionsService={setDirectionsService}
                    setDirectionsRenderer={setDirectionsRenderer}
                >
                    {/* {clicks.map((click, i) => {
                        return <Marker position={click} key={i} />;
                    })} */}
                    {itinerary.origin && !itinerary.destination && (
                        <Marker position={itinerary.origin} draggable={true} />
                    )}
                    ;
                </Map>
            </Wrapper>
        </div>
    );
}
