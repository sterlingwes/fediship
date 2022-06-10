import {TStatus, TStatusContext} from '../../types';

interface Reply {
  hasReplies?: boolean;
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
    grouped.replyList[child.id] = {status: child, hasReplies: false};

    if (child.in_reply_to_id === parentStatusId) {
      grouped.topReplyIds.push(child.id);
    } else {
      const parent = grouped.replyList[child.in_reply_to_id ?? ''];
      if (parent) {
        parent.hasReplies = true;
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
  Object.keys(grouped.replyList).forEach(replyId => {
    const {hasReplies} = grouped.replyList[replyId];
    if (!hasReplies) {
      terminating.push(replyId);
    }
  });

  return terminating;
};
