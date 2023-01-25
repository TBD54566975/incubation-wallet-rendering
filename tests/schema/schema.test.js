const path = require("path");
const fs = require("fs");
const assert = require("assert");
const ajv = require("ajv");

describe("test json schema validation", function () {
  const schemaDir = path.resolve(__dirname, "../../spec/schemas");
  const testDataDir = path.resolve(__dirname, "../../spec/test/");

  const schemaTest = [
    {
      name: "Valid Entity Schema Test",
      schema: path.join(schemaDir, "/v0.0.1/entity-styles.json"),
      data: path.join(testDataDir, "v0.0.1/entity-styles/simple.json"),
      result: true,
    },
    {
      name: "Valid Display Object Mapping Test With Path",
      schema: path.join(schemaDir, "/v0.0.1/display-mapping-object.json"),
      data: path.join(
        testDataDir,
        "v0.0.1/data-display/display-mapping-object/with-path.json"
      ),
      result: true,
    },
    {
      name: "Valid Display Object Mapping Test With Text",
      schema: path.join(schemaDir, "/v0.0.1/display-mapping-object.json"),
      data: path.join(
        testDataDir,
        "v0.0.1/data-display/display-mapping-object/with-text.json"
      ),
      result: true,
    },
    {
      name: "Valid Display Object Mapping Test With Text",
      schema: path.join(
        schemaDir,
        "/v0.0.1/labeled-display-mapping-object.json"
      ),
      data: path.join(
        testDataDir,
        "v0.0.1/data-display/labeled-display-mapping-object/with-text.json"
      ),
      result: true,
    },
    {
      name: "Valid Display Object Mapping Test With Path",
      schema: path.join(
        schemaDir,
        "/v0.0.1/labeled-display-mapping-object.json"
      ),
      data: path.join(
        testDataDir,
        "v0.0.1/data-display/labeled-display-mapping-object/with-path.json"
      ),
      result: true,
    },
  ];

  schemaTest.forEach(function (t) {
    it(t.name, function () {
      const schema = JSON.parse(fs.readFileSync(t.schema));
      const data = JSON.parse(fs.readFileSync(t.data));
      const jv = new ajv({ allErrors: true });
      const validate = jv.compile(schema);
      const valid = validate(data);
      assert.equal(null, validate.errors);
      assert.equal(t.result, valid);
    });
  });
});
