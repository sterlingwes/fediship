import {groupReplies, resolveTerminatingTootIds} from './thread.util';
import threadContext from './thread.fixture.json';

describe('groupReplies', () => {
  describe('fixture with nested replies on author reply', () => {
    it('should only show main toot replies when that is the parent id', () => {
      const grouped = groupReplies(
        // @ts-expect-error testing subset of type
        threadContext.descendants,
        '108243893500830435',
      );

      const replyToots: string[] = [];
      Object.keys(grouped.replyList).forEach(replyId => {
        const {status, hasReplies} = grouped.replyList[replyId];
        const toot = status.content;
        replyToots.push(toot);

        if (!hasReplies) {
          replyToots.push('---');
        }
      });

      expect(replyToots).toMatchInlineSnapshot(`
        Array [
          "Author self-reply",
          "@author reply 1",
          "---",
          "@author reply 2",
          "---",
          "@author reply to main post",
          "---",
          "@author another reply to main post",
          "reply to the reply to main post",
          "---",
        ]
      `);
    });
  });
});

describe('resolveTerminatingTootIds', () => {
  it('should return the ids that end the reply chain', () => {
    const ids = resolveTerminatingTootIds(
      // @ts-expect-error testing subset of type
      threadContext.descendants,
      '108243893500830435',
    );

    expect(ids).toEqual([
      '108246418403442299',
      '108273968481741974',
      '108273952271365334',
      '108274750128667900',
    ]);
  });
});
