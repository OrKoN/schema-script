import * as path from "path";

export function isDefined<T>(id: T | undefined): id is T {
  return id !== undefined;
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.substr(1);
}

export function resolveImport(dir: string, file: string): string {
  const importPath = path.relative(dir, file);
  let importPathComponents = importPath.split(path.sep);
  if (importPathComponents.length === 1) {
    // relative imports must start with .
    importPathComponents = [".", ...importPathComponents];
  }
  return importPathComponents.join(path.sep);
}
