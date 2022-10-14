import { IDataSource } from '@comunica/types';
import {resolveUndefined} from "../utils/resolveUndefined";
import * as path from "path";

export class QueryExplanation {
  public readonly queryString: String;
  public readonly sources: [IDataSource, ...IDataSource[]];
  public readonly comunicaVersion: String;
  public readonly comunicaContext: String;
  public readonly reasoningRules: String;
  public readonly lenient: boolean;

  constructor(queryString: String, sources: [IDataSource, ...IDataSource[]], comunicaVersion?: String, context?: String, reasoningRules?: String, lenient?: boolean) {
    this.queryString = queryString;
    this.sources = sources;
    switch (comunicaVersion) {
      case "default":
        this.comunicaVersion = "@comunica/query-sparql";
        break;
      case "reasoning":
        this.comunicaVersion = "@comunica/query-sparql-reasoning";
        break;
      case "link-traversal":
        this.comunicaVersion = "@comunica/query-sparql-link-traversal";
        break;
      case "link-traversal-solid":
        this.comunicaVersion = "@comunica/query-sparql-link-traversal-solid";
        break;
      case "solid":
        this.comunicaVersion = "@comunica/query-sparql-solid";
        break;
      default:
        this.comunicaVersion = "@comunica/query-sparql";
        break;
    }
    switch(context) {
      case "default":
        this.comunicaContext = path.resolve(__dirname, "../../node_modules/@comunica/query-sparql/config/config-default.json");
        break;
      case "reasoning-default":
        this.comunicaContext = path.resolve(__dirname, "../../node_modules/@comunica/config-reasoning/config/config-default.json");
        break;
      case "link-traversal-default":
        this.comunicaContext = path.resolve(__dirname, "../../node_modules/@comunica/config-query-sparql-link-traversal/config/config-default.json");
        break;
      case "link-traversal-follow-all":
        this.comunicaContext = path.resolve(__dirname, "../../node_modules/@comunica/config-query-sparql-link-traversal/config/config-follow-all.json");
        break;
      case "link-traversal-follow-content-policies-conditional":
        this.comunicaContext = path.resolve(__dirname, "../../node_modules/@comunica/config-query-sparql-link-traversal/config/config-follow-content-policies-conditional.json");
        break;
      case "link-traversal-follow-content-policies-restrictive":
        this.comunicaContext = path.resolve(__dirname, "../../node_modules/@comunica/config-query-sparql-link-traversal/config/config-follow-content-policies-restrictive.json");
        break;
      case "link-traversal-follow-match-pattern-bound":
        this.comunicaContext = path.resolve(__dirname, "../../node_modules/@comunica/config-query-sparql-link-traversal/config/config-follow-match-pattern-bound.json");
        break;
      case "link-traversal-follow-match-query":
        this.comunicaContext = path.resolve(__dirname, "../../node_modules/@comunica/config-query-sparql-link-traversal/config/config-follow-match-query.json");
        break;
      case "link-traversal-solid-default":
        this.comunicaContext = path.resolve(__dirname, "../../node_modules/@comunica/config-query-sparql-link-traversal/config/config-solid-default.json");
        break;
      case "link-traversal-solid-prov-sources":
        this.comunicaContext = path.resolve(__dirname, "../../node_modules/@comunica/config-query-sparql-link-traversal/config/config-solid-prov-sources.json");
        break;
      case "link-traversal-solid-shapetrees":
        this.comunicaContext = path.resolve(__dirname, "../../node_modules/@comunica/config-query-sparql-link-traversal/config/config-solid-shapetrees.json");
        break;
      case "link-traversal-solid-single-pod":
        this.comunicaContext = path.resolve(__dirname, "../../node_modules/@comunica/config-query-sparql-link-traversal/config/config-solid-single-pod.json");
        break;
      case "solid-default":
        this.comunicaContext = path.resolve(__dirname, "../../node_modules/@comunica/config-query-sparql-solid/config/config-default.json");
        break;
      default:
        switch (comunicaVersion) {
          //TODO add custom configs
          case "default":
            this.comunicaContext = path.resolve(__dirname, "../../node_modules/@comunica/query-sparql/config/config-default.json");
            break;
          case "reasoning":
            this.comunicaContext = path.resolve(__dirname, "../../node_modules/@comunica/config-reasoning/config/config-default.json");
            break;
          case "link-traversal":
            this.comunicaContext = path.resolve(__dirname, "../../node_modules/@comunica/config-query-sparql-link-traversal/config/config-default.json");
            break;
          case "solid":
            this.comunicaContext = path.resolve(__dirname, "../../node_modules/@comunica/config-query-sparql-solid/config/config-default.json");
            break;
          default:
            this.comunicaContext = path.resolve(__dirname, "../../node_modules/@comunica/query-sparql/config/config-default.json");
            break;
        }
        break;
    }
    this.reasoningRules = resolveUndefined(reasoningRules, "");
    this.lenient = resolveUndefined(lenient, false);
  }

}
