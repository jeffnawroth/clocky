import { Detail, ActionPanel, Action, showToast, Toast } from "@raycast/api";
import { getSessions, saveSessions } from "./storage";
import { getActiveSession, isoNow } from "./utils";

export default function Command() {
  const start = async () => {
    const sessions = await getSessions();
    const active = getActiveSession(sessions);
    if (active) {
      await showToast(Toast.Style.Failure, "Already clocked in");
      return;
    }
    const id =
      globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
    const session = { id, start: isoNow(), pauses: [] };
    sessions.push(session);
    await saveSessions(sessions);
    await showToast(Toast.Style.Success, "Clocked in");
  };

  return (
    <Detail
      markdown={`# Clock In

Start a new work session.`}
      actions={
        <ActionPanel>
          <Action title="Start Session" onAction={start} />
        </ActionPanel>
      }
    />
  );
}
