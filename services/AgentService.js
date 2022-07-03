const http = require('http');
require('dotenv').config();



const hostname = process.env.ACME_AGENT_HOST
const port = process.env.PORT;
const token =  process.env.TOKEN;
const header = {
     Authorization: `Bearer ${token}`
}

const wallet_Mix = 	
{
  "results": [
    {
      "did": "6Jec7bZxzL6yoKcjxn7P8S",
      "verkey": "3tgNYXka82BsVsL9jDCQK1xZRtYFRBqxvi3hrnNWyZTR",
      "posture": "wallet_only",
      "key_type": "ed25519",
      "method": "sov"
    }
  ]
}

const token1 =  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ3YWxsZXRfaWQiOiI1ZWUxNjU0Ni01NzVkLTQ0NjItYTY0Yy05YWEwZjYwMDBjNGMifQ.Ve8X2CwuCOfqZI4Hb8ifeL30VifspkcD6cVOqXd8RGk";

const token2 = 
{
    "created_at": "2022-02-06T07:22:35.761031Z",
    "settings": {
      "wallet.type": "indy",
      "wallet.name": "MyNewWallet",
      "wallet.webhook_urls": [
        "http://192.168.1.48:3000/webhooks"
      ],
      "wallet.dispatch_type": "default",
      "default_label": "Alice",
      "image_url": "https://aries.ca/images/sample.png",
      "wallet.id": "6fb21450-601e-4e60-ad1c-d463ca986438"
    },
    "wallet_id": "6fb21450-601e-4e60-ad1c-d463ca986438",
    "updated_at": "2022-02-06T07:22:35.761031Z",
    "key_management_mode": "managed",
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ3YWxsZXRfaWQiOiI2ZmIyMTQ1MC02MDFlLTRlNjAtYWQxYy1kNDYzY2E5ODY0MzgifQ.EvKPYsduHgCXU1YsVsTQEcIEO-DLx6xX9ji96MU2H8A"
  }

console.log('Agent is running on: ' + `http://${hostname}:${port}`);

function httpAsync(options, body) {
    return new Promise(function (resolve, reject) {
        const req = http.request(options, (res) => {
            const { statusCode } = res;
            const contentType = res.headers['content-type'];

            let e;
            if (statusCode !== 200) {
                e = new Error('Request Failed.\n' + `Status Code: ${statusCode}`);
            } else if (!/^application\/json/.test(contentType)) {
                e = new Error('Invalid content-type.\n' + `Expected application/json but received ${contentType}`);
            }
            if (e) {
                // Consume response data to free up memory
                res.resume();
                return reject(e);
            }

            res.setEncoding('utf8');
            let rawData = '';
            res.on('data', (chunk) => { rawData += chunk; });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    return resolve(parsedData);
                } catch (e) {
                    return reject(e);
                }
            });
        }).on('error', (e) => {
            return reject(e);
        });
        
        if (body) {
            bodyData = JSON.stringify(body)
            req.write(bodyData || '');
            console.log(bodyData);
        }
        
        req.end();
    });
}

