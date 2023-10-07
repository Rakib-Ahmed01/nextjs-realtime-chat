export const parseJSON = <T>(data: string | string[] | null): T =>
  JSON.parse(data as string);
