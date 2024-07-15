function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
export function createGsiName(
  tableName: string,
  primaryKey: string,
  sortKey: string,
) {
  return `${tableName}By${capitalizeFirstLetter(
    primaryKey,
  )}${capitalizeFirstLetter(sortKey)}`;
}
