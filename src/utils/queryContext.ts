
export type QueryContext = {
  query: string;
  sources: [string];
  reasoningRules?: string;
  aggregated?: boolean;
  local?: {
    guarded: boolean
  }
  comunicaVersion?: string;
  comunicaContext?: string;
};
