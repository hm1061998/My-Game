export type SessionProgress = {
  caseId: string;
  caseVersion: string;
  status: string;
  revision: number;
  mapId: string;
  checkpointId: string;
  encounterCleared: boolean;
  encounterFailures: number;
  assistanceUsed: boolean;
  expiresAtUtc: string;
};

async function readProgress(response: Response): Promise<SessionProgress> {
  if (!response.ok)
    throw new Error(`Session request failed (${response.status})`);
  const value: unknown = await response.json();
  if (!value || typeof value !== "object")
    throw new Error("Invalid session response");
  const session = value as Record<string, unknown>;
  if (
    typeof session.caseId !== "string" ||
    typeof session.caseVersion !== "string" ||
    typeof session.status !== "string" ||
    typeof session.revision !== "number" ||
    typeof session.mapId !== "string" ||
    typeof session.checkpointId !== "string" ||
    typeof session.encounterCleared !== "boolean" ||
    typeof session.encounterFailures !== "number" ||
    typeof session.assistanceUsed !== "boolean" ||
    typeof session.expiresAtUtc !== "string"
  )
    throw new Error("Invalid session response");
  return session as SessionProgress;
}

export async function resumeSession(): Promise<SessionProgress | null> {
  const response = await fetch("/api/v1/session");
  if (response.status === 401) return null;
  return readProgress(response);
}

export async function startSession(): Promise<SessionProgress> {
  return readProgress(
    await fetch("/api/v1/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Office-Request": "1" },
      body: JSON.stringify({ caseId: "swapped-report" }),
    }),
  );
}

export async function saveMeetingCheckpoint(
  revision: number,
): Promise<SessionProgress> {
  return readProgress(
    await fetch("/api/v1/session/checkpoint", {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Office-Request": "1" },
      body: JSON.stringify({ checkpointId: "meeting-zone", revision }),
    }),
  );
}

export async function recordEncounter(outcome: "detected" | "cleared", assistanceUsed: boolean,
  submissionId: string, revision: number): Promise<SessionProgress> {
  return readProgress(await fetch("/api/v1/session/encounter", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Office-Request": "1" },
    body: JSON.stringify({ outcome, assistanceUsed, submissionId, revision }),
  }));
}

