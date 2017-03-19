'use strict';

var config = require( './config.json' );

var util = require('util');

var mongoUtils = require('../utilities/mongoUtils')

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var individualStates = require('../utilities/individualStates')

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

module.exports = { 
  individualFindHAL, 
  individualGetHAL, 
  individualPatchHAL,
  individualCreateHAL };

  // Update individual by Id: PATCH /v2/individual/{id}

  function individualPatchHAL(req, res) {

  var individual = req.swagger.params.individual.value;
  var individualId = parseInt(req.swagger.params.individualId.value);

  // Use connect method to connect to the server
  MongoClient.connect(mongourl, function(err, db) {
    assert.equal(null, err);

    // Get the documents collection
 
    var collection = db.collection('individual');

    const query = { id: individualId.toString() }

    // Update the document
    // db.individual.update( {id: "123"}, { $set: { status: "Rejected"} })

    var patchDoc = { $set: individual }

    collection.update( query, patchDoc, function(err, doc) {
        assert.equal(err, null);

        // Find one document
        collection.findOne( query, function(err, doc) {
            doc = generateIndividualDoc( doc );

            res.json( doc );
         })

        });
    })
  }

  // Find a individual: GET /v2/hal/individual/

  function individualFindHAL(req, res) {
  // Use connect method to connect to the server
  MongoClient.connect(mongourl, function(err, db) {
    assert.equal(null, err);

    var pageno = req.swagger.params.page.value ? parseInt(req.swagger.params.page.value) : 1;

    // Fixed page size for now

    const pagesize = 5

    const firstitem = (pageno-1)*pagesize
    const lastitem = firstitem + pagesize

    const baseURL = req.url.slice( 0, req.url.indexOf("?") )

    // Get the documents collection
 
    var collection = db.collection('individual');

    // Find some documents
    collection.find({}, 
        mongoUtils.fieldFilter(req.swagger.params.fields.value)).toArray(function(err, docs) {
        assert.equal(err, null);

        const totalsize = docs.length

        // slice page
        docs = docs.slice( firstitem, lastitem )

        // Generate individual
        docs.forEach( function( item ) {
          item = generateIndividualDoc( item, baseURL.concat( "/" ).concat( item.id ) )
        }) 

        // create HAL response

        var halresp = {};

        // support v2 backward compatiblity if requested

        if ( req.swagger.params.embed.value == "v2" ) {
          halresp.individual = docs 
          }

        halresp._links = { 
            self: { href: req.url },
            item: []
        }
        
        // add embedded resources if requested

       if ( req.swagger.params.embed.value == "true" ) {
          halresp._embed = {item: []}
          halresp._embed.item = docs 
          }

        // Add array of links
        docs.forEach( function( item ) {
            halresp._links.item.push( {
                  href: baseURL.concat( "/" ).concat( item.id )
                } ) 
        }) 

        // Pagination attributes

        halresp.page = pageno
        halresp.totalrecords = totalsize
        halresp.pagesize = pagesize
        halresp.totalpages = Math.ceil(totalsize/pagesize)

        // Create pagination links

        if ( totalsize > (pageno * pagesize) ) {
          halresp._links.next = { href: baseURL.concat("?page=").concat(pageno+1)}
        }

        halresp._links.first = { href: baseURL.concat("?page=1")}

        if ( pageno > 1 ) {
          halresp._links.previous = { href: baseURL.concat("?page=").concat(pageno-1)}          
        } 

        halresp._links.last = { href: baseURL.concat("?page=").concat(Math.ceil(totalsize/pagesize)) }

        res.json( halresp );
        });
    })
  }

  // Get one individual by Id: GET /v2/hal/individual/{id}

  function individualGetHAL(req, res) {

  var individualId = parseInt(req.swagger.params.individualId.value);

  // Use connect method to connect to the server
  MongoClient.connect(mongourl, function(err, db) {
    assert.equal(null, err);

    // Get the documents collection
 
    var collection = db.collection('individual');

    const query = { id: individualId.toString() }

    // Find one document
    collection.findOne( query, 
      mongoUtils.fieldFilter(req.swagger.params.fields.value), function(err, doc) {

      assert.equal(err, null);

      doc= generateIndividualDoc( doc, req.url );

      console.log( JSON.stringify(doc) )  

      res.json( doc );  
      })
    });
  }

  // Create a new individual: POST /v2/individual

  function individualCreateHAL(req, res) {
  var individual = req.swagger.params.individual.value;

  var self = req.url.slice( 0, req.url.indexOf("?") ) + "/" + individual.id

  // Use connect method to connect to the server
  MongoClient.connect(mongourl, function(err, db) {
    assert.equal(null, err);

    // Get the documents collection
    var collection = db.collection('individual');
    // Insert some documents
    collection.insert( individual, function(err, result) {
      assert.equal(err, null)
      });
    db.close();
    });
    res.json( generateIndividualDoc( individual, self ));
   }


function generateIndividualDoc( doc, url ) {
  // delete the mongodb _id attribute from the JSON document
  delete doc["_id"]

  // create _links

  doc._links= {
            self: {
                href: url
                }
            }

  // create _actions

  doc._actions = [];

  var targetStates = individualStates.nextStates( doc.status );

  targetStates.forEach( function( state ) {
    doc._actions.push( {
      name: state,
      title: state,
      method: "PATCH",
      href: url,
      fields: [ 
        {
          name: "status",
          value: state
        }
      ]
    })
  })

  return doc;
}