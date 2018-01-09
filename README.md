serverless-plugin-export-endpoints
===============
Export API Gateway endpoints as json

serverless-plugin-export-endpoints is a Serverless plugin to export API Gateway endpoints as json.


Installation
===============

    npm install serverless-plugin-export-endpoints --save-dev

Example
===============

    $cd example
    $sls deploy
    $sls exportEndpoints
    $cat endpoints.json
    {
      "hello": {
      "GET": "https://your-api-gateway-endpoint.execute-api.us-east-1.amazonaws.com/dev/hello"
    }
    $node test.js
    Go Serverless v1.0! Your function executed successfully!

Configuration
===============

    custom:
        exportEndpoints:
            path: "./endpoints.json" # optional
            serviceEndpointKey: "/^ServiceEndpoint/" # optional, regex or string

Note: serviceEndpointKey is by default provided by the Serverless AWS provider https://github.com/serverless/serverless/blob/master/lib/plugins/aws/lib/naming.js

License
===============
This software is released under the MIT License, see LICENSE.txt.
