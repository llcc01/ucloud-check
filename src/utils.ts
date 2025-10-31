export const base64Decode = (d: string) => {
  const data = atob(d);
  const decoder = new TextDecoder();
  return decoder.decode(
    new Uint8Array([...data].map((char) => char.charCodeAt(0)))
  );
};