should = require "should"

HGAPI = require "../lib"

describe "HGAPI", ->

	it "exposes core classes", ->

		should.exist HGAPI.HGCommandServer, "command server"
		should.exist HGAPI.HGRepo, "repo"

describe "makeParser", ->
	
	it "provides a parser instance for this hg version", (done) ->
		HGAPI.makeParser (err, parser) ->
			parser.should.have.property.status
			done()