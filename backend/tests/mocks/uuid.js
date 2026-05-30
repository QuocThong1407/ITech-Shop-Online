let counter = 0;

const v4 = () => {
  counter += 1;
  return `test-uuid-${counter}`;
};

module.exports = { v4 };
