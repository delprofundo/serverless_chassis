import chai, { should } from "chai";
import chaiAsPromised from "chai-as-promised";
import { ping, echo } from "../../../src/lib/util.server.library";

chai.use(chaiAsPromised);
should();

const STATIC_PONG = { message: "PONG" };
const ECHO_REQUEST = { value: "Generic Test Phrase" };

describe("util api tests", () => {
  context("ping tests", () => {
    it("ping should pong", () => {
      return ping().then((response) => {
        response.should.deep.equal(STATIC_PONG);
      });
    });
  });
  context("echo tests", () => {
    it("echo echos given payload", () => {
      return echo(JSON.stringify(ECHO_REQUEST)).then((response) => {
        response.should.deep.equal(ECHO_REQUEST);
      });
    });
  });
});
