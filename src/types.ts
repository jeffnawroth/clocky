export type Pause = {
  start: string; // ISO
  end?: string; // ISO
};

export type Session = {
  id: string;
  start: string; // ISO
  end?: string; // ISO
  pauses?: Pause[];
};
