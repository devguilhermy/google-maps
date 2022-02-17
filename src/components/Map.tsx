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
    map_options: MapOptions;
    setOptions?: (map_options: MapOptions) => void;
    onClick: (e: google.maps.MapMouseEvent) => void;
    onIdle: (map: google.maps.Map) => void;
    children?: ReactNode;
    DirectionsService: google.maps.DirectionsService | undefined;
    DirectionsRenderer: google.maps.DirectionsRenderer | undefined;
    setDirectionsService: (directions: google.maps.DirectionsService) => void;
    setDirectionsRenderer: (directions: google.maps.DirectionsRenderer) => void;
    map: google.maps.Map;
    setMap: (map: google.maps.Map) => void;
    geocoder: google.maps.Geocoder;
    setGeocoder: (geocoder: google.maps.Geocoder) => void;
}

export function Map({
    className,
    map_options,
    setOptions,
    onClick,
    onIdle,
    children,
    DirectionsRenderer,
    setDirectionsService,
    setDirectionsRenderer,
    map,
    setMap,
    geocoder,
    setGeocoder,
}: MapProps) {
    const ref = useRef<HTMLDivElement>(null);

    useDeepCompareEffect(() => {
        if (map) {
            map.setOptions(map_options);
            setDirectionsService(new google.maps.DirectionsService());
            setDirectionsRenderer(new google.maps.DirectionsRenderer());
        }
    }, [map, map_options]);

    useEffect(() => {
        if (ref.current && !map && !geocoder) {
            setMap(new google.maps.Map(ref.current, map_options));
            setGeocoder(new google.maps.Geocoder());
        }
        if (map) {
            DirectionsRenderer && DirectionsRenderer.setMap(map);

            ['click', 'idle'].forEach((eventName) =>
                google.maps.event.clearListeners(map, eventName)
            );

            map.addListener('click', onClick);

            map.addListener('idle', () => onIdle(map));
        }
    }, [
        ref,
        map,
        setMap,
        onClick,
        onIdle,
        map_options,
        setOptions,
        DirectionsRenderer,
        geocoder,
        setGeocoder,
    ]);

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
