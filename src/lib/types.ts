export interface ScheduleBlock {
  id: string;
  title: string;
  /** 24h "HH:mm" */
  startTime: string;
  /** 24h "HH:mm" */
  endTime: string;
}

export interface Goal {
  id: string;
  text: string;
  done: boolean;
}

export interface AppData {
  schedule: ScheduleBlock[];
  goals: Goal[];
  studyGoalMinutes: number;
  studyMinutesToday: number;
  streak: number;
  /** YYYY-MM-DD of the day this data currently represents */
  currentDay: string;
  /** block ids already notified today, so we don't repeat */
  notifiedBlockIds: string[];
}