class AgentService {
    async getStatus() {
        try {
            const response = await httpAsync({
                hostname: hostname,
                port: port,
                path: '/status',
                method: 'GET',
                headers: header
            });
            return response;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async getSchema() {
        try {
            const response = await httpAsync({
                hostname: hostname,
                port: port,
                path: '/schemas/created',
                method: 'GET',
                headers: header
            });
            return response;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async getSchemaDetails(id) {
        try {
            const response = await httpAsync({
                hostname: hostname,
                port: port,
                path: `/schemas/${id}`,
                method: 'GET',
                headers: header
            });
            return response;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async createSchema(schema){
        try{
            let body = {
                "attributes": schema.attributes,
                "schema_name" : schema.schema_name,
                "schema_version" : schema.schema_version
              }
            const response = await httpAsync({
                hostname: hostname,
                port: port,
                path: `/schemas`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': JSON.stringify(body).length,
                    'accept' : 'application/json',
                    "Authorization": `Bearer ${token}`
                  } 
            },body);
            return response;
        } catch (error) {
            console.error(error);
            return [];
        }
        };




    async createCredDef(schemaId, revocation=false, tag="default", size=1000){
        try{
            let body = {
                "revocation_registry_size": size,
                "schema_id" : schemaId,
                "support_revocation" : revocation,
                "tag": tag
              }
            const response = await httpAsync({
                hostname: hostname,
                port: port,
                path: `/credential-definitions`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': JSON.stringify(body).length,
                    'accept' : 'application/json',
                    "Authorization": `Bearer ${token}`
                  } 
            },body);
            return response;
        } catch (error) {
            console.error(error);
            return [];
        }
        };

    async getCredDef() {
        try {
            const response = await httpAsync({
                hostname: hostname,
                port: port,
                path: '/credential-definitions/created',
                method: 'GET',
                headers: header
            });
            return response;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async getCredentials() {
        try {
            const response = await httpAsync({
                hostname: hostname,
                port: port,
                path: '/issue-credential-2.0/records?state=done',
                method: 'GET',
                headers: header
            });
            return response;
        } catch (error) {
            console.error(error);
            return null;
        }
    }


    async getSubWallet(){
        try{
            const response = await httpAsync({
                hostname: hostname,
                port: port,
                path: '/multitenancy/wallets',
                method: 'GET'
            });
            return response.results;
        } catch (error) {
            console.error(error);
            return [];
        }
        };
        async getToken(subwalletId){
            try{
                let body = {
                    "wallet_key": "MySecretKey123"
                  }
                const response = await httpAsync({
                    hostname: hostname,
                    port: port,
                    path: `/multitenancy/wallet/${subwalletId}/token`,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': JSON.stringify(body).length,
                        'accept' : 'application/json'
                      } 
                },body);
                return response.results;
            } catch (error) {
                console.error(error);
                return [];
            }
            };
        

    async getConnections() {
        try {
            const response = await httpAsync({
                hostname: hostname,
                port: port,
                path: '/connections',
                method: 'GET',
                headers: header
            });
            return response.results;
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    async createInvitation() {
        try {
            const response = await httpAsync({
                hostname: hostname,
                port: port,
                path: '/connections/create-invitation',
                method: 'POST',
                headers: header
            });
            return response;
        } catch (error) {
            console.error(error);
            return {};
        }
    }

    async receiveInvitation(invitation) {
        try {
            const response = await httpAsync({
                hostname: hostname,
                port: port,
                path: '/connections/receive-invitation',
                method: 'POST',
                headers: header
            }, invitation);
            return response;
        } catch (error) {
            console.error(error);
            return;
        }
    }

    async removeConnection(connectionId) {
        try {
            await httpAsync({
                hostname: hostname,
                port: port,
                path: `/connections/${connectionId}`,
                method: 'DELETE',
                headers: header
            });
        } catch (error) {
            console.error(error);
        } finally {
            return;
        }
    }

    async removeProof(pres_ex_id) {
        try {
            await httpAsync({
                hostname: hostname,
                port: port,
                path: `/present-proof-2.0/records/${pres_ex_id}`,
                method: 'DELETE',
                headers: header
            });
        } catch (error) {
            console.error(error);
        } finally {
            return;
        }
    }



    async getProofRequests() {
        try {
            const response = await httpAsync({
                hostname: hostname,
                port: port,
                path: '/present-proof-2.0/records',
                method: 'GET',
                headers: header
            });
            return response.results;
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    async sendProofRequest(proofRequest) {
        try {
            await httpAsync({
                hostname: hostname,
                port: port,
                path: '/present-proof/send-request',
                method: 'POST',
                headers: header
            }, proofRequest);
        } catch (error) {
            console.error(error);
        } finally {
            return;
        }
    }
}

module.exports = new AgentService();