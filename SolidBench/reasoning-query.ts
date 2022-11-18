import {SolidClient, QueryContext} from "solid-aggregator-client";
import fetch from "cross-fetch";
import chalk from "chalk";

console.log(chalk.blue("Aggregated"));
console.log(chalk.green("Client"));

const solidClient = new SolidClient(
  "http://localhost:3000/pods/00000000000000000933/",
  fetch,
  "http://localhost:3001",
  "fatal"
);

/*
const queryString = `
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?friend WHERE {
  <http://localhost:3000/pods/00000000000000000933/profile/card#me> foaf:knows ?friend.
}
`;
 */

/*
    ?p a foaf:Person.
    ?p foaf:birthday ?birthday.
    ?p foaf:firstName ?firstName.
    ?p foaf:gender ?gender.
    ?p foaf:interest ?interest.
    ?p foaf:surname ?surname.
    ?p foaf:mbox ?email.
    ?p foaf:knows ?knows.
    ?p foaf:schoolHomepage ?schoolHomepage.
    ?p foaf:workInfoHomepage ?workInfoHomepage.
 */

const queryString = `
PREFIX foaf: <http://xmlns.com/foaf/0.1/>

SELECT ?knows WHERE {
    ?p foaf:knows ?knows.
}
`;

async function doAggregatedQuery() {
  const queryContext: QueryContext = {
    query: queryString,
    sources: ["http://localhost:3000/pods/00000000000000000933/profile/card"],
    aggregated: true,
    comunicaVersion: "reasoning",
    reasoningRules: "http://maartyman.github.io/static-files/schemaAlignment/test.n3"
  };

  let query = solidClient.makeQuery(queryContext);

  await query.getBindings();

  const timeMake = performance.now();
  query.getBindings().then((bindings) => {
    console.log(chalk.blue(`Result aggregated (` + ((performance.now() - timeMake)/1000).toLocaleString(undefined,{minimumFractionDigits: 3}) + ` s): `));
    for (const binding of bindings) {
      console.log(chalk.blue("\tbindings: "));
      binding.forEach((value, key) => {
        console.log(chalk.blue("\t\t" + key.value + ": " + value.value));
      });
    }
    query.delete();
  });
}

async function doClientQuery() {
  const queryContext: QueryContext = {
    query: queryString,
    sources: ["http://localhost:3000/pods/00000000000000000933/profile/card"],
    aggregated: false,
    local: {
      guarded: false
    },
    comunicaVersion: "reasoning",
    reasoningRules: "http://maartyman.github.io/static-files/schemaAlignment/test.n3"
  };

  let query = solidClient.makeQuery(queryContext);

  await query.getBindings();

  const timeMake = performance.now();
  await query.getBindings().then((bindings) => {
    console.log(chalk.green(`Result client (` + ((performance.now() - timeMake)/1000).toLocaleString(undefined,{minimumFractionDigits: 3}) + ` s): `));
    for (const binding of bindings) {
      console.log(chalk.green("\tbindings: "));
      binding.forEach((value, key) => {
        console.log(chalk.green("\t\t" + key.value + ": " + value.value));
      });
    }
    query.delete();
  });
}

doAggregatedQuery();
doClientQuery();

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
