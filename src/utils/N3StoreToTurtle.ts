import N3 from "n3";

export async function N3StoreToTriples(store: N3.Store): Promise<string> {
  const writer = new N3.Writer(null,{
    format: "N-Triples",
  });
  for (const quad of store) {
    writer.addQuad(quad);
  }
  return new Promise((resolve, reject) => {
    writer.end((error, result) => resolve(result));
  });
}
