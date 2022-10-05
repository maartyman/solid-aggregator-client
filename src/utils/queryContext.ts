
export type QueryContext = {
  query: string;
  sources: string[];
  reasoningRules?: string;
  aggregated?: boolean;
  comunicaVersion?: string;
  comunicaContext?: string;
};
