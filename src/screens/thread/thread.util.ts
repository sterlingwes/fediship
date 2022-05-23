import {TStatus, TStatusContext} from '../../types';

interface Reply {
  next?: string | string[];
  status: TStatus;
}

interface GroupedReplies {
  topReplyIds: string[];
  replyList: Record<string, Reply>;
}

/**
 * returns groups of replies that replied to
 * the initial toot in the thread view
 * (does not include the initial toot)
 */
export const groupReplies = (
  descendants: TStatusContext['descendants'],
  parentStatusId: string,
) => {
  const grouped: GroupedReplies = {topReplyIds: [], replyList: {}};
  (descendants ?? []).forEach(child => {
    if (child.in_reply_to_id === parentStatusId) {
      grouped.topReplyIds.push(child.id);
      grouped.replyList[child.id] = {status: child};
    } else {
      grouped.replyList[child.id] = {status: child};
      const parent = grouped.replyList[child.in_reply_to_id ?? ''];
      if (parent) {
        if (typeof parent.next === 'string') {
          parent.next = [parent.next, child.id];
        } else if (Array.isArray(parent.next)) {
          parent.next.push(child.id);
        } else {
          parent.next = child.id;
        }
      }
    }
  });

  return grouped;
};

/**
 * ids for toots that mark the end of a reply chain
 */
export const resolveTerminatingTootIds = (
  descendants: TStatusContext['descendants'],
  parentStatusId: string,
): string[] => {
  const grouped = groupReplies(descendants, parentStatusId);
  const terminating: string[] = [];
  grouped.topReplyIds.forEach(topId => {
    const {next} = grouped.replyList[topId];
    if (Array.isArray(next)) {
      terminating.push(next[next.length - 1]);
    } else if (next) {
      terminating.push(next);
    } else {
      terminating.push(topId);
    }
  });

  return terminating;
};
