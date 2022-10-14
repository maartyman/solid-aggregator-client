
export type QueryContext = {
  query: string;
  sources: [string, ...string[]];
  reasoningRules?: string;
  aggregated?: boolean;
  local?: {
    guarded: boolean
  }
  comunicaVersion?: string;
  comunicaContext?: string;
};
