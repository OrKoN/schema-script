import { JSONSchema7Definition } from "json-schema";
import * as path from "path";
import { capitalize } from "./utils";

export class Schema {
  private content: JSONSchema7Definition;
  private id: string;
  private name: string;
  private pathToSchema: string;
  private references: Ref[];
  private subschemas: Schema[];

  constructor(
    id: string,
    content: JSONSchema7Definition,
    name: string,
    pathToSchema: string,
  ) {
    this.content = content;
    this.id = id;
    this.name = capitalize(name);
    this.pathToSchema = pathToSchema;
    this.references = this.buildRefs();
    this.subschemas = this.buildSubschemas();
  }

  public lookup(id: string): Schema {
    const schema = this.subschemas.find((s) => s.getId() === id);
    if (!schema) {
      throw new Error("Not found");
    }
    return schema;
  }

  public getSubschemas(): Schema[] {
    return this.subschemas;
  }

  public getStaticName(): string {
    return this.name;
  }

  public getRuntimeName(): string {
    return `t${this.name}`;
  }

  public getFilename(): string {
    return this.pathToSchema.replace(".schema.json", "");
  }

  public getDirname(): string {
    return path.dirname(this.pathToSchema);
  }

  public getId(): string {
    return this.id;
  }

  public getReferences(): Ref[] {
    return this.references;
  }

  public getContent(): JSONSchema7Definition {
    return this.content;
  }

  public getTargets(): {
    graphql: boolean;
    iots: boolean;
    ts: boolean;
  } {
    if (this.content instanceof Object) {
      const comment = this.content.$comment || "";
      return {
        graphql: comment.indexOf("+graphql") !== -1,
        iots: comment.indexOf("+iots") !== -1,
        ts: comment.indexOf("+ts") !== -1,
      };
    }
    return {
      graphql: false,
      iots: false,
      ts: false,
    };
  }

  public buildRefs(): Ref[] {
    const result: Ref[] = [];
    this._refs(this.content, result);
    return result;
  }

  public _refs(schema: JSONSchema7Definition, result: Ref[]) {
    if (typeof schema === "boolean") {
      return;
    }
    if (schema.$ref) {
      result.push(new Ref(schema.$ref));
    }
    const properties = schema.properties;
    if (properties) {
      Object.keys(properties).map((key) => {
        this._refs(properties[key], result);
      });
    }
  }

  private buildSubschemas(): Schema[] {
    if (!(this.content instanceof Object)) {
      return [];
    }
    const definitions = this.content.definitions || {};
    const definitionNames = Object.keys(definitions);
    return definitionNames.map((name) => {
      const definition = definitions[name];
      if (!definition) {
        throw new Error("failed");
      }

      if (definition === true) {
        return new Schema(name, definition, name, this.pathToSchema);
      }

      return new Schema(
        definition.$id || `#/definitions/${name}`,
        definition,
        name,
        this.pathToSchema,
      );
    });
  }
}

class Ref {
  private ref: string;

  constructor(ref: string) {
    this.ref = ref;
  }

  public isLocal() {
    return this.ref.startsWith("#");
  }

  public val() {
    return this.ref;
  }
}
