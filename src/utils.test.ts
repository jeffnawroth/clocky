import { describe, expect, it } from "vitest";
import {
  getDaySummary,
  getVisibleWeekDays,
  hasAnotherOpenSession,
  hasOverlappingPause,
  isPauseWithinSession,
} from "./utils";
import { Session } from "./types";

describe("getDaySummary", () => {
  it("extends an open session to the full day when nowIso is later than the day itself", () => {
    const day = new Date("2026-09-07T12:00:00");
    const sessionStart = new Date(day);
    sessionStart.setHours(8, 0, 0, 0);
    const sessions: Session[] = [{ id: "a", start: sessionStart.toISOString() }];
    const nowIso = new Date("2026-09-10T12:00:00").toISOString();
    const { totals } = getDaySummary(sessions, day, nowIso);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);
    expect(totals.work).toBe(dayEnd.getTime() - sessionStart.getTime());
  });
});

describe("getVisibleWeekDays", () => {
  const monday = new Date("2026-09-07T00:00:00");

  it("returns the first N days starting from weekStart", () => {
    const days = getVisibleWeekDays(monday, 3);
    expect(days.map((d) => d.getDate())).toEqual([7, 8, 9]);
  });

  it("returns all 7 days when workDaysPerWeek is 7", () => {
    const days = getVisibleWeekDays(monday, 7);
    expect(days).toHaveLength(7);
  });

  it("clamps workDaysPerWeek above 7 down to 7", () => {
    const days = getVisibleWeekDays(monday, 10);
    expect(days).toHaveLength(7);
  });

  it("clamps workDaysPerWeek below 1 up to 1", () => {
    const days = getVisibleWeekDays(monday, 0);
    expect(days).toHaveLength(1);
  });

  it("floors a fractional workDaysPerWeek", () => {
    const days = getVisibleWeekDays(monday, 5.9);
    expect(days).toHaveLength(5);
  });
});

describe("hasAnotherOpenSession", () => {
  const open = (id: string): Session => ({ id, start: "2026-09-07T08:00:00.000Z" });
  const closed = (id: string): Session => ({
    id,
    start: "2026-09-07T08:00:00.000Z",
    end: "2026-09-07T09:00:00.000Z",
  });

  it("returns false when no session is open", () => {
    expect(hasAnotherOpenSession([closed("a"), closed("b")])).toBe(false);
  });

  it("returns true when another session is open", () => {
    expect(hasAnotherOpenSession([open("a"), closed("b")], "b")).toBe(true);
  });

  it("excludes the session being edited from the check", () => {
    expect(hasAnotherOpenSession([open("a")], "a")).toBe(false);
  });
});

describe("isPauseWithinSession", () => {
  const sessionStart = new Date("2026-09-07T08:00:00.000Z");
  const sessionEnd = new Date("2026-09-07T16:00:00.000Z");

  it("accepts a pause fully inside a closed session", () => {
    expect(
      isPauseWithinSession(
        sessionStart,
        sessionEnd,
        new Date("2026-09-07T09:00:00.000Z"),
        new Date("2026-09-07T09:30:00.000Z"),
      ),
    ).toBe(true);
  });

  it("rejects a pause starting before the session start", () => {
    expect(isPauseWithinSession(sessionStart, sessionEnd, new Date("2026-09-07T07:00:00.000Z"), null)).toBe(false);
  });

  it("rejects a pause ending after the session end", () => {
    expect(
      isPauseWithinSession(
        sessionStart,
        sessionEnd,
        new Date("2026-09-07T15:00:00.000Z"),
        new Date("2026-09-07T17:00:00.000Z"),
      ),
    ).toBe(false);
  });

  it("accepts an open-ended pause when the session is still open", () => {
    expect(isPauseWithinSession(sessionStart, null, new Date("2026-09-07T09:00:00.000Z"), null)).toBe(true);
  });

  it("rejects an open pause starting after a closed session's end", () => {
    expect(isPauseWithinSession(sessionStart, sessionEnd, new Date("2026-09-07T17:00:00.000Z"), null)).toBe(false);
  });
});

describe("hasOverlappingPause", () => {
  const pauses = [
    { start: "2026-09-07T09:00:00.000Z", end: "2026-09-07T09:30:00.000Z" },
    { start: "2026-09-07T12:00:00.000Z", end: "2026-09-07T12:30:00.000Z" },
  ];

  it("returns false when the candidate does not overlap any pause", () => {
    expect(
      hasOverlappingPause(pauses, new Date("2026-09-07T10:00:00.000Z"), new Date("2026-09-07T10:30:00.000Z")),
    ).toBe(false);
  });

  it("returns true when the candidate overlaps an existing pause", () => {
    expect(
      hasOverlappingPause(pauses, new Date("2026-09-07T09:15:00.000Z"), new Date("2026-09-07T09:45:00.000Z")),
    ).toBe(true);
  });

  it("excludes the pause being edited from the check", () => {
    expect(
      hasOverlappingPause(pauses, new Date("2026-09-07T09:00:00.000Z"), new Date("2026-09-07T09:30:00.000Z"), 0),
    ).toBe(false);
  });

  it("treats an open pause as overlapping anything after it starts", () => {
    const openPauses = [{ start: "2026-09-07T09:00:00.000Z" }];
    expect(
      hasOverlappingPause(
        openPauses,
        new Date("2026-09-07T09:15:00.000Z"),
        new Date("2026-09-07T09:45:00.000Z"),
        undefined,
        "2026-09-07T10:00:00.000Z",
      ),
    ).toBe(true);
  });
});
