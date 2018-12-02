import * as t from "io-ts-codegen";
import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import { Schema } from "./Schema";
import { isDefined } from "./utils";

interface ILookup {
  lookup(ref: string): Schema;
}

function byPropertyName(required: string[]): { [key: string]: true } {
  const map: { [key: string]: true } = {};
  required.forEach((k) => {
    map[k] = true;
  });
  return map;
}

function toInterfaceCombinator(
  root: Schema,
  schema: JSONSchema7,
  lookup: ILookup,
  referenceType: "getStaticName" | "getRuntimeName",
): t.InterfaceCombinator {
  const required = byPropertyName(schema.required || []);
  return t.interfaceCombinator(
    Object.keys(schema.properties!)
      .map((key) => {
        const subschema = schema.properties![key];
        if (typeof subschema === "boolean") {
          return t.property(key, t.anyType);
        }
        return t.property(
          key,
          toIR(root, subschema, lookup, referenceType),
          !required.hasOwnProperty(key),
        );
      })
      .filter(isDefined),
  );
}

export function toIR(
  root: Schema,
  schema: JSONSchema7Definition,
  lookup: ILookup,
  referenceType: "getStaticName" | "getRuntimeName",
): t.TypeReference {
  if (schema === false) {
    return t.undefinedType;
  }

  if (schema === true) {
    return t.anyType;
  }

  if (!schema.type && schema.$ref) {
    const ref = schema.$ref;
    const depSchema = ref.startsWith("#")
      ? root.lookup(ref)
      : lookup.lookup(ref);
    return t.identifier(depSchema[referenceType]());
  }

  switch (schema.type) {
    case "null":
      return t.nullType;
    case "string":
      return t.stringType;
    case "integer":
    case "number":
      return t.numberType;
    case "boolean":
      return t.booleanType;
    case "array":
      if (!schema.items) {
        return t.anyArrayType;
      }

      if (schema.items instanceof Array) {
        return t.anyArrayType;
      }

      return t.arrayCombinator(toIR(root, schema.items, lookup, referenceType));
    case "object":
      if (!schema.properties) {
        return t.anyType;
      }
      return toInterfaceCombinator(root, schema, lookup, referenceType);
    default:
      throw new Error("Unexpected schema");
  }
}
