import {Bindings} from "@comunica/bindings-factory";
import {DataFactory} from "n3";
import {Term} from "rdf-js";
import {Map} from 'immutable';

export function jsonToBindings(jsonString: string): Bindings {
  return new Bindings(DataFactory, Map<string, Term>(Object.entries(JSON.parse(jsonString).entries)));
}
