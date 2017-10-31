// this is formatted to echo the structure of the Bluemix credentials
module.exports = {
    VCAP_SERVICES: JSON.stringify({
        conversation: [{
            credentials: {
                url: "https://gateway.watsonplatform.net/conversation/api",
                password: "pNRv5LaBHgT6",
                username: "ba56c847-6240-4f39-89c9-0a4a86de08f8"
            }
        }],
        discovery: [{
          credentials: {
            url: "https://gateway.watsonplatform.net/discovery/api",
            username: "4b186cc5-dd00-4a99-862c-9fccb7f3a297",
            password: "GslNUVwgvVf2"
          }
        }]
    }),
    // conversation creds
    workspace_id: "6eac0976-a1a2-4386-b935-a6487883c712",
    conversation_version: "2017-05-26",
    // disco creds
    environment_id: "60f32915-0b55-4765-bf8b-b5009da5ac82",
    collection_id: "34bab049-5985-4a87-99e1-b5230c262610",
    discovery_version: "2017-10-16"
};