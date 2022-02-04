import React, { useMemo } from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';
import {
	ReactNode,
	useEffect,
	useRef,
	useState
	} from 'react';

export interface Itinerary {
    origin?: google.maps.LatLng;
    destination?: google.maps.LatLng;
    waypoints?: google.maps.DirectionsWaypoint[];
}

export interface MapOptions {
    center: google.maps.LatLngLiteral;
    zoom: number;
}

interface MapProps {
    className: string;
    options: MapOptions;
    setOptions?: (options: MapOptions) => void;
    onClick?: (e: google.maps.MapMouseEvent) => void;
    onIdle?: (map: google.maps.Map) => void;
    children?: ReactNode;
    itinerary: Itinerary;
}

export function Map({
    className,
    options,
    setOptions,
    onClick,
    onIdle,
    children,
    itinerary,
}: MapProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map>();

    const memoizedDirectionsService = useMemo(() => {
        return new google.maps.DirectionsService();
    }, []);

    const memoizedDirectionsRenderer = useMemo(() => {
        return new google.maps.DirectionsRenderer();
    }, []);

    useEffect(() => {
        if (ref.current && !map) {
            setMap(new window.google.maps.Map(ref.current, options));
        }
    }, [ref, map, options]);

    useDeepCompareEffect(() => {
        if (map) {
            map.setOptions(options);
        }
    }, [map, options]);

    useEffect(() => {
        if (map) {
            memoizedDirectionsRenderer.setMap(map);

            ['click', 'idle'].forEach((eventName) =>
                google.maps.event.clearListeners(map, eventName)
            );

            if (onClick) {
                map.addListener('click', onClick);
            }

            if (onIdle) {
                map.addListener('idle', () => onIdle(map));
            }

            // map.addListener(
            //     'center_changed',
            //     (e: google.maps.LatLngLiteral) => {
            //         console.log(e);
            //         setOptions &&
            //             setOptions({
            //                 ...options,
            //                 center: { lat: e.lat, lng: e.lng },
            //             });
            //     }
            // );
        }
    }, [map, onClick, onIdle, options, setOptions, memoizedDirectionsRenderer]);

    useEffect(() => {
        if (itinerary.origin && itinerary.destination) {
            const request: google.maps.DirectionsRequest = {
                origin: itinerary.origin,
                destination: itinerary.destination,
                travelMode: google.maps.TravelMode.DRIVING,
                waypoints: itinerary.waypoints,
                optimizeWaypoints: false,
                provideRouteAlternatives: false,
            };

            console.log('request', request);

            memoizedDirectionsService.route(request, function (result, status) {
                if (status === 'OK') {
                    memoizedDirectionsRenderer.setDirections(result);
                }
            });
        }
    }, [itinerary, memoizedDirectionsService, memoizedDirectionsRenderer]);

    return (
        <>
            <div ref={ref} className={className} />
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    // set the map prop on the child component
                    return React.cloneElement(child, { map });
                }
            })}
        </>
    );
}
