export const formatPropertyReference = (id: string | number): string =>
  String(id).padStart(4, "0");
