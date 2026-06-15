import { LocalStorage, getPreferenceValues } from "@raycast/api";
import { Session } from "./types";

const SESSIONS_KEY = "clocky.sessions";
const TARGET_KEY = "clocky.targetHours";
const VACATION_KEY = "clocky.vacationDays";

type TargetConfig = {
  targetHours: number;
  workDaysPerWeek: number;
};

function toNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

export async function getSessions(): Promise<Session[]> {
  const raw = await LocalStorage.getItem<string>(SESSIONS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Session[];
  } catch {
    return [];
  }
}

export async function saveSessions(sessions: Session[]) {
  await LocalStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export async function getTargetConfig(): Promise<TargetConfig> {
  // Preference name: targetWeeklyHours (number, weekly). We convert to daily target hours.
  try {
    const prefs = getPreferenceValues() as { targetWeeklyHours?: number | string; workDaysPerWeek?: number | string };
    const prefDays = toNumber(prefs?.workDaysPerWeek);
    const workDaysPerWeek = prefDays && prefDays > 0 ? prefDays : 5;
    const weeklyHours = toNumber(prefs?.targetWeeklyHours);
    if (weeklyHours && weeklyHours > 0) {
      return { targetHours: weeklyHours / workDaysPerWeek, workDaysPerWeek };
    }
    const raw = await LocalStorage.getItem<number>(TARGET_KEY);
    if (raw) return { targetHours: raw, workDaysPerWeek };
    return { targetHours: 8, workDaysPerWeek };
  } catch {
    const raw = await LocalStorage.getItem<number>(TARGET_KEY);
    if (raw) return { targetHours: raw, workDaysPerWeek: 5 };
    return { targetHours: 8, workDaysPerWeek: 5 };
  }
}

export async function getTargetHours(): Promise<number> {
  const config = await getTargetConfig();
  return config.targetHours;
}

export async function setTargetHours(hours: number) {
  await LocalStorage.setItem(TARGET_KEY, hours);
}

export async function getVacationDays(): Promise<string[]> {
  const raw = await LocalStorage.getItem<string>(VACATION_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export async function saveVacationDays(days: string[]) {
  await LocalStorage.setItem(VACATION_KEY, JSON.stringify(days));
}

export async function toggleVacationDay(dayKey: string): Promise<string[]> {
  const days = await getVacationDays();
  const next = new Set(days);
  if (next.has(dayKey)) {
    next.delete(dayKey);
  } else {
    next.add(dayKey);
  }
  const list = Array.from(next).sort();
  await saveVacationDays(list);
  return list;
}
