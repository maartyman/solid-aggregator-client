import {loggerSettings} from "./utils/loggerSettings";
import {Logger} from "tslog";

export class HelloWorld {
  constructor() {
    new Logger(loggerSettings).info("Hello world!");
  }
}

/*
//TODO changeable queries? => 100% clientside (maybe a schema of what the query will look like)

queryKeeper:
  init:
    -make save folder (if it doesn't exist yet)
    -get save files and return it
    -give application aggregator url

  make query:
    give query and variables
    =>
    determine to run client side or aggregator (or let developer decide)
    => return appropriate query object

query object (interface):
  *isQueryDone
  *numberCurrentOfBindings

  -streaming solution:
    -returns stream
    -local: BindingStream
    -aggregated: websockets

  -current solution:
    -returns current solution (complete or not)
    -local: current found bindings
    -aggregated: get request


aggregated query:
  -post query
  -save query decisions and save query UUID

client query:
  -use comunica?
  -reasoning?
  -link traversal?
  -save query decisions

 */
