declare module '@strapi/strapi' {
  export namespace Core {
    interface Strapi {
      customFields: {
        register(config: unknown): void;
      };
    }
  }
}
