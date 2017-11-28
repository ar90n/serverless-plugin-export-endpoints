const fetch = require('node-fetch')
const endpoints = require('./endpoints.json')

fetch(endpoints['hello']['GET'])
    .then((res) =>  res.json())
    .then((json) => console.log(json.message));
