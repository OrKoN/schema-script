import { Schema } from "./Schema";

export class SchemaSet {
  private schemas: Schema[];

  constructor(schemas: Schema[]) {
    this.schemas = schemas;
  }

  public getSchemas(): Schema[] {
    return this.schemas;
  }

  public lookup(ref: string): Schema {
    const schema = this.schemas.find((s) => s.getId() === ref);
    if (!schema) {
      throw new Error("Not found");
    }
    return schema;
  }
}
