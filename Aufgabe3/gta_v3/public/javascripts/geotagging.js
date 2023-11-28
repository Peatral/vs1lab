// File origin: VS1LAB A2

/* eslint-disable no-unused-vars */

// This script is executed when the browser loads index.html.

// "console.log" writes to the browser's console. 
// The console window must be opened explicitly in the browser.
// Try to find this output in the browser...
console.log("The geoTagging script is going to start...");

/**
 * A function to retrieve the current location and update the page.
 * It is called once the page has been fully loaded.
 */
function updateLocation() {
    const latitudes = [
        document.getElementById("latitude"),
        document.getElementById("discovery_latitude"),
    ];
    const longitudes = [
        document.getElementById("longitude"),
        document.getElementById("discovery_longitude"),
    ];
    const map = document.getElementById("mapView");
    const taglist = JSON.parse(map.dataset.tags).filter(tag => tag != {});

    const locationCallback = helper => {
        latitudes.forEach(lat => lat.value = helper.latitude);
        longitudes.forEach(long => long.value = helper.longitude);
        
        let mapManager = new MapManager("pqYXJV4b1tGwd9ZsRr84RJ6wl93FSRYs");
        
        map.src = mapManager.getMapUrl(helper.latitude, helper.longitude, taglist);
    };

    if (latitudes.every(lat => lat.value) && longitudes.every(long => long.value)) {
        console.log("The location is already set, aborting location finder...");

        locationCallback(new LocationHelper(latitudes[0].value, longitudes[0].value));

        return;
    }

    try {
        console.log("Trying to look up current location...");
        LocationHelper.findLocation(locationCallback);
    } catch(e) {
        console.error(e);
    }
}

// Wait for the page to fully load its DOM content, then call updateLocation
document.addEventListener("DOMContentLoaded", () => {
    updateLocation();
});