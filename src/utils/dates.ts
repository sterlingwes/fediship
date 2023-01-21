import {intervalToDuration, isValid} from 'date-fns';

export const timeAgo = (priorDate: Date) => {
  const now = new Date();

  if (!isValid(priorDate)) {
    return '';
  }

  const interval = intervalToDuration({start: priorDate, end: now});
  if (interval.years) {
    return `${interval.years}y`;
  }
  if (interval.months) {
    return `${interval.months}mo`;
  }
  if (interval.days) {
    return `${interval.days}d`;
  }
  if (interval.hours) {
    return `${interval.hours}h`;
  }
  if (interval.minutes) {
    return `${interval.minutes}m`;
  }
  if (interval.seconds) {
    return `${interval.seconds}s`;
  }
  return '';
};
