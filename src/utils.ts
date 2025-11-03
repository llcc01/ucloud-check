export const base64Decode = (d: string) => {
  const base64 = d.replace(/-/g, "+").replace(/_/g, "/");
  const data = atob(base64);
  const decoder = new TextDecoder();
  return decoder.decode(
    new Uint8Array([...data].map((char) => char.charCodeAt(0)))
  );
};