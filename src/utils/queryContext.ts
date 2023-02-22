import {TComunicaContext, TComunicaVersion} from "incremunica";
import { IDataSource } from '@comunica/types';

export type QueryContext = {
  query: string;
  sources: [IDataSource, ...IDataSource[]];
  reasoningRules?: string;
  lenient?: boolean;
  aggregated?: boolean;
  local?: {
    guarded: boolean
  }
  comunicaVersion?: TComunicaVersion;
  comunicaContext?: TComunicaContext;
};
