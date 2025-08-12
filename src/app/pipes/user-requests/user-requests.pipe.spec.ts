import { UserRequestsPipe } from './user-requests.pipe';

describe('UserRequestsPipe', () => {
  it('create an instance', () => {
    const pipe = new UserRequestsPipe();
    expect(pipe).toBeTruthy();
  });
});
