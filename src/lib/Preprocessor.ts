import * as fs from "fs";
import * as t from "io-ts-codegen";
import { JSONSchema7 } from "json-schema";
import * as path from "path";
import * as prettier from "prettier";
import { toIR } from "./generator";
import { Schema } from "./Schema";
import { SchemaSet } from "./SchemaSet";
import { resolveImport } from "./utils";

export class Preprocessor {
  private schemaSet: SchemaSet;

  constructor(schemaPaths: string[]) {
    this.schemaSet = new SchemaSet(
      schemaPaths.map((pathToSchema) => {
        if (!pathToSchema.endsWith(".schema.json")) {
          throw new Error("Schema file should end with .schema.json");
        }
        const content = JSON.parse(
          fs.readFileSync(pathToSchema, "utf8"),
        ) as JSONSchema7;
        return new Schema(
          content.$id || "root",
          content,
          path
            .basename(pathToSchema)
            .split(".")
            .shift() as string,
          pathToSchema,
        );
      }),
    );
  }

  public async compile() {
    for (const schema of this.schemaSet.getSchemas()) {
      const filePath = schema.getFilename() + ".ts";
      const source = this.compileSchema(schema);
      if (source) {
        const options = await prettier.resolveConfig(filePath);
        fs.writeFileSync(
          filePath,
          prettier.format(
            source,
            options ? { ...options, parser: "babylon" } : { parser: "babylon" },
          ),
          "utf8",
        );
      }
    }
  }

  private compileSchema(schema: Schema) {
    const { ts, iots, graphql } = schema.getTargets();
    if (!ts && !iots && graphql) {
      return;
    }
    return `
      // auto-generated by json-schema-preprocessor. DO NOT MODIFY BY HAND.

      ${iots ? "import * as t from 'io-ts'" : ""}

      ${ts ? this.generateStaticCode(schema) : ""}

      ${iots ? this.generateRuntimeCode(schema) : ""}
    `;
  }

  private generateStaticCode(schema: Schema): string {
    const staticCode = t.printStatic(
      toIR(schema, schema.getContent(), this.schemaSet, "getStaticName"),
    );
    return [
      ...schema.getSubschemas().map((s) => {
        return this.generateStaticCode(s);
      }),
      ...schema.getReferences().map((ref) => {
        const depSchema = ref.isLocal()
          ? schema.lookup(ref.val())
          : this.schemaSet.lookup(ref.val());
        return `import { ${depSchema.getStaticName()} } from '${resolveImport(
          schema.getDirname(),
          depSchema.getFilename(),
        )}'`;
      }),
      staticCode.startsWith("Array")
        ? `export type ${schema.getStaticName()} = ${staticCode}`
        : `export interface ${schema.getStaticName()} ${staticCode}`,
    ].join("\n");
  }

  private generateRuntimeCode(schema: Schema): string {
    const runtimeCode = t.printRuntime(
      toIR(schema, schema.getContent(), this.schemaSet, "getRuntimeName"),
    );
    return [
      ...schema.getSubschemas().map((s) => {
        return this.generateRuntimeCode(s);
      }),
      ...schema.getReferences().map((ref) => {
        const depSchema = ref.isLocal()
          ? schema.lookup(ref.val())
          : this.schemaSet.lookup(ref.val());
        return `import { ${depSchema.getRuntimeName()} } from '${resolveImport(
          schema.getDirname(),
          depSchema.getFilename(),
        )}'`;
      }),
      `export const ${schema.getRuntimeName()} = ${runtimeCode}`,
    ].join("\n\n");
  }
}
