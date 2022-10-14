const log = require('why-is-node-running')
import {SolidClient, QueryContext} from "solid-aggregator-client";
import fetch from "cross-fetch";

const solidClient = new SolidClient(
  "http://localhost:3000/pods/00000000000000000933/",
  fetch,
  "http://localhost:3001"
);

function doQuery() {
  const queryContext: QueryContext = {
    query: `
    PREFIX snvoc: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/>
    
    SELECT ?n WHERE {
      <${solidClient.podUrl}profile/card#me> snvoc:knows ?n . 
    }
    `,
    sources: ["http://localhost:3000/pods/00000000000000000933/profile/card"],
    aggregated: false,
    local: {
      guarded: true
    }
    //comunicaVersion: "link-traversal"
  };

  let query = solidClient.makeQuery(queryContext);

  query.getBindings().then((bindings) => {
    console.log("Received: ");
    for (const binding of bindings) {
      console.log("\tbindings: ");
      binding.forEach((value, key) => {
        console.log("\t\t" + key.value + ": " + value.value);
      });
    }
    query.delete();
  });
}

doQuery();

/*
query.streamBindings((bindings, addition) => {
  if (addition) {
    console.log("added bindings: ");
    bindings.forEach((value, key) => {
      console.log("\t" + key.value + ": " + value.value);
    });
  }
  else {
    console.log("removed bindings: ");
    bindings.forEach((value, key) => {
      console.log("\t" + key.value.toString() + ": " + value.value.toString());
    });
  }
});
*/

/*
solidClient.getResource("http://localhost:3000/pods/00000000000000000065/profile/card")
  .then((response: Response) => {

  }
);
*/
