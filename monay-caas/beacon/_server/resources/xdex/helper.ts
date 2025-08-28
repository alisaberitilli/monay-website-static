export const getRandomNumber = (length: number) => {
  return Math.floor(Math.pow(10, length - 1) * (1 + Math.random() * 9));
};
