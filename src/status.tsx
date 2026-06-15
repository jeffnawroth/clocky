import { useEffect, useState } from "react";
import { MenuBarExtra, Icon } from "@raycast/api";
import { getSessions, getTargetConfig, getVacationDays } from "./storage";
import {
  dayKey,
  formatDelta,
  formatTimeAt,
  getActiveSession,
  getDaySummary,
  getEstimatedWorkEnd,
  isSessionPaused,
  msToClock,
} from "./utils";
import { Session } from "./types";

export default function Command() {
  const [now, setNow] = useState(new Date());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [targetHours, setTargetHours] = useState(8);
  const [vacationDays, setVacationDays] = useState<string[]>([]);

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
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => {
      mounted = false;
      clearInterval(refreshTimer);
      clearInterval(t);
    };
  }, []);

  const nowIso = now.toISOString();
  const active = getActiveSession(sessions);
  const status = active ? (isSessionPaused(active) ? "paused" : "working") : "off";
  const { totals } = getDaySummary(sessions, now, nowIso);
  const netMs = totals.net;
  const icon = status === "working" ? Icon.Play : status === "paused" ? Icon.Pause : Icon.Circle;
  const isVacation = vacationDays.includes(dayKey(now));
  const targetMs = isVacation ? 0 : targetHours * 3600 * 1000;
  const workEnd = status === "working" ? getEstimatedWorkEnd(now, netMs, targetMs, isVacation) : null;
  const title =
    status === "working"
      ? msToClock(netMs)
      : status === "paused"
        ? `Paused ${msToClock(netMs)}`
        : isVacation
          ? "Vacation"
          : "Off";
  const delta = netMs - targetMs;

  return (
    <MenuBarExtra icon={icon} title={title} tooltip={`Delta: ${formatDelta(delta)}`}>
      <MenuBarExtra.Item title={`Status: ${status}`} />
      <MenuBarExtra.Item title={`Live: ${title}`} />
      {workEnd ? <MenuBarExtra.Item title={`Estimated work end: ${formatTimeAt(workEnd)}`} /> : null}
      {isVacation ? <MenuBarExtra.Item title="Vacation Day" /> : null}
      <MenuBarExtra.Item title={`Delta: ${formatDelta(delta)}`} />
    </MenuBarExtra>
  );
}
