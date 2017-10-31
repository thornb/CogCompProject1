// this is formatted to echo the structure of the Bluemix credentials
module.exports = {
    VCAP_SERVICES: JSON.stringify({
        conversation: [{
            credentials: {
                url: "https://gateway.watsonplatform.net/conversation/api",
                password: "UwcZWVrKOCEy",
                username: "8f082926-0070-4575-97af-3093400d691d"
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
    workspace_id: "24df0cb5-b643-4bf3-bed5-96aea2caef5e",
    conversation_version: "2017-04-21",
    // disco creds
    environment_id: "60f32915-0b55-4765-bf8b-b5009da5ac82",
    collection_id: "34bab049-5985-4a87-99e1-b5230c262610",
    discovery_version: "2017-10-16"
};