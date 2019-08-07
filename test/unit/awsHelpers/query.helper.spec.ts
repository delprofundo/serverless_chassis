import { should } from "chai";
import { isAcceptablePageLimit, createBaseQueryParameters, lekMe} from "../../../src/lib/awsHelpers/query.helper.library";

should();
describe("query.helper.library", () => {
  const pageParam = {
    MIN: 5,
    MAX: 10,
    DEFAULT:25
  };
  context("is acceptable page limit", () => {
    it("should be false when candidate limit is zero ", () => {
      isAcceptablePageLimit(0, pageParam).should.equal(false);
    });
    it("should be false when candidate limit is less than Min ", () => {
      isAcceptablePageLimit(4, pageParam).should.equal(false);
    });
    it("should be false when candidate limit is greater than Max ", () => {
      isAcceptablePageLimit(14, pageParam).should.equal(false);
    });
    it("should be true when candidate limit is same  as than Min ", () => {
      isAcceptablePageLimit(5, pageParam).should.equal(true);
    });
    it("should be true when candidate limit is same than Max ", () => {
      isAcceptablePageLimit(10, pageParam).should.equal(true);
    });
  });
  context("create base query parameters with limit", ()=> {

    it("should set limit as default", () => {
      createBaseQueryParameters("daTable", {limit: 0}, pageParam).should.deep
        .equal({ TableName: 'daTable', Limit: 25 });
    });
    it("should set limit from query string", () => {
      createBaseQueryParameters("daTable", {limit: 8}, pageParam).should.deep
        .equal({ TableName: 'daTable', Limit: 8 });
    });
  });
  context("create base query parameters with lek", ()=> {
    it("should set lek and limit from query string", () => {
      createBaseQueryParameters("daTable", {lek: "{\"test\": 4}"}, null).should.deep
        .equal({ TableName: 'daTable', ExclusiveStartKey: {test: 4} });
    });
  });
  context("lekMe", ()=> {
    it("should set lek from dynamo response", () => {
      const targetResponse = {target: "target"};
      const dynamoResponse = {LastEvaluatedKey: {type: "daLek"}};
      lekMe(targetResponse, dynamoResponse).should.deep
        .equal({
          target: "target",
          lek: {
            type: "daLek"
          }
        });
    });
    it("lek not set when dynamo LastEvaluatedKey is null", () => {
      const targetResponse = {target: "target"};
      const dynamoResponse = {LastEvaluatedKey: null};
      lekMe(targetResponse, dynamoResponse).should.deep
        .equal({
          target: "target"
        });
    });
    it("lek not set when dynamo LastEvaluatedKey is not property", () => {
      const targetResponse = {target: "target"};
      const dynamoResponse = {};
      lekMe(targetResponse, dynamoResponse).should.deep
        .equal({
          target: "target"
        });
    });
  });
});
