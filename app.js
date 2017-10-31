/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var express = require('express'),
  app = express(),
  pkg = require('./package.json'),
  Q = require('q'),
  fs = require('fs'),
  watson = require('watson-developer-cloud');

// Bootstrap application settings
require('./config/express')(app);

var log = console.log.bind(null, '  ');
var conversation;
var discovery;
var serviceCredentials;
var intentConfidence;

var allowCrossDomain = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  next();
};

app.use(allowCrossDomain);

// set credentials from bluemix or local .env file
if (process.env.VCAP_SERVICES) {
  console.log("setting vcap services");
  var services = JSON.parse(process.env.VCAP_SERVICES);

  serviceCredentials = null;

  conversation = new watson.ConversationV1({
    url: services.conversation[0].credentials.url || 'https://gateway.watsonplatform.net/conversation/api',
    username: services.conversation[0].credentials.username || '<username>',
    password: services.conversation[0].credentials.password || '<password>',
    version_date: process.env.conversation_version,
    version: 'v1'
  });

  discovery = new watson.DiscoveryV1({
    url: services.discovery[0].credentials.url || 'https://gateway.watsonplatform.net/discovery/api',
    username: services.discovery[0].credentials.username || '<username>',
    password: services.discovery[0].credentials.password || '<password>',
    version_date: process.env.discovery_version
  });

  intentConfidence = process.env.intent_confidence;

} else {
  // load the environment variables - for local testing
  if (fs.existsSync('./.env.js')) {
    Object.assign(process.env, require('./.env.js'));
  }

  serviceCredentials = JSON.parse(process.env.VCAP_SERVICES);

  conversation = new watson.ConversationV1({
    url: serviceCredentials.conversation[0].credentials.url || 'https://gateway.watsonplatform.net/conversation/api',
    username: serviceCredentials.conversation[0].credentials.username || '<username>',
    password: serviceCredentials.conversation[0].credentials.password || '<password>',
    version_date: process.env.conversation_version,
    version: 'v1'
  });

  discovery = new watson.DiscoveryV1({
    url: serviceCredentials.discovery[0].credentials.url || 'https://gateway.watsonplatform.net/discovery/api',
    username: serviceCredentials.discovery[0].credentials.username || '<username>',
    password: serviceCredentials.discovery[0].credentials.password || '<password>',
    version_date: process.env.discovery_version
  });

  var version_date = process.env.discovery_version;
  var environment_id = process.env.environment_id;
  var collection_id = process.env.collection_id;  

  // discovery.query({
  //   version_date: version_date,
  //   environment_id: environment_id,
  //   collection_id: collection_id,
  //   query: "Breast Cancer",
  //   count: 5
  //   },
  //   (err, data) => {
  //     if (err) {
  //       console.log("Error: ");
  //       console.log(err);
  //     }
  //     console.log("data: ");
  //     console.log(data);
      
  //   }
  // );




  intentConfidence = .75;
}

console.log("Confidence Threshold: " + intentConfidence);

