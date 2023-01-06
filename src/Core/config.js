export const port = process.env.PORT || 4000;
export const host = process.env.WEBSITE_HOSTNAME || `localhost:${port}`;

export const APIEndPoint =
  process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000/graphql';
export const SocketIOHost =
  process.env.REACT_APP_SOCKET_HOST || 'ws://localhost:4000';
//'http://bitmoon.tienao365.com/';
console.log('SocketIOHost', SocketIOHost);
export const APIServices = {
  login: `${APIEndPoint}api/user/login`,
  loginWithGoogleAuth: `${APIEndPoint}api/user/loginwithgoogleauth`,
  getPriceDetail: `${APIEndPoint}api/market_price_list/{coin_code}`,
  register: `${APIEndPoint}api/user/register`,
  getProfile: `${APIEndPoint}api/user/profile`,
  logOut: `${APIEndPoint}api/user/logout`,
  forgotPassword: `${APIEndPoint}api/user/forgot-password`,
  resetPassword: `${APIEndPoint}api/user/reset-password`,
  updateProfile: `${APIEndPoint}api/user/profile/update`,
  changePassword: `${APIEndPoint}api/user/changepassword`,
  uploadImage: `${APIEndPoint}api/image/upload`,
  getWallets: `${APIEndPoint}api/wallet/list`,
  getDepositBankList: `${APIEndPoint}api/wallet/bank_list/deposit`,
  getWithdrawBankList: `${APIEndPoint}api/wallet/bank_list/withdraw`,
  bankWithdraw: `${APIEndPoint}api/wallet/bank_withdraw`,
  bankDeposit: `${APIEndPoint}api/wallet/bank_deposit`,
  walletDetail: `${APIEndPoint}api/wallet/detail/{coin_code}`,
  createWallet: `${APIEndPoint}api/wallet/create/{coin_code}`,
  sendBalance: `${APIEndPoint}api/wallet/send`,
  sendHistory: `${APIEndPoint}api/wallet/history/send`,
  depositHistory: `${APIEndPoint}api/wallet/history/deposit`,
  uploadVerifyImages: `${APIEndPoint}api/image/upload`,
  getVerifyImages: `${APIEndPoint}api/image/list`,
  getGoogleAuthCode: `${APIEndPoint}api/google2fa/general_code`,
  handleGoogleAuthCode: `${APIEndPoint}api/google2fa/handle`,
  activateAccount: `${APIEndPoint}api/user/active_user/{active_code}`,
  newsletterSubscribe: `${APIEndPoint}api/newsletter/subscribe`,
  verifyAccount: `${APIEndPoint}api/user/request_verify_account`,
  getCoinsInfo: `${APIEndPoint}api/market_price_list`,
};

export const redirect = {
  authenticated: `/profile`,
  noneAuthenticated: '/login',
  resetPassword: '/dat-lai-mat-khau',
  home: `/profile`,
  homepage: `/`,
  google_auth: '/security',
  default_exchange: '/mua-ban/bitcoin',
  exchange: '/mua-ban',
  simple_exchange: '/mua-ban-nhanh',
  verify_account: '/verify-account',
  security: '/security',
  full_chart: '/bieu-do-gia',
  swap: '/swap'
};

export const googleCaptcha = {
  siteKey: '6LcP4EwUAAAAAKsqM3fc4Y2EJVq3nnUq-XRVoiGo',
  secretKey: '6LcP4EwUAAAAAEuNKFpg_GP74RJT9NYHiGJ3hQtS',
};

export const googleCaptchaV3 = {
  siteKey: '6Lf0sZAUAAAAADnffheXDKIEgNITtCuNEVVwDwo9',
};

export const googleMap = {
  autoFillAddress: 'AIzaSyC-0Qxa82RHhgt1Mpig9fLLH9He3I67epY',
  embedMap: 'AIzaSyAtoyS2bskXCU4MwZVRoW9muXRjLLGmCEg',
};
