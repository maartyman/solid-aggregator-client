import {IResource} from "./interfaces/IResource";

export class GeneralResource implements IResource {
  public url: string;
  public contentType: string;
  public data?: File | string;

  constructor(url: string, contentType: string, data?: File | string) {
    this.url = url;
    this.contentType = contentType;
    this.data = data;
  }
}
