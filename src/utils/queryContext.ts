import {TComunicaContext, TComunicaVersion} from "incremunica";

export type QueryContext = {
  query: string;
  sources: [string, ...string[]];
  reasoningRules?: string;
  aggregated?: boolean;
  local?: {
    guarded: boolean
  }
  comunicaVersion?: TComunicaVersion;
  comunicaContext?: TComunicaContext;
};
