import React from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';
import {
	ReactNode,
	useEffect,
	useRef,
	useState
	} from 'react';

interface MapProps {
    options: {
        center: google.maps.LatLngLiteral;
        zoom: number;
    };
    className: string;
    onClick?: (e: google.maps.MapMouseEvent) => void;
    onIdle?: (map: google.maps.Map) => void;
    children?: ReactNode;
}

export function Map({
    options,
    className,
    onClick,
    onIdle,
    children,
}: MapProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map>();

    useEffect(() => {
        if (ref.current && !map) {
            setMap(new window.google.maps.Map(ref.current, {}));
        }
    }, [ref, map]);

    useDeepCompareEffect(() => {
        if (map) {
            map.setOptions(options);
        }
    }, [map, options]);

    useEffect(() => {
        if (map) {
            ['click', 'idle'].forEach((eventName) =>
                google.maps.event.clearListeners(map, eventName)
            );

            if (onClick) {
                map.addListener('click', onClick);
            }

            if (onIdle) {
                map.addListener('idle', () => onIdle(map));
            }
        }
    }, [map, onClick, onIdle]);

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
