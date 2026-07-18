import { formatDistanceToNow, differenceInDays, isAfter } from "date-fns";

export function formatDeadline(deadline) {
  if (!deadline) return "No deadline";
  const d = new Date(deadline);
  if (isAfter(new Date(), d)) return "Ended";
  return formatDistanceToNow(d, { addSuffix: true });
}

export function isUrgent(deadline) {
  if (!deadline) return false;
  const d = new Date(deadline);
  const days = differenceInDays(d, new Date());
  return days >= 0 && days <= 3;
}

export function daysRemaining(deadline) {
  if (!deadline) return 0;
  const d = new Date(deadline);
  return Math.max(0, differenceInDays(d, new Date()));
}