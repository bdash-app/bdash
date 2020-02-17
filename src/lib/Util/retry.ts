export default async function retry(fn: (done: () => void) => void): Promise<void> {
  let i = 0;
  let completed = false;

  const done = (): void => {
    completed = true;
  };

  // eslint-disable-next-line no-constant-condition
  while (true) {
    await fn(done);
    if (completed) return;

    i++;
    let interval = 0;
    if (i >= 5) {
      interval = 2000;
    } else {
      interval = i * i * 100;
    }

    await wait(interval);
  }
}

function wait(interval: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, interval);
  });
}
