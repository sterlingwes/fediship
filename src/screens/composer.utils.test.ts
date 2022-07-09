import {parseStatus} from './composer.utils';

describe('composer utils', () => {
  describe('parseStatus', () => {
    describe('with CW', () => {
      it('should split it from the main status', () => {
        const {cw, status} = parseStatus(`CW: Warning about what follows
I am not sure what to say here.

But it is, what it is.`);

        expect(cw).toEqual('Warning about what follows');
        expect(status).toEqual(
          'I am not sure what to say here.\n\nBut it is, what it is.',
        );
      });
    });
  });
});
