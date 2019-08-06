import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import { AWSError, DynamoDB, Request } from "aws-sdk";
import { putToDb, updateRecord } from "../../../src/lib/awsHelpers/dynamoCRUD.helper.library";

chai.use(chaiAsPromised);
chai.use(sinonChai);


describe("dynamoDB crud helper", function() {
  const sandbox = sinon.createSandbox();
  const dbClient: DynamoDB.DocumentClient = new DynamoDB.DocumentClient();

  afterEach(() => {
    sandbox.restore();
  });

  context("put", () => {
    const EXPECTED_PUT_RESPONSE: DynamoDB.DocumentClient.PutItemOutput = {};

    it("put item", () => {
      const returnValueMock: Request<DynamoDB.DocumentClient.UpdateItemOutput, AWSError> = {
        promise() {
          return EXPECTED_PUT_RESPONSE;
        }
      } as Request<DynamoDB.DocumentClient.PutItemOutput, AWSError>;

      const stub = sandbox.stub(DynamoDB.DocumentClient.prototype, "put").returns(returnValueMock);
      const dbItem = {
        TableName: "the-test-table",
        Item: { id: 12345 }
      };
      return putToDb(dbItem, dbClient).then(response => {
        stub.should.have.been.calledWith(dbItem);

        response.should.deep.equal(EXPECTED_PUT_RESPONSE);
      });
    });
  });

  context("update", () => {
    const EXPECTED_UPDATE_RESPONSE: DynamoDB.DocumentClient.UpdateItemOutput = {};

    it("update item", () => {
      const returnValueMock: Request<DynamoDB.DocumentClient.UpdateItemOutput, AWSError> = {
        promise() {
          return EXPECTED_UPDATE_RESPONSE;
        }
      } as Request<DynamoDB.DocumentClient.UpdateItemOutput, AWSError>;

      const stub = sandbox.stub(DynamoDB.DocumentClient.prototype, "update").returns(returnValueMock);
      const updatePayload = {
        TableName: "da table",
        Key: {
          messageId: 12345
        },
        ReturnValues: "ALL_NEW",
        ExpressionAttributeValues: {}
      };
      return updateRecord(updatePayload, dbClient).then(response => {
        stub.should.have.been.calledWith(updatePayload);
        response.should.deep.equal(EXPECTED_UPDATE_RESPONSE);
      });
    });
  });
});
