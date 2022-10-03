import {IResource} from "./interfaces/IResource";
import N3 from "n3";

export class RDFResource implements IResource {
  public url: string;
  public contentType = "text/turtle";
  public data?: string | N3.Store;

  constructor(url: string, data?: N3.Store | string) {
    this.url = url;
    this.data = data;
  }
}
