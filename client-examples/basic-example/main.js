import fetch from "node-fetch";
import pkg from "websocket";
//SolidAggregatorClient = require("solid-aggregator-client").SolidAggregatorClient;
const {client} = pkg;

//new SolidAggregatorClient();

const addedRegEx = new RegExp(/added (.+)/);
const removedRegEx = new RegExp(/removed (.+)/);

let queryExplanation = {
    queryString: `
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>
    SELECT ?personName WHERE {
      ?p a foaf:Person .
      ?p foaf:name ?personName .
      ?p foaf:knows ?p2 .
    }
    `,
    sources: [
        "http://localhost:3000/user1/profile/card",
    ],
    lenient: true,
    comunicaVersion: "link-traversal",
    //comunicaContext: QueryExplanation.linkTraversalFollowMatchQuery
}


/*
let queryExplanation = {
    queryString: `
    PREFIX schema:<https://schema.org/>
    PREFIX foaf: <http://xmlns.com/foaf/0.1/>

    SELECT ?n WHERE {
        ?s a schema:Person .
        ?p foaf:name ?n .
    }
    `,
    sources: [
        "http://localhost:3000/user1/profile/card",
    ],
    lenient: true,
    comunicaVersion: "reasoning",
    //comunicaContext: QueryExplanation.linkTraversalFollowMatchQuery
    reasoningRules: "https://raw.githubusercontent.com/maartyman/static-files/master/foaftoschema.n3"
}
*/
fetch("http://localhost:3001", {
    method: "POST",
    body: JSON.stringify(queryExplanation),
    headers: {
        'Content-Type': 'application/json'
    }
}).then((response) => {
    console.log(response.status.toString());
    console.log(JSON.stringify(response.headers.get("location")).toString());

    let wsClient = new client();

    wsClient.on('connectFailed', function(error) {
        console.log('Connect Error: ' + error.toString());
    });

    wsClient.on('connect', function(connection) {
        console.log('WebSocket Client Connected');
        connection.on('error', function(error) {
            console.log("Connection Error: " + error.toString());
        });
        connection.on('close', function() {
            console.log('Connection Closed');
        });
        connection.on('message', function(message) {
            if (message.type === 'utf8') {
                let tempMessage = addedRegEx.exec(message.utf8Data);
                if (tempMessage && tempMessage[1]) {
                    for (const binding of JSON.parse(tempMessage[1]).bindings){
                        console.log("added bindings: ");
                        for (const element of Object.keys(binding.entries)) {
                            console.log("\t" + element + ": " + binding.entries[element].value);
                        }
                    }
                    return;
                }

                tempMessage = removedRegEx.exec(message.utf8Data);
                if (tempMessage && tempMessage[1]) {
                    for (const binding of JSON.parse(tempMessage[1]).bindings){
                        console.log("removed bindings: ");
                        for (const element of Object.keys(binding.entries)) {
                            console.log("\t" + element + ": " + binding.entries[element].value);
                        }
                    }
                }
            }
        });
        connection.sendUTF(response.headers.get("location").toString());
    });

    wsClient.connect(`ws://localhost:3001`, 'bindings');
});
