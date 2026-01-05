export type PersistedSection = any; // loosely typed to avoid cross-file coupling

export interface CustomScript {
  id: string;
  companyId: string;
  companyName?: string;
  type: string;
  description: string;
  activeVersion: string;
  status: "Ativo" | "Inativo";
  lastModified: string;
  versions: Array<{
    version: string;
    state: "Rascunho" | "Publicada" | "Ativa";
    date: string;
    notes: string;
  }>;
}

const base = "/api/mock-db";

export async function loadSections(scriptId: string, version: string) {
  try {
    const res = await fetch(
      `${base}/structure?scriptId=${encodeURIComponent(
        scriptId
      )}&version=${encodeURIComponent(version)}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.sections ?? []) as PersistedSection[];
  } catch {
    return [];
  }
}

export async function saveSections(
  scriptId: string,
  version: string,
  sections: PersistedSection[]
) {
  await fetch(`${base}/structure`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scriptId, version, sections }),
  });
}

export async function listScripts(): Promise<CustomScript[]> {
  const res = await fetch(`${base}/scripts`);
  if (!res.ok) return [];
  const data = await res.json();
  return (data?.scripts ?? []) as CustomScript[];
}

export async function getScript(
  scriptId: string
): Promise<CustomScript | null> {
  const res = await fetch(`${base}/scripts/${encodeURIComponent(scriptId)}`);
  if (!res.ok) return null;
  return (await res.json()) as CustomScript;
}

export async function createScript(payload: {
  companyId: string;
  type: string;
  description?: string;
}): Promise<CustomScript | null> {
  const res = await fetch(`${base}/scripts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return null;
  return (await res.json()) as CustomScript;
}

export async function deleteScript(scriptId: string): Promise<boolean> {
  const res = await fetch(`${base}/scripts/${encodeURIComponent(scriptId)}`, {
    method: "DELETE",
  });
  if (!res.ok) return false;
  try {
    const data = await res.json();
    return !!data?.ok;
  } catch {
    return true; // accept 204-like responses
  }
}
