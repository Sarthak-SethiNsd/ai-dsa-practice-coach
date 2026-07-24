const COOLDOWN_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface CooldownCheckResult {
  canUpdate: boolean;
  remainingMs: number;
  formattedRemainingTime: string;
  nextAvailableTimeFormatted: string;
}

/**
 * Checks whether recommendation settings can be updated based on the 24-hour cooldown rule.
 * @param lastUpdateIso - ISO string of the last update timestamp
 */
export function checkRecommendationSettingsCooldown(lastUpdateIso?: string): CooldownCheckResult {
  if (!lastUpdateIso) {
    return {
      canUpdate: true,
      remainingMs: 0,
      formattedRemainingTime: "",
      nextAvailableTimeFormatted: ""
    };
  }

  const lastUpdate = new Date(lastUpdateIso).getTime();
  if (isNaN(lastUpdate)) {
    return {
      canUpdate: true,
      remainingMs: 0,
      formattedRemainingTime: "",
      nextAvailableTimeFormatted: ""
    };
  }

  const elapsed = Date.now() - lastUpdate;
  if (elapsed >= COOLDOWN_DURATION_MS) {
    return {
      canUpdate: true,
      remainingMs: 0,
      formattedRemainingTime: "",
      nextAvailableTimeFormatted: ""
    };
  }

  const remainingMs = COOLDOWN_DURATION_MS - elapsed;
  const hours = Math.floor(remainingMs / (1000 * 60 * 60));
  const minutes = Math.ceil((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

  const nextAvailableDate = new Date(lastUpdate + COOLDOWN_DURATION_MS);
  const nextAvailableTimeFormatted = nextAvailableDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  const formattedRemainingTime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return {
    canUpdate: false,
    remainingMs,
    formattedRemainingTime,
    nextAvailableTimeFormatted
  };
}
