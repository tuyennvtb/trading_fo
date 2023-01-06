import { default as fetch } from '../../Core/fetch/graph.fetch';
import { setRuntimeVariable } from './runtime';
/* eslint-disable import/prefer-default-export, new-cap */
import {
  SWAP_GET_LIST_COINS,
  SWAP_GET_LIST_COINS_SUCCESS,
  SWAP_GET_LIST_COINS_FAIL,
  SWAP_GET_HISTORY,
  SWAP_GET_HISTORY_FAIL,
  SWAP_GET_HISTORY_SUCCESS,
  SWAP_ESTIMATE,
  SWAP_ESTIMATE_SUCCESS,
  SWAP_ESTIMATE_FAIL,
  SWAP_ESTIMATE_RESET
} from '../constants';

export const getSWAPListCoins = (socket) => async (dispatch, getState) => {
  dispatch({
    type: SWAP_GET_LIST_COINS,
  });
  let err = '';

  const query = `
  query getSWAPListCoins {
    apiListCoinsToSwap {
      id
      from_coin_code
      from_coin_id
      from_token_address
      from_token_price
      to_coin_id
      to_coin_code
      to_token_address
      to_token_price
      pair_address
      cex_system
      reserve_eth
      swap_fee
      minimum_output
      minimum_swap_amount_in_eth
      }
    }
  `;

  try {
    // call webservice
    var result = await fetch({ query })
      .then((res) => {
        return res.data.apiListCoinsToSwap;
      })
      .catch((err) => {
        throw new Error(err.message);
      });
    // dispatch result
    if (result && result.length) {
      dispatch({
        type: SWAP_GET_LIST_COINS_SUCCESS,
        data: result,
      });

      socket.on('message', data => {
        if (data.area === 'swap_coin' && data.type === 'list_coin') {
          dispatch({
            type: SWAP_GET_LIST_COINS_SUCCESS,
            data: data.data
          });
        }

        socket.on('connect_error', error => {
          socket.close();
          console.log(`Error connect is close. Error ${error}`);
        });
      });
    } else {
      err = 'The internet connection is down, please try later.';
      dispatch({
        type: SWAP_GET_LIST_COINS_FAIL,
      });
    }
  } catch (error) {
    dispatch({
      type: SWAP_GET_LIST_COINS_FAIL,
    });
    err = error.message;
  }
  return err;
};

export const confirmSwap = (object) => async (dispatch, getState) => {
  dispatch({
    type: SWAP_GET_LIST_COINS,
  });
  let err = '';

  const query = `
  mutation confirmSwap ($transaction_id: String!){
    apiRequestToSwap (transaction_id: $transaction_id){
      success
      error_code
      data {
        transaction_id
      }
    }
  }
`;

  try {
    const variables = {
      transaction_id: object.transaction_id
    };

    var result = await fetch({ query, variables })
      .then((res) => {
        return res.data.apiRequestToSwap;
      })
      .catch((err) => {
        throw new Error(err.message);
      });

    // dispatch result
    if (result) {
      if (result.success) {
        // do some stuff 

      } else {
        err = result.error_code;
      }

    } else {
      err = 'The internet connection is down, please try later.';
    }
  } catch (error) {
    err = error.message;
  }
  return err;
};

export const getSwapHistory = () => async (dispatch, getState) => {
  dispatch({
    type: SWAP_GET_HISTORY,
  });
  let err = '';

  const query = `
  query getSwapHistory {
    apiSwapHistory {
      transaction_id
      from_coin
      to_coin
      from_amount
      final_delivered_amount
      estimate_receive_amount
      tx_id
      status
      created_at
    }
  }
`;

  try {
    // call webservice
    var result = await fetch({ query })
      .then((res) => {
        return res.data.apiSwapHistory;
      })
      .catch((err) => {
        throw new Error(err.message);
      });
    // dispatch result
    if (result && result.length) {
      dispatch({
        type: SWAP_GET_HISTORY_SUCCESS,
        data: result,
      });
    } else {
      err = 'The internet connection is down, please try later.';
      dispatch({
        type: SWAP_GET_HISTORY_FAIL,
      });
    }
  } catch (error) {
    dispatch({
      type: SWAP_GET_HISTORY_FAIL,
    });
    err = error.message;
  }
  return err;
}

export const estimateSwap = (object) => async (dispatch, getState) => {
  dispatch({
    type: SWAP_ESTIMATE,
  });
  let err = '';

  const query = `
  mutation estimateSwap ($from_coin: String!, $to_coin: String!, $from_amount: Float!, 
  $cex_system: String!, $minimum_output: Float!, $to_address: String!,$pair_address: String!, $swap_fee: Float!){
    apiEstimateSwap (from_coin: $from_coin, to_coin: $to_coin, from_amount: $from_amount,
    cex_system: $cex_system,minimum_output: $minimum_output,to_address: $to_address,pair_address: $pair_address, swap_fee: $swap_fee){
      success
      error_code
      data {
        transaction_id
        min_receive_amount
        max_recieve_amount
      }
    }
  }
`;

  try {
    const variables = {
      from_coin: object.from_coin,
      from_amount: object.from_amount,
      to_coin: object.to_coin,
      to_address: object.to_address,
      cex_system: object.cex_system,
      minimum_output: object.minimum_output,
      pair_address: object.pair_address,
      swap_fee: object.swap_fee
    };

    var result = await fetch({ query, variables })
      .then((res) => {
        return res.data.apiEstimateSwap;
      })
      .catch((err) => {
        throw new Error(err.message);
      });

    // dispatch result
    if (result) {
      if (result.success) {
        // do some stuff 
        dispatch({
          type: SWAP_ESTIMATE_SUCCESS,
          data: {
            status: true,
            dataConfirm: result.data
          }
        });
      } else {
        err = result.error_code;
      }

    } else {
      err = 'The internet connection is down, please try later.';
    }
  } catch (error) {
    dispatch({
      type: SWAP_ESTIMATE_FAIL,
    });
    err = error.message;
  }
  return err;
};


export const resetEstimateSwap = () => async (dispatch, getState) => {
  dispatch({
    type: SWAP_ESTIMATE_RESET
  });
}