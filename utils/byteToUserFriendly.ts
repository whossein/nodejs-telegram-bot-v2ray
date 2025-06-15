export function byteToUserFriendly(amount: number): string {
  let result = '';
  const oneMB = 1024 * 1024;
  const oneGB = 1024 * 1024 * 1024;

  if (amount < oneMB) {
    result = 'اتمام حجم بسته';
  } else if (amount < oneGB) {
    let num = amount / oneMB;
    result = num.toFixed(2) + ' مگابایت';
  } else {
    let num = amount / oneGB;
    result = num.toFixed(2) + ' گیگابایت';
  }

  return result;
}

export function byteToGigabyte(amount: number): number {
  let result: number = 0;
  const oneMB = 1024 * 1024;
  const oneGB = 1024 * 1024 * 1024;

  if (amount < oneMB) {
    result = 0;
  } else {
    let num = amount / oneGB;
    result = Number(num.toFixed(2));
  }

  return result;
}
