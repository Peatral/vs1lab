// File origin: VS1LAB A2

/* eslint-disable no-unused-vars */

// This script is executed when the browser loads index.html.

// "console.log" writes to the browser's console. 
// The console window must be opened explicitly in the browser.
// Try to find this output in the browser...
console.log("The geoTagging script is going to start...");

let tags = [];

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
    const taglist = JSON.parse(map.dataset.tags);

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

function updateDiscoveryWidget(tags) {
  const discoveryResults = document.getElementById("discoveryResults");
  while (discoveryResults.firstChild) {
    discoveryResults.removeChild(discoveryResults.firstChild);
  }
  for (const tag of tags) {
    const elem = document.createElement("li");
    elem.innerText = `${tag.name} (${tag.latitude}, ${tag.longitude}) ${tag.hashtag}`;
    discoveryResults.appendChild(elem);
  }

  const map = document.getElementById("mapView");
  map.dataset.tags = JSON.stringify(tags);
  updateLocation();
}

// Wait for the page to fully load its DOM content, then call updateLocation
document.addEventListener("DOMContentLoaded", () => {
    updateLocation();

    // Non-lambda functions to have this (the form) available
    document.getElementById("tag-form").onsubmit = function(e) {
      e.preventDefault();

      fetch("/api/geotags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude: this.latitude.value,
          longitude: this.longitude.value,
          name: this.name.value,
          hashtag: this.hashtag.value
        })
      })
        .then(res => res.json())
        .then(tag => updateDiscoveryWidget([tag]));
    }
  
    document.getElementById("discoveryFilterForm").onsubmit = function(e) {
      e.preventDefault();

      fetch("/api/geotags?" + new URLSearchParams({
        latitude: this.discovery_latitude.value,
        longitude: this.discovery_longitude.value,
        searchterm: this.searchterm.value
      }))
        .then(res => res.json())
        .then(tags => updateDiscoveryWidget(tags));
    }
});