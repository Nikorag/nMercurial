var expect = require("chai").expect;
var request = require("request");

describe("Express Web Server", function(){
    var url = "http://localhost:3000/";

    it("Homepage returns status 200", function() {
        request(url, function(error, response, body) {
            expect(response.statusCode).to.equal(200);
        });
    });

    it("Missing page returns 404", function(){
        request(url+"nonExistentPage", function(error, response, body) {
            expect(response.statusCode).to.equal(404);
        });
    })
});