import * as React from "react";
import { DailyPracticeSession } from "@/services/types";
import { sessionArchiveStorage } from "@/services/sessionArchiveStorage";
import { useAppContext } from "@/context/AppContext";

/**
 * Custom hook for reading the session archive.
 *
 * Loads all persisted DailyPracticeSession objects from localStorage on mount
 * and re-fetches whenever the live dailySession in AppContext changes (so the
 * current day's session is always reflected in the history view immediately).
 */
export function useSessionArchive(): {
  sessions: DailyPracticeSession[];
  loading: boolean;
  refresh: () => void;
} {
  const { dailySession } = useAppContext();
  const [sessions, setSessions] = React.useState<DailyPracticeSession[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [tick, setTick] = React.useState(0);

  const refresh = React.useCallback(() => {
    setTick(prev => prev + 1);
  }, []);

  React.useEffect(() => {
    let isMounted = true;

    sessionArchiveStorage.loadAll().then(data => {
      if (isMounted) {
        setSessions(data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  // Re-fetch when dailySession changes (e.g. user marks a problem done)
  // or when refresh() is called externally.
  }, [dailySession, tick]);

  return { sessions, loading, refresh };
}
