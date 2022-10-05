import {SolidClient, QueryContext} from "solid-aggregator-client";
import fetch from "cross-fetch";

const solidClient = new SolidClient(
  "http://localhost:3000/pods/00000000000000000065/",
  fetch,
  "http://localhost:3001"
);

const queryContext: QueryContext = {
  query: `
  PREFIX snvoc: <http://localhost:3000/www.ldbc.eu/ldbc_socialnet/1.0/vocabulary/>
  
  SELECT ?firstName ?lastName WHERE {
    ?p snvoc:knows ?n . 
    ?n snvoc:hasPerson ?p2 .
    ?p2 snvoc:firstName ?firstName .
    ?p2 snvoc:lastName ?lastName .
  }
  `,
  sources: ["http://localhost:3000/pods/00000000000000000933/profile/card"],
  aggregated: true,
  comunicaVersion: "link-traversal"
};

const query = solidClient.makeQuery(queryContext);

query.getBindings().then((bindings) => {

});

/*
solidClient.getResource("http://localhost:3000/pods/00000000000000000065/profile/card")
  .then((response: Response) => {

  }
);
*/
