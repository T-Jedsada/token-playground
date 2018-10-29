import * as maxTokenConfig from '../contracts/MaxToken.json';

export default {
  address: maxTokenConfig.networks['1234567'].address,
  decimal: 5,
  name: 'MaxToken',
  symbol: 'MT',
  icon: 'max.jpg',
  abi: maxTokenConfig.abi
};
