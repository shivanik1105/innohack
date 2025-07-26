// src/types/json.d.ts
declare module "*.json" {
  const value: Record<string, string>;
  export default value;
}
