const url = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

export async function supabaseRequest(path: string, init?: RequestInit) {
  if (!url || !secretKey) throw new Error("Supabase 환경변수가 설정되지 않았어요.");
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: secretKey,
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(await response.text() || `Supabase 요청 실패 (${response.status})`);
  return response.status === 204 ? null : response.json();
}
