import React, { useEffect } from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { ReactNode, useRef, useState } from 'react';
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

export interface MapOptions {
    center: google.maps.LatLngLiteral;
    zoom: number;
}

interface MapProps {
    className: string;
    options: MapOptions;
    setOptions?: (options: MapOptions) => void;
    onClick: (e: google.maps.MapMouseEvent) => void;
    onIdle: (map: google.maps.Map) => void;
    children?: ReactNode;
    DirectionsService: google.maps.DirectionsService | undefined;
    DirectionsRenderer: google.maps.DirectionsRenderer | undefined;
    setDirectionsService: (directions: google.maps.DirectionsService) => void;
    setDirectionsRenderer: (directions: google.maps.DirectionsRenderer) => void;
}

export function Map({
    className,
    options,
    setOptions,
    onClick,
    onIdle,
    children,
    DirectionsRenderer,
    setDirectionsService,
    setDirectionsRenderer,
}: MapProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map>();

    useDeepCompareEffect(() => {
        if (map) {
            map.setOptions(options);
            setDirectionsService(new google.maps.DirectionsService());
            setDirectionsRenderer(new google.maps.DirectionsRenderer());
        }
    }, [map, options]);

    useEffect(() => {
        if (ref.current && !map) {
            setMap(new google.maps.Map(ref.current, options));
        }
        if (map) {
            DirectionsRenderer && DirectionsRenderer.setMap(map);

            ['click', 'idle'].forEach((eventName) =>
                google.maps.event.clearListeners(map, eventName)
            );

            map.addListener('click', onClick);

            onIdle && map.addListener('idle', () => onIdle(map));
        }
    }, [ref, map, onClick, onIdle, options, setOptions, DirectionsRenderer]);

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
