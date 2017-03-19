'use strict';

var config = require( './config.json' );

var util = require('util');

var mongoUtils = require('../utilities/mongoUtils')

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

// Mongo URL

var argv = require('minimist')(process.argv);
var dbhost = argv.dbhost ? argv.dbhost : config.db_host;
const mongourl = config.db_prot+"://"+dbhost+":"
        +config.db_port+"/"+config.db_name

/*
 Once you 'require' a module you can reference the things that it exports.  These are defined in module.exports.

 For a controller in a127 (which this is) you should export the functions referenced in your Swagger document by name.

 Either:
  - The HTTP Verb of the corresponding operation (get, put, post, delete, etc)
  - Or the operationId associated with the operation in your Swagger document

  In the starter/skeleton project the 'get' operation on the '/hello' path has an operationId named 'hello'.  Here,
  we specify that in the exports of this module that 'hello' maps to the function named 'hello'
 */

module.exports = { troubleTicketFind, troubleTicketCreate, troubleTicketGet, troubleTicketUpdate };


  // Find a troubleTicket: GET /v2/troubleTicket/

  function troubleTicketFind(req, res) {

  // Use connect method to connect to the server
  MongoClient.connect(mongourl, function(err, db) {
    assert.equal(null, err);


    // Get the documents collection
 
    var collection = db.collection('troubleTicket');
  
    // Find some documents
    collection.find({}, 
        mongoUtils.fieldFilter(req.swagger.params.fields.value)).toArray(function(err, docs) {
        assert.equal(err, null);
        res.json( docs );
        });
    })
  }

  // Get one troubleTicket by Id: GET /v2/troubleTicket/{id}

  function troubleTicketGet(req, res) {

  var troubleTicketId = parseInt(req.swagger.params.troubleTicketId.value);

  // Use connect method to connect to the server
  MongoClient.connect(mongourl, function(err, db) {
    assert.equal(null, err);

    // Get the documents collection
 
    var collection = db.collection('troubleTicket');

    const query = { id: troubleTicketId.toString() }

    // Find some documents
    collection.findOne( query, 
      mongoUtils.fieldFilter(req.swagger.params.fields.value), function(err, doc) {
      assert.equal(err, null);

      res.json( doc );
      });
    })
  }

  // Update troubleTicket by Id: PUT /v2/troubleTicket/{id}

  function troubleTicketUpdate(req, res) {

  var troubleTicket = req.swagger.params.troubleTicket.value;
  var troubleTicketId = parseInt(req.swagger.params.troubleTicketId.value);

  // Use connect method to connect to the server
  MongoClient.connect(mongourl, function(err, db) {
    assert.equal(null, err);

    // Get the documents collection
 
    var collection = db.collection('troubleTicket');

    const query = { id: troubleTicketId.toString() }

    console.log( "Update: ", JSON.stringify( query) )

    // Update the document
    collection.update( query, troubleTicket, function(err, doc) {
        assert.equal(err, null);
        res.json( doc );
        });
    })
  }

  // Create a new troubleTicket: POST /v2/troubleTicket

  function troubleTicketCreate(req, res) {
  var troubleTicket = req.swagger.params.troubleTicket.value;

  // Use connect method to connect to the server
  MongoClient.connect(mongourl, function(err, db) {
    assert.equal(null, err);

    // Get the documents collection
    var collection = db.collection('troubleTicket');
    // Insert some documents
    collection.insert( troubleTicket, function(err, result) {
      assert.equal(err, null)
      });
    db.close();
    });
    res.json(troubleTicket);
   }
