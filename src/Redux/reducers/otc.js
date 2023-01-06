/* eslint-disable import/prefer-default-export, new-cap */
import {
  OTC_GET_ORDER_BOOK,
  OTC_GET_ORDER_BOOK_FAIL,
  OTC_GET_ORDER_BOOK_SUCCESS,
  OTC_UPDATE_DATA_FROM_SOCKET,
  OTC_CREATE_TRANSACTION,
  OTC_CREATE_TRANSACTION_SUCCESS,
  OTC_CREATE_TRANSACTION_FAIL,
  OTC_BUYER_APPROVE_TRANSACTION,
  OTC_SELLER_APPROVE_TRANSACTION,
  OTC_BUYER_APPROVE_TRANSACTION_RESET,
  OTC_SELLER_APPROVE_TRANSACTION_RESET,
  OTC_CREATE_TRANSACTION_FOR_SELLER,
  OTC_CREATE_TRANSACTION_FOR_SELLER_RESET,
  OTC_SELLER_APPROVE_FOR_BUY_ORDER,
  OTC_GET_BANK_INFO,
  OTC_GET_BANK_INFO_SUCCESS,
  OTC_GET_BANK_INFO_FAIL,
} from '../constants';

const initializeState = {
  buyerApprovedData: {},
  buyerApproveSuccess: false,
  sellerApproveSuccess: false,
  sellerApprovedData: {},

  createTransactionForSellerSuccess: false,
  createTransactionForSellerData: {},

  sellerApproveForBuyOrderData: {},
  sellerApproveForBuyOrderSuccess: false,
  bankInfo: [],
};
const otc = (state = initializeState, action) => {
  switch (action.type) {
    case OTC_GET_ORDER_BOOK: {
      return {
        ...state,
      };
    }

    case OTC_GET_ORDER_BOOK_SUCCESS: {
      return {
        ...state,
        orderList: action.data,
      };
    }

    case OTC_GET_ORDER_BOOK_FAIL: {
      return {
        ...state,
      };
    }

    case OTC_UPDATE_DATA_FROM_SOCKET: {
      return {
        ...state,
        orderList: [action.data, ...state.orderList],
      };
    }

    case OTC_CREATE_TRANSACTION: {
      return {
        ...state,
      };
    }

    case OTC_CREATE_TRANSACTION_SUCCESS: {
      return {
        ...state,
        selectedTransaction: action.data,
      };
    }

    case OTC_CREATE_TRANSACTION_FAIL: {
      return {
        ...state,
      };
    }
    case OTC_BUYER_APPROVE_TRANSACTION: {
      return {
        ...state,
        buyerApprovedData: action.data,
        buyerApproveSuccess: true,
      };
    }
    case OTC_SELLER_APPROVE_TRANSACTION: {
      return {
        ...state,
        sellerApprovedData: action.data,
        sellerApproveSuccess: true,
      };
    }
    case OTC_SELLER_APPROVE_TRANSACTION_RESET: {
      return {
        ...state,
        sellerApproveSuccess: false,
      };
    }

    case OTC_BUYER_APPROVE_TRANSACTION_RESET: {
      return {
        ...state,
        buyerApproveSuccess: false,
      };
    }
    case OTC_CREATE_TRANSACTION_FOR_SELLER: {
      return {
        ...state,
        createTransactionForSellerSuccess: true,
        createTransactionForSellerData: action.data,
      };
    }
    case OTC_CREATE_TRANSACTION_FOR_SELLER_RESET: {
      return {
        ...state,
        createTransactionForSellerSuccess: false,
      };
    }
    case OTC_SELLER_APPROVE_FOR_BUY_ORDER: {
      return {
        ...state,
        sellerApproveForBuyOrderData: action.data,
        sellerApproveForBuyOrderSuccess: true,
      };
    }

    case OTC_GET_BANK_INFO_SUCCESS: {
      return {
        ...state,
        bankInfo: action.data,
      };
    }

    default:
      return state;
  }
};

export default otc;
