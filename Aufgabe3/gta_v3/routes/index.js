// File origin: VS1LAB A3

/**
 * This script defines the main router of the GeoTag server.
 * It's a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/**
 * Define module dependencies.
 */

const express = require('express');
const router = express.Router();

/**
 * The module "geotag" exports a class GeoTagStore. 
 * It represents geotags.
 */
const GeoTag = require('../models/geotag');

/**
 * The module "geotag-store" exports a class GeoTagStore. 
 * It provides an in-memory store for geotag objects.
 */
const GeoTagStore = require('../models/geotag-store');

const GeoTagExamples = require('../models/geotag-examples');
const store = new GeoTagStore();
GeoTagExamples.tagList
  .forEach(entry => store.addGeoTag(new GeoTag(entry[1], entry[2], entry[0], entry[3])));
const SEARCH_RADIUS = 100;

/**
 * Route '/' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests cary no parameters
 *
 * As response, the ejs-template is rendered without geotag objects.
 */

router.get('/', (req, res) => {
  res.render('index', { 
    lat: '',
    long: '',
    taglist: []
  })
});

/**
 * Route '/tagging' for HTTP 'POST' requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests cary the fields of the tagging form in the body.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Based on the form data, a new geotag is created and stored.
 *
 * As response, the ejs-template is rendered with geotag objects.
 * All result objects are located in the proximity of the new geotag.
 * To this end, "GeoTagStore" provides a method to search geotags 
 * by radius around a given location.
 */

router.post('/tagging', (req, res) => {
  store.addGeoTag(new GeoTag(
    req.body.Latitude, 
    req.body.Longitude, 
    req.body.Name, 
    req.body.Hashtag));
  
  res.render('index', { 
    lat: req.body.Latitude,
    long: req.body.Longitude,
    taglist: store.getNearbyGeoTags(
      req.body.Latitude, 
      req.body.Longitude, 
      SEARCH_RADIUS
    ) 
  })
});

/**
 * Route '/discovery' for HTTP 'POST' requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests cary the fields of the discovery form in the body.
 * This includes coordinates and an optional search term.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * As response, the ejs-template is rendered with geotag objects.
 * All result objects are located in the proximity of the given coordinates.
 * If a search term is given, the results are further filtered to contain 
 * the term as a part of their names or hashtags. 
 * To this end, "GeoTagStore" provides methods to search geotags 
 * by radius and keyword.
 */

router.post('/discovery', (req, res) => {
  res.render('index', { 
    lat: req.body.Latitude,
    long: req.body.Longitude,
    taglist: store.searchNearbyGeoTags(
      req.body.Searchterm ?? '', 
      req.body.Latitude, 
      req.body.Longitude, 
      SEARCH_RADIUS) 
  })
});

module.exports = router;
