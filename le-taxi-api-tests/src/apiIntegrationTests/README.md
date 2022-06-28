# Generate integration-tests taxis

- Module: `le-taxi-api-node.js`
- Integration tests: src\tests\integration-tests\taxis.test.ts

## Steps

1. npm run generate-integration-tests-shared-state. (To create file: src\apiIntegrationTests\apiIntegrationTests.sharedState.json)
1. Copy file apiIntegrationTests.sharedState.json
   - From: `le-taxi-api-tests` src\apiIntegrationTests\
   - To: `le-taxi-api-node.js` src\tests\integration-tests\
1. You can now run `le-taxi-api-node.js` integration tests
