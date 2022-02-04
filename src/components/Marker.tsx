import { useEffect, useState } from 'react';

export function Marker(options: google.maps.MarkerOptions) {
    const [marker, setMarker] = useState<google.maps.Marker>();

    useEffect(() => {
        if (!marker) {
            setMarker(new google.maps.Marker());
        }

        // remove marker from map on unmount
        return () => {
            if (marker) {
                marker.setMap(null);
            }
        };
    }, [marker]);

    useEffect(() => {
        if (marker) {
            marker.setOptions(options);
        }
    }, [marker, options]);

    // The component returns null as google.maps.Map manages the DOM manipulation.
    return null;
}
