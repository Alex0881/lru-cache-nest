/**
 * Return a promise, which resolves after msAmount milliseconds
 * @param msAmount
 */
export function sleep(msAmount: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, msAmount);
  });
}
