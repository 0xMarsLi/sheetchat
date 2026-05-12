export const hashPassword = async (roomId, password) => {
  const data = new TextEncoder().encode(`${roomId}:${password}`);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

export const isValidPassword = (pwd) => /^.{4,8}$/.test(pwd);
