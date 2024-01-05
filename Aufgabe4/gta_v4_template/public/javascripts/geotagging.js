// File origin: VS1LAB A2

/* eslint-disable no-unused-vars */

// This script is executed when the browser loads index.html.

// "console.log" writes to the browser's console. 
// The console window must be opened explicitly in the browser.
// Try to find this output in the browser...
console.log("The geoTagging script is going to start...");

let lastPaginationData = {
  total_records: 0,
  current_page: 0,
  total_pages: 1,
  next_page: null,
  prev_page: null
};
let lastFilter = {}
let lastLocation = undefined;

function updateDiscoveryWidget(tags, pagination, filter) {
  lastPaginationData = pagination;
  lastFilter = filter;

  document.getElementById("discoveryPaginationText").innerText = `${pagination.current_page + 1}/${pagination.total_pages} (${pagination.total_records})`;
  document.getElementById("discoveryPaginationPrev").disabled = pagination.prev_page == null;
  document.getElementById("discoveryPaginationNext").disabled = pagination.next_page == null;
  
  const discoveryResults = document.getElementById("discoveryResults");
  while (discoveryResults.firstChild) {
    discoveryResults.removeChild(discoveryResults.firstChild);
  }
  for (const tag of tags) {
    const elem = document.createElement("li");
    elem.innerText = `${tag.name} (${tag.latitude}, ${tag.longitude}) ${tag.hashtag}`;
    discoveryResults.appendChild(elem);
  }
  
  const mapManager = new MapManager("pqYXJV4b1tGwd9ZsRr84RJ6wl93FSRYs");
  const map = document.getElementById("mapView");
  map.src = mapManager.getMapUrl(lastLocation.latitude, lastLocation.longitude, tags);
}

function filterWithPagination(page, filter) {
  fetch("/api/geotags?" + new URLSearchParams({
    page: page,
    size: 5,
    ...filter
  }))
    .then(res => res.json())
    .then(json => updateDiscoveryWidget(json.data, json.pagination, filter));
}

function setupEventHandlers() {
  document.getElementById("discoveryPaginationPrev").onclick = (e) => filterWithPagination(lastPaginationData.prev_page, lastFilter);
  document.getElementById("discoveryPaginationNext").onclick = (e) => filterWithPagination(lastPaginationData.next_page, lastFilter);

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
      .then(tag => updateDiscoveryWidget([tag], {
        total_records: 1,
        current_page: 0,
        total_pages: 1,
        next_page: null,
        prev_page: null
      }, {}));
  }

  document.getElementById("discoveryFilterForm").onsubmit = function(e) {
    e.preventDefault();

    filterWithPagination(0, {
      latitude: this.discovery_latitude.value,
      longitude: this.discovery_longitude.value,
      searchterm: this.searchterm.value
    });
  }
}

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

  const locationCallback = helper => {
    latitudes.forEach(lat => lat.value = helper.latitude);
    longitudes.forEach(long => long.value = helper.longitude);
    lastLocation = helper;
    filterWithPagination(0, {
      latitude: helper.latitude,
      longitude: helper.longitude
    });
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
  setupEventHandlers();
  updateLocation();
});