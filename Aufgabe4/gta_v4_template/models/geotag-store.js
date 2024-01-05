// File origin: VS1LAB A3

const GeoTag = require("./geotag");

/**
 * This script is a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/**
 * A class for in-memory-storage of geotags
 * 
 * Use an array to store a multiset of geotags.
 * - The array must not be accessible from outside the store.
 * 
 * Provide a method 'addGeoTag' to add a geotag to the store.
 * 
 * Provide a method 'removeGeoTag' to delete geo-tags from the store by name.
 * 
 * Provide a method 'getNearbyGeoTags' that returns all geotags in the proximity of a location.
 * - The location is given as a parameter.
 * - The proximity is computed by means of a radius around the location.
 * 
 * Provide a method 'searchNearbyGeoTags' that returns all geotags in the proximity of a location that match a keyword.
 * - The proximity constrained is the same as for 'getNearbyGeoTags'.
 * - Keyword matching should include partial matches from name or hashtag fields. 
 */
class InMemoryGeoTagStore{
    #geotags = []
    #lastID = 0

    addGeoTag(geotag) {
        this.#geotags.push({id: ++this.#lastID, tag: geotag});
        return this.#lastID;
    }

    getGeoTag(id) {
        return this.#geotags.find(entry => entry.id == id)?.tag;
    }

    setGeoTag(id, geotag) {
        this.removeGeoTag(id);
        this.#geotags.push({id: id, tag: geotag});
        return geotag;
    }

    removeGeoTag(id) {
        const geotag = this.#geotags.find(entry => entry.id == id)?.tag;
        this.#geotags = this.#geotags.filter(entry => entry.id != id);
        return geotag;
    }

    getNearbyGeoTags(latitude, longitude, radius) {
        return this.#geotags.map(entry => entry.tag).filter(tag => 
            (tag.latitude - latitude) * (tag.latitude - latitude) + 
            (tag.longitude - longitude) * (tag.longitude - longitude) 
            <= radius * radius);
    }

    searchNearbyGeoTags(searchterm, latitude, longitude, radius) {
        return this
            .getNearbyGeoTags(latitude, longitude, radius)
            .filter(tag => tag.name.toLowerCase().includes(searchterm.toLowerCase()) 
              	|| tag.hashtag.toLowerCase().includes(searchterm.toLowerCase()));
    }

    searchGeoTags(searchterm) {
      return this.#geotags
          .map(entry => entry.tag)
          .filter(tag => tag.name.toLowerCase().includes(searchterm.toLowerCase()) 
              || tag.hashtag.toLowerCase().includes(searchterm.toLowerCase()));
    }

    getGeoTags() {
      return this.#geotags.map(entry => entry.tag);
    }

}

module.exports = InMemoryGeoTagStore
