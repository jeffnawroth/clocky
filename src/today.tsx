import { List, ActionPanel, Action, Icon } from "@raycast/api";
import { useEffect, useMemo, useState } from "react";
import { getSessions, getTargetConfig, getVacationDays } from "./storage";
import { dayKey, formatDelta, formatTime, getDaySummary, msToClock } from "./utils";
import { Session } from "./types";

export default function Command() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [targetHours, setTargetHours] = useState(8);
  const [vacationDays, setVacationDays] = useState<string[]>([]);
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      const [all, target, vacations] = await Promise.all([getSessions(), getTargetConfig(), getVacationDays()]);
      if (!mounted) return;
      setSessions(all);
      setTargetHours(target.targetHours);
      setVacationDays(vacations);
    };
    refresh();
    const refreshTimer = setInterval(refresh, 15000);
    const tick = setInterval(() => setNow(new Date()), 1000);
    return () => {
      mounted = false;
      clearInterval(refreshTimer);
      clearInterval(tick);
    };
  }, []);

  const nowIso = now.toISOString();
  const { slices, totals } = useMemo(() => getDaySummary(sessions, now, nowIso), [sessions, now, nowIso]);
  const isVacation = vacationDays.includes(dayKey(now));
  const targetMs = isVacation ? 0 : targetHours * 3600 * 1000;
  const delta = totals.net - targetMs;

  return (
    <List>
      <List.Section
        title={`Today - ${msToClock(totals.net)} net`}
        subtitle={`Work ${msToClock(totals.work)} | Breaks ${msToClock(totals.breaks)} | Delta ${formatDelta(delta)}${
          isVacation ? " | Vacation" : ""
        }`}
      >
        {slices.map((slice) => {
          const session = slice.session;
          const startLabel = formatTime(session.start);
          const endLabel = session.end ? formatTime(session.end) : "Now";
          const title = `${startLabel} - ${endLabel}`;
          const subtitle = `${msToClock(slice.net)} net | ${msToClock(slice.breaks)} breaks`;
          const accessories = session.end ? [] : [{ text: "Active" }];
          return (
            <List.Item
              key={session.id}
              icon={Icon.Clock}
              title={title}
              subtitle={subtitle}
              accessories={accessories}
              actions={
                <ActionPanel>
                  <Action.CopyToClipboard title="Copy Start" content={session.start} />
                  {session.end ? <Action.CopyToClipboard title="Copy End" content={session.end} /> : null}
                </ActionPanel>
              }
            />
          );
        })}
      </List.Section>
    </List>
  );
}
