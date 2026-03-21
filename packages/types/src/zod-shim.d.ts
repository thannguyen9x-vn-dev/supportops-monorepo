declare module "zod" {
  export namespace z {
    type infer<T> = any;
  }

  export const z: any;
}
