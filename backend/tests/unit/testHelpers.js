const createChain = (result = { data: null, error: null }) => {
  const chain = {};

  chain.select = jest.fn(() => chain);
  chain.eq = jest.fn(() => chain);
  chain.neq = jest.fn(() => chain);
  chain.in = jest.fn(() => chain);
  chain.order = jest.fn(() => chain);
  chain.range = jest.fn(() => chain);
  chain.or = jest.fn(() => chain);
  chain.gte = jest.fn(() => chain);
  chain.lte = jest.fn(() => chain);
  chain.like = jest.fn(() => chain);
  chain.ilike = jest.fn(() => chain);
  chain.limit = jest.fn(() => chain);
  chain.insert = jest.fn(() => chain);
  chain.upsert = jest.fn(() => chain);
  chain.update = jest.fn(() => chain);
  chain.delete = jest.fn(() => chain);
  chain.single = jest.fn(async () => result);
  chain.maybeSingle = jest.fn(async () => result);
  chain.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject);

  return chain;
};

module.exports = {
  createChain,
};
