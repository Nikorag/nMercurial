should = require "should"

Parsers = require "../lib/parsers"

describe "Parsers", ->
  versionData = [
      { channel: 'o', length: 40,  body: 'Mercurial Distributed SCM (version 3.4)\n' },
      { channel: 'o', length: 255, body: '(see http://mercurial.selenic.com for more information)\n\nCopyright (C) 2005-2015 Matt Mackall and others\nThis is free software; see the source for copying conditions. There is NO\nwarranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.\n' },
      { channel: 'r', length: 4,   body: 0 } ]

  it "should extract version 3.4", (done) ->
      version = Parsers.version versionData
      version.should.equal "3.4"
      done()

  jsonData = [  { channel: 'o', length: 1, body: '[' },
     { channel: 'o', length: 4, body: '\n {\n' },
     { channel: 'o', length: 16, body: '  "active": true' },
     { channel: 'o', length: 2, body: ',\n' },
     { channel: 'o', length: 21, body: '  "branch": "default"' },
     { channel: 'o', length: 2, body: ',\n' },
     { channel: 'o', length: 17, body: '  "closed": false' },
     { channel: 'o', length: 2, body: ',\n' },
     { channel: 'o', length: 18, body: '  "current": false' },
     { channel: 'o', length: 2, body: ',\n' },
     { channel: 'o', length: 52, body: '  "node": "3358da28d762d898bfb01581fcb4384944312071"' },
     { channel: 'o', length: 2, body: ',\n' },
     { channel: 'o', length: 11, body: '  "rev": 44' },
     { channel: 'o', length: 3, body: '\n }' },
     { channel: 'o', length: 1, body: ',' },
     { channel: 'o', length: 4, body: '\n {\n' },
     { channel: 'o', length: 17, body: '  "active": false' },
     { channel: 'o', length: 2, body: ',\n' },
     { channel: 'o', length: 30, body: '  "branch": "branches-command"' },
     { channel: 'o', length: 2, body: ',\n' },
     { channel: 'o', length: 17, body: '  "closed": false' },
     { channel: 'o', length: 2, body: ',\n' },
     { channel: 'o', length: 18, body: '  "current": false' },
     { channel: 'o', length: 2, body: ',\n' },
     { channel: 'o', length: 52, body: '  "node": "7658b380389cb7da6b7c9d9574eb227d7045f070"' },
     { channel: 'o', length: 2, body: ',\n' },
     { channel: 'o', length: 11, body: '  "rev": 43' },
     { channel: 'o', length: 3, body: '\n }' },
     { channel: 'o', length: 3, body: '\n]\n' },
     { channel: 'r', length: 4, body: 0 } ]

  it "can parse json output", () ->
    branches = Parsers.json jsonData
    branches.should.have.length 2
    branches[0].branch.should.be.equal "default"
    branches[0].active.should.be.true
    branches[1].branch.should.be.equal "branches-command"
    branches[1].active.should.be.false

  it "can parse raw text output", () ->
    text = Parsers.text versionData
    text.should.match /^Mercurial Distributed SCM[\s\S]*FITNESS FOR A PARTICULAR PURPOSE\.$/m

  describe "Parsers given mercurial version 3.4 input", () ->
      parsers = new Parsers "3.4"

      tagsData = [
          { channel: 'o', length: 3,   body: 'tip' },
          { channel: 'o', length: 46,  body: '                               28:b1ce439e96b9' },
          { channel: 'o', length: 1,   body: '\n' },
          { channel: 'o', length: 4,   body: '1.11' },
          { channel: 'o', length: 45,  body: '                              27:00c9c34d6d00' },
          { channel: 'o', length: 1,   body: '\n' },
          { channel: 'r', length: 4,   body: 0 } ]

      it "should extract tags", (done) ->
          tags = parsers.tags tagsData
          tags.should.have.property "1.11"
          tags.should.have.property "tip"
          tags.tip[0].should.equal "28"
          tags.tip[1].should.equal "b1ce439e96b9"
          done()

      statusData = [
          { channel: 'o', length: 2,   body: 'A ' },
          { channel: 'o', length: 19,  body: 'lib/parsers.coffee\n' },
          { channel: 'o', length: 2,   body: 'C ' },
          { channel: 'o', length: 25,  body: 'test/parsers_spec.coffee\n' },
          { channel: 'o', length: 2,   body: '? ' },
          { channel: 'o', length: 18,  body: 'package.json.orig\n' },
          { channel: 'r', length: 4,   body: 0 } ]

      it "should extract status information", (done) ->
          states = parsers.status statusData
          states['lib/parsers.coffee'].should.equal 'A'
          states['package.json.orig'].should.equal '?'
          done()
