'use strict';

const fs = require('fs');
const path = require('path');

class ServerlessPlugin {
    constructor(serverless, options) {
        this.serverless = serverless;
        this.options = options;
        this.provider = this.serverless.getProvider('aws');

        this.commands = {
            exportEndpoints: {
                usage: 'Export API Gateway endpoints',
                lifecycleEvents: [
                    'exportEndpoints',
                ],
            },
        };

        this.hooks = {
            'exportEndpoints:exportEndpoints': this.exportEndpoints.bind(this),
        };
    }

    exportEndpoints() {
        const config = (this.serverless.service.custom && this.serverless.service.custom.exportEndpoints) || {};
        const options = Object.assign({}, this.options, config);

        const StackName = this.provider.naming.getStackName(options.stage);
        const export_path = (options.path && path.normalize(options.path)) || './endpoints.json';
        const dir_name = path.dirname(export_path);
        const file_name = path.basename(export_path);
        const service_endpoint_key = options.serviceEndpointKey || this.provider.naming.getServiceEndpointRegex();
        
        return this.provider.request('CloudFormation', 'describeStacks', { StackName }, options.stage, options.region).then((response) => {
            if (!response) {
                return;
            }

            const result = response.Stacks[0].Outputs
                .filter(x => x.OutputKey.match(service_endpoint_key))
                .reduce((acc0,x) => {
                    const endpoint = x.OutputValue;
                    const tmp0 = this.serverless.service.getAllFunctions().reduce((acc1,name) => {
                        const tmp1 = this.serverless.service.functions[name].events.reduce((acc2,event) => {
                            if (!event.http) {
                                return;
                            }

                            const is_http_object = (typeof event.http === 'object');
                            let [method,path] = is_http_object ? [event.http.method.toUpperCase(),event.http.path]
                                                               : [event.http.split(' ')[0].toUpperCase(),event.http.split(' ')[1]];
                            path = path !== '/' ? `/${path.split('/').filter(p => p !== '').join('/')}` : '';
                            path = path.replace( /{/g, '{{').replace( /}/g, '}}')
                            method = method !== 'ANY' ? [method] : ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'PATCH', 'POST', 'PUT'];

                            return Object.assign({} , acc2, ...(method.map((key) => {return {[key]:`${endpoint}${path}`}})));
                        },{});
                        return Object.assign({}, acc1, { [name] : tmp1 });
                    }, {});
                    return Object.assign({}, acc0, tmp0);
                },{});

            try {
                dir_name.split(path.sep).reduce((acc,part) => {
                    acc = path.join.apply(null,[acc,part]);
                    fs.mkdirSync(acc);
                    return acc;
                },'');
            } catch (err) {
                if(err.code !== 'EEXIST') throw err;
            }
            fs.writeFileSync(path.join(dir_name,file_name), JSON.stringify(result, null, ' '));
        });
    }
}

module.exports = ServerlessPlugin;
