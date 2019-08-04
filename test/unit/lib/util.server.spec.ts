import chai, { should } from "chai";
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
should();

// const sinon = require('sinon');
const { ping, echo } = require("../../../src/lib/util.server.library");

const STATIC_PONG = { message: "PONG" };
const ECHO_REQUEST = { value: "Generic Test Phrase" };

describe("util api tests", function() {
    context("ping tests", function() {
        it("ping should pong", function() {
            return ping().then( response => {
                response.should.deep.equal( STATIC_PONG );
            })
        });
    });
    context("echo tests", function() {
        it("echo echos given payload", function() {
            return echo( JSON.stringify( ECHO_REQUEST )).then( response => {
                response.should.deep.equal( ECHO_REQUEST );
            })
        });
    });
});
