import N3 from "n3";

export interface IResource {
  url: string
  contentType: string
  data?: File | string | N3.Store
}
