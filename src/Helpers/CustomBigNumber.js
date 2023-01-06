import { BigNumber } from 'bignumber.js';
class CustomBigNumber {
  constructor(configs = { DECIMAL_PLACES: 5 }) {
    BigNumber.config(configs);
  }

  getInstance() {
    return BigNumber;
  }
}

export default CustomBigNumber;
