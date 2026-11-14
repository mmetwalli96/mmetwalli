export type IncidentHistoryRow = {
  id: number;
  incident: string;
  interruption: string;
  occurrence_time: string;
  description: string;
  resolution_date: string | null;
  status: string;
};

export type ProgressTrackerRow = {
  id: number;
  incident: string;
  event_time: string;
  event_description: string;
  uri: string;
};

export type Tables = {
  incident_history: IncidentHistoryRow[];
  progress_tracker: ProgressTrackerRow[];
};

export type TableName = keyof Tables;

export type ConnectionStatus = 'off' | 'connecting' | 'live' | 'reconnecting' | 'closed';
 
type TableOperation = 'INSERT' | 'UPDATE' | 'DELETE';
 
export type ChangeEvent = { operation: TableOperation; id: number; row?: Record<string, unknown> };

export type RecentChanges = Record<string, 'INSERT' | 'UPDATE'>;

export type TableChange = {
  operation: TableOperation;
  id: number;
  row?: Record<string, unknown>;
};

export type LogEntry = {
  id: number;
  action: string;
  ok: boolean;
  message: string;
  time: Date;
};