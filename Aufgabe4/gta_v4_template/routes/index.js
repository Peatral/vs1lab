// File origin: VS1LAB A3, A4

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
// eslint-disable-next-line no-unused-vars
const GeoTag = require('../models/geotag');

/**
 * The module "geotag-store" exports a class GeoTagStore. 
 * It provides an in-memory store for geotag objects.
 */
// eslint-disable-next-line no-unused-vars
const GeoTagStore = require('../models/geotag-store');

const GeoTagExamples = require('../models/geotag-examples');
const store = new GeoTagStore();
GeoTagExamples.tagList
  .forEach(([name, latitude, longitude, hashtag]) => store.addGeoTag(new GeoTag(latitude, longitude, name, hashtag)));
const SEARCH_RADIUS = 100;

function parseGeoTag(body) {
  const { latitude, longitude, name, hashtag } = body;
  if (!latitude || !longitude || !name || !hashtag) {
    return undefined;
  }
  if (name.length > 10 || !/^#[a-zA-Z0-9]{1,10}$/.test(hashtag)) {
    return undefined;
  }
  return new GeoTag(latitude, longitude, name, hashtag);
}
// App routes (A3)

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
    taglist: store.getGeoTags() 
  })
});

// API routes (A4)

/**
 * Route '/api/geotags' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the fields of the Discovery form as query.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * As a response, an array with Geo Tag objects is rendered as JSON.
 * If 'searchterm' is present, it will be filtered by search term.
 * If 'latitude' and 'longitude' are available, it will be further filtered based on radius.
 */

router.get('/api/geotags', (req, res) => {
  const {latitude, longitude, searchterm} = req.query;
  
  if (latitude && longitude) {
    if (searchterm) {
      res.json(store.searchNearbyGeoTags(
        searchterm, 
        latitude, 
        longitude, 
        SEARCH_RADIUS
      ));
    } else {
      res.json(store.getNearbyGeoTags(
        latitude, 
        longitude, 
        SEARCH_RADIUS
      ));
    }
  } else {
    if (searchterm) {
      res.json(store.searchGeoTags(searchterm));
    } else {
      res.json(store.getGeoTags());
    }
  }
});


/**
 * Route '/api/geotags' for HTTP 'POST' requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * The URL of the new resource is returned in the header as a response.
 * The new resource is rendered as JSON in the response.
 */

router.post('/api/geotags', (req, res) => {
  const geotag = parseGeoTag(req.body);
  if (!geotag) {
    return res.sendStatus(400);
  }

  const id = store.addGeoTag(geotag);

  res
    .setHeader('Location', `/api/geotags/${id}`)
    .status(201)
    .json(geotag);
});


/**
 * Route '/api/geotags/:id' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * The requested tag is rendered as JSON in the response.
 */

router.get('/api/geotags/:id', (req, res) => {
  const geotag = store.getGeoTag(req.params.id);
  if (!geotag) {
    return res.sendStatus(404);
  }
  res.json(geotag);
});


/**
 * Route '/api/geotags/:id' for HTTP 'PUT' requests.
 * (http://expressjs.com/de/4x/api.html#app.put.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 * 
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * Changes the tag with the corresponding ID to the sent value.
 * The updated resource is rendered as JSON in the response. 
 */

router.put('/api/geotags/:id', (req, res) => {
  if (!store.getGeoTag(req.params.id)) {
    return res.sendStatus(404);
  }

  const geotag = parseGeoTag(req.body);
  if (!geotag) {
    return res.sendStatus(400);
  }

  res.json(store.setGeoTag(req.params.id, geotag));
});


/**
 * Route '/api/geotags/:id' for HTTP 'DELETE' requests.
 * (http://expressjs.com/de/4x/api.html#app.delete.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * Deletes the tag with the corresponding ID.
 * The deleted resource is rendered as JSON in the response.
 */

router.delete('/api/geotags/:id', (req, res) => {
  if (!store.getGeoTag(req.params.id)) {
    return res.sendStatus(404);
  }

  res.json(store.removeGeoTag(req.params.id));
});

module.exports = router;