// main endpoint
var previousContext = null;
app.post('/api/message', function (req, res) {
  var workspace = process.env.workspace_id;
  if (!workspace) {
    return res.json({
      'output': {
        'text': 'The app has not been configured with a <b>WORKSPACE_ID</b> environment variable. Please refer to the ' +
        '<a href="https://github.com/watson-developer-cloud/conversation-simple">README</a> documentation on how to set this variable. <br>' +
        'Once a workspace has been defined the intents may be imported from ' +
        '<a href="https://github.com/watson-developer-cloud/conversation-simple/blob/master/training/car_workspace.json">here</a> in order to get a working application.'
      }
    });
  }
  var payload = {
    workspace_id: workspace,
    context: {},
    input: {}
  };

  if (req.body) {
    if (req.body.input) {
      payload.input = req.body.input;
    }
    if (req.body.context) {
      // The client must maintain context/state
      payload.context = req.body.context;
    }
  }

  if (!payload.context) {
    payload.context = previousContext;
  }

  (function () {
    var deferred = Q.defer();
    conversation.message(payload, function (err, data) {
      if (err) {
        console.log("ERROR");
        console.log(err);
        return res.status(err.code || 500).json(err);
      }

      deferred.resolve(data);
    })
    return deferred.promise;

  })().then(function (data) {
    
    console.log("New data");
    console.log(data);

    console.log("responce message");
    console.log(data.output.text);
    console.log(data.output.text == "I\'m sorry I don\'t understand that, can you rephrase?");

    if ((data.output.text == "I\'m sorry I don\'t understand that, can you rephrase?") || (data.input.text !== "start conversation" && data.intents.length > 0 && data.intents[0].confidence < intentConfidence)) {
      // return discovery data


      var response = {
        "input": {"text": req.body.input.text},
        "context": data.context,
        "output": {"text": []}
      };

      console.log("before query");

      var version = process.env.discovery_version;
      var environment_id = process.env.environment_id;
      var collection_id = process.env.collection_id;

      var input = req.body.input.text;
      console.log("input: " + input);


      discovery.query({
          version_date: version_date,
          environment_id: environment_id,
          collection_id: collection_id,
          natural_language_query: input,
          passages: true,
          count: 5
        },
        (err, data) => {
          if (err) {
            console.log("Error: ");
            console.log(err);
            return res.status(err.code || 500).json(err);
          }

          // console.log("Data");
          // console.log(data);
          if (data.passages.length > 0) {


            var passage_list = [];

            for(var i = 0; i < data.passages.length; i++) {

              // console.log(data.passages[i].passage_text);

              var passage_msg = "..." + data.passages[i].passage_text + "...\n\n";


              console.log("Before sanitize");

              passage_msg = passage_msg.replace(/<p>/g, '');
              passage_msg = passage_msg.replace(/<\/p>/g, '');
              passage_msg = passage_msg.replace(/head>/g, '');
              passage_msg = passage_msg.replace(/\//g, '');
              passage_msg = passage_msg.replace(/</g, '');
              passage_msg = passage_msg.replace(/>/g, '');
              
              passage_msg = passage_msg.replace(/h1/g, '');
              passage_msg = passage_msg.replace(/h2/g, '');
              passage_msg = passage_msg.replace(/h3/g, '');
              passage_msg = passage_msg.replace(/h4/g, '');
              passage_msg = passage_msg.replace(/h5/g, '');
              passage_msg = passage_msg.replace(/h6/g, '');
              passage_msg = passage_msg.replace(/h7/g, '');
              passage_msg = passage_msg.replace(/h8/g, '');
              passage_msg = passage_msg.replace(/title/g, '');

              console.log("after sanitize");

              passage_msg = "<b>Passage " + (i + 1) + ":</b>\n" + passage_msg;

              // Unicode spaces becuase the app gets rid of other whitespace :(
              passage_msg += "&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;&#x2000;";

              passage_list.push(passage_msg);

            }
            
            var final_str = "";
            for (var i = 0; i < passage_list.length; i++){
              final_str += passage_list[i];
            }
            console.log(final_str); 

            response.output.text = final_str; // keep this use-case agnostic;



          } else {
            response.output.text = "I cannot find an answer to your question.";
          }

          return res.json(response);

          
        }
      );

      // discovery.query({
      //     version_date: version_date,
      //     environment_id: environment_id,
      //     collection_id: collection_id,
      //     query: input,
      //     count: 5
      //   },
      //   (err, data) => {
      //     console.log("in responce");
      //     console.log(data);
      //     if (err) {
      //       console.log("discovery error!");
      //       console.log("Error: ");
      //       console.log(err);
      //       return res.status(err.code || 500).json(err);
      //     }

      //     console.log(data);

      //     if (data.results.length > 0) {
      //       for(var i = 0; i < data.results.length; i++) {
      //         response.output.text.push(data.results[i]); // keep this use-case agnostic;
      //       }
      //     } else {
      //       response.output.text.push("I cannot find an answer to your question.");
      //     }

      //     return res.json(response);
      //   }
      // );
    } else {
      // return conversation data
      return res.json(data);
    }
  });
});

// error-handler application settings
require('./config/error-handler')(app);

var port = process.env.PORT || 3000;
//var host = process.env.VCAP_APP_HOST || 'localhost';
app.listen(port);

//console.log(pkg.name + ':' + pkg.version, host + ':' + port);
