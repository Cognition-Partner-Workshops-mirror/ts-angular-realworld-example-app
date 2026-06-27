export interface Errors {
  /** Values may be a single string or an array of strings (RealWorld API returns arrays) */
  errors: { [key: string]: string | string[] };
}
