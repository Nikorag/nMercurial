var expect = require("chai").expect;
var request = require("request");
var hgService = require("../services/hgService");
var PropertiesReader = require('properties-reader');
var config = PropertiesReader('properties/test.properties');

describe("HG Service", function() {

    describe("Properties set", function(){
        it("test.repo.path", function(){
            var repoPath = config.get("test.repo.path");
            expect(repoPath).to.not.be.empty;
        });

        it("test.repo.url", function(){
            var repoPath = config.get("test.repo.url");
            expect(repoPath).to.not.be.empty;
        });
    });

    describe("Get repo path", function(){
        it("returns A path", function(){
           hgService.getRepoPath(config.get("test.repo.path")).then(function(result){
               console.log(result);
               expect(result).to.not.be.empty;
           });
        });

        it("returns the correct path", function(){
            hgService.getRepoPath(config.get("test.repo.path")).then(function(result){
                expect(test.repo.url).to.equal(config.get("test.repo.url"));
            });
        });
    })
});