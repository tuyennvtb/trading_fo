/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import Router from 'universal-router';
import { redirect } from './Core/config';
import { transformString } from './Helpers/utils';

// The list of all application routes where each route contains a URL path string (pattern),
// the list of components to load asynchronously (chunks), data requirements (GraphQL query),
// and a render() function which shapes the result to be passed into the top-level (App) component.
// For more information visit https://github.com/kriasoft/universal-router
const routes = [
  {
    path: '/',
    template: 'home',
    components: () => [import(/* webpackChunkName: 'home' */ './Home')],
    render: ([Home]) => {
      return {
        title:
          'Sàn Giao Dịch Bitcoin, Ethereum, Ripple, Altcoin, Tiền Điện Tử, Tiền Ảo - Bitmoon.net',
        description:
          'Sàn giao dịch bitmoon.net cung cấp giải pháp mua bán BTC, ETH, XRP, DOGE, LTC, ZEC, DASH, tiền điện tử, tiền ảo uy tín và an toàn nhất tại Việt Nam.',
        body: <Home />,
      };
    },
  },
  {
    path: '/register',
    template: 'minimize',
    components: () => [import(/* webpackChunkName: 'start' */ './Register')],
    role: 'guest',
    redirect: redirect.authenticated,
    render: ([Register]) => ({
      title: 'Register',
      body: <Register />,
    }),
  },
  {
    path: '/user/active/:activationCode',
    template: 'minimize',
    components: () => [
      import(/* webpackChunkName: 'start' */ './ActivateAccount'),
    ],
    role: 'guest',
    redirect: redirect.noneAuthenticated,
    render: ([ActivateAccount], data) => ({
      title: 'Activate Account',
      body: <ActivateAccount activationCode={data.activationCode.trim()} />,
    }),
  },
  {
    path:
      '/user/withdraw/:action/:transactionId/:userId/:coinId/:amount/:ciphertext',
    template: 'minimize',
    components: () => [
      import(/* webpackChunkName: 'start' */ './RequestWithdrawAction'),
    ],
    // role: 'guest',
    // redirect: redirect.noneAuthenticated,
    render: ([RequestWithdrawAction], data) => ({
      title: 'RequestWithdrawAction',
      body: (
        <RequestWithdrawAction
          action={data.action.trim().toUpperCase()}
          transaction_id={data.transactionId}
          userId={data.userId}
          coinId={data.coinId}
          amount={data.amount}
          ciphertext={data.ciphertext}
        />
      ),
    }),
  },
  {
    path: '/user/ip-whitelisting/:userId/:ip',
    template: 'minimize',
    components: () => [
      import(/* webpackChunkName: 'start' */ './AddIPWhitelist'),
    ],
    role: 'guest',
    redirect: redirect.noneAuthenticated,
    render: ([AddIPWhitelist], data) => ({
      title: 'AddIPWhitelist Account',
      body: <AddIPWhitelist userId={data.userId.trim()} ip={data.ip.trim()} />,
    }),
  },
  {
    path: '/login',
    template: 'minimize',
    components: () => [import(/* webpackChunkName: 'start' */ './Login')],
    role: 'guest',
    redirect: redirect.authenticated,
    render: ([Login]) => {
      return {
        title: 'Login',
        body: <Login />,
      };
    },
  },
  {
    path: '/quen-mat-khau',
    template: 'minimize',
    components: () => [
      import(/* webpackChunkName: 'start' */ './ForgotPassword'),
    ],
    role: 'guest',
    redirect: redirect.authenticated,
    render: ([ForgotPassword]) => {
      return {
        title: 'Forgot Password',
        body: <ForgotPassword />,
      };
    },
  },
  {
    path: '/dat-lai-mat-khau',
    template: 'minimize',
    components: () => [
      import(/* webpackChunkName: 'start' */ './ResetPassword'),
    ],
    role: 'guest',
    redirect: redirect.authenticated,
    render: ([ResetPassword]) => {
      return {
        title: 'Reset Password',
        body: <ResetPassword />,
      };
    },
  },
  {
    path: '/dat-lai-mat-khau/:activationCode',
    template: 'minimize',
    components: () => [
      import(/* webpackChunkName: 'start' */ './ResetPassword'),
    ],
    role: 'guest',
    redirect: redirect.authenticated,
    render: ([ResetPassword], data = '') => {
      return {
        title: 'Reset Password',
        body: <ResetPassword activationCode={data.activationCode.trim()} />,
      };
    },
  },
  {
    path: '/change-password',
    components: () => [
      import(/* webpackChunkName: 'start' */ './ChangePassword'),
    ],
    role: 'member',
    redirect: redirect.authenticated,
    render: ([ChangePassword]) => {
      return {
        title: 'Change Password',
        body: <ChangePassword />,
      };
    },
  },
  {
    path: '/wallet/:coinID?',
    role: 'member',
    redirect: redirect.noneAuthenticated,
    components: () => [import(/* webpackChunkName: 'start' */ './Wallet')],
    render: ([Wallet], data) => {
      return {
        title: 'Wallet',
        body: <Wallet coinID={data.coinID} />,
      };
    },
  },
  {
    path: '/referral',
    components: () => [import(/* webpackChunkName: 'start' */ './Referral')],
    role: 'member',
    redirect: redirect.noneAuthenticated,
    render: ([Referral]) => ({
      title: 'Referral',
      body: <Referral />,
    }),
  },
  {
    path: '/wallet-detail/:coinCode',
    role: 'member',
    redirect: redirect.noneAuthenticated,
    components: () => [
      import(/* webpackChunkName: 'start' */ './WalletDetail'),
    ],
    render: ([WalletDetail], data) => {
      return {
        title: 'Wallet Detail',
        body: <WalletDetail coin={data.coinCode} />,
      };
    },
  },
  {
    path: '/profile',
    components: () => [import(/* webpackChunkName: 'start' */ './Profile')],
    role: 'member',
    redirect: redirect.noneAuthenticated,
    render: ([Profile]) => {
      return {
        title: 'Profile',
        body: <Profile />,
      };
    },
  },
  {
    path: '/cash/:type?',
    components: () => [import(/* webpackChunkName: 'start' */ './Cash')],
    role: 'member',
    redirect: redirect.noneAuthenticated,
    render: ([Cash], data) => {
      return {
        title: 'Cash',
        body: <Cash type={data.type} />,
      };
    },
  },
  {
    path: '/coin-deposit/:coinID',
    components: () => [import(/* webpackChunkName: 'start' */ './CoinDeposit')],
    role: 'member',
    redirect: redirect.noneAuthenticated,
    render: ([CoinDeposit], data) => {
      return {
        title: 'CoinDeposit',
        body: <CoinDeposit coinID={data.coinID} />,
      };
    },
  },
  {
    path: '/verify-account',
    components: () => [
      import(/* webpackChunkName: 'start' */ './VerifyAccount'),
    ],
    role: 'member',
    redirect: redirect.noneAuthenticated,
    render: ([VerifyAccount]) => {
      return {
        title: 'Verify Account',
        body: <VerifyAccount />,
      };
    },
  },
  {
    path: '/trade-history',
    components: () => [
      import(/* webpackChunkName: 'start' */ './TradeHistory'),
    ],
    role: 'member',
    redirect: redirect.noneAuthenticated,
    render: ([TradeHistory]) => {
      return {
        title: 'Trade History',
        body: <TradeHistory />,
      };
    },
  },
  {
    path: '/xep-hang-giao-dich/:coin_id',
    components: () => [
      import(/* webpackChunkName: 'start' */ './TradingScoreBoard'),
    ],
    render: ([TradingScoreBoard], data) => {
      return {
        title: 'Trading Score Board ',
        body: <TradingScoreBoard coin_id={data.coin_id} />,
      };
    },
  },
  {
    path: '/mua-ban',
    components: () => [import(/* webpackChunkName: 'start' */ './CoinsInfo')],
    render: ([CoinsInfo]) => {
      return {
        title: 'Exchanger',
        body: <CoinsInfo />,
      };
    },
  },
  {
    path: '/mua-ban/:coin_id',
    template: 'fullWidthPage',
    components: () => [import(/* webpackChunkName: 'start' */ './Exchange')],
    render: ([Exchange], data) => {
      const displayName = transformString(data.coin_id);

      const titleFormattedMessage = {
        id: 'app.exchange.coin.title',
        values: {
          displayName: displayName,
        },
      };

      const descriptionFormattedMessage = {
        id: 'app.exchange.coin.description',
        values: {
          displayName: displayName,
        },
      };

      const keywordFormattedMessage = {
        id: 'app.exchange.coin.keywords',
        values: {
          displayName: displayName,
        },
      };
      return {
        title: titleFormattedMessage,
        description: descriptionFormattedMessage,
        keywords: keywordFormattedMessage,
        body: <Exchange coin_id={data.coin_id} />,
      };
    },
  },
  {
    path: '/bieu-do-gia/:coin_id',
    template: 'fullWidthPage',
    components: () => [
      import(/* webpackChunkName: 'start' */ './Chart/FullPageChart'),
    ],
    render: ([FullPageChart], data) => {
      const displayName = transformString(data.coin_id);

      const titleFormattedMessage = {
        id: 'app.exchange.coin.title',
        values: {
          displayName: displayName,
        },
      };

      const descriptionFormattedMessage = {
        id: 'app.exchange.coin.description',
        values: {
          displayName: displayName,
        },
      };

      const keywordFormattedMessage = {
        id: 'app.exchange.coin.keywords',
        values: {
          displayName: displayName,
        },
      };
      return {
        title: titleFormattedMessage,
        description: descriptionFormattedMessage,
        keywords: keywordFormattedMessage,
        body: <FullPageChart coin_id={data.coin_id} />,
      };
    },
  },
  {
    path: '/mua-ban-nhanh/:coin_id',
    template: 'fullWidthPage',
    components: () => [
      import(/* webpackChunkName: 'start' */ './Exchange/SimpleExchange.js'),
    ],
    render: ([SimpleExchange], data) => {
      const displayName = transformString(data.coin_id);

      const titleFormattedMessage = {
        id: 'app.exchange.coin.title',
        values: {
          displayName: displayName,
        },
      };

      const descriptionFormattedMessage = {
        id: 'app.exchange.coin.description',
        values: {
          displayName: displayName,
        },
      };

      const keywordFormattedMessage = {
        id: 'app.exchange.coin.keywords',
        values: {
          displayName: displayName,
        },
      };
      return {
        title: titleFormattedMessage,
        description: descriptionFormattedMessage,
        keywords: keywordFormattedMessage,
        body: <SimpleExchange coin_id={data.coin_id} />,
      };
    },
  },
  {
    path: '/coin/:coin_id',
    components: () => [import(/* webpackChunkName: 'start' */ './Coin')],
    template: 'blog',
    render: ([Coin], data) => {
      const displayName = transformString(data.coin_id);

      const titleFormattedMessage = {
        id: 'app.coin.title',
        values: {
          displayName: displayName,
        },
      };

      const descriptionFormattedMessage = {
        id: 'app.coin.description',
        values: {
          displayName: displayName,
        },
      };

      const keywordFormattedMessage = {
        id: 'app.coin.keywords',
        values: {
          displayName: displayName,
        },
      };
      return {
        title: titleFormattedMessage,
        description: descriptionFormattedMessage,
        keywords: keywordFormattedMessage,
        body: <Coin coin_id={data.coin_id} />,
      };
    },
  },
  {
    path: '/security',
    components: () => [
      import(/* webpackChunkName: 'start' */ './GoogleAuthenticator'),
    ],
    role: 'member',
    redirect: redirect.noneAuthenticated,
    render: ([GoogleAuth]) => {
      return {
        title: 'Google Authenticator',
        body: <GoogleAuth />,
      };
    },
  },
  {
    path: '/security/google_auth',
    components: () => [
      import(/* webpackChunkName: 'start' */ './Forms/GoogleAuthScanForm'),
    ],
    role: 'member',
    redirect: redirect.noneAuthenticated,
    render: ([GoogleAuthScanForm]) => {
      return {
        title: 'Google Scan',
        body: <GoogleAuthScanForm />,
      };
    },
  },
  {
    path: '/security/handle/:isEnable',
    components: () => [
      import(
        /* webpackChunkName: 'start' */ './GoogleAuthenticator/GoogleHandler'
      ),
    ],
    role: 'member',
    redirect: redirect.noneAuthenticated,
    render: ([GoogleAuthHandleForm], data) => {
      return {
        title: 'Google Handler',
        body: <GoogleAuthHandleForm isEnable={data.isEnable} />,
      };
    },
  },
  {
    path: '/transactions',
    components: () => [
      import(/* webpackChunkName: 'start' */ './Transactions'),
    ],
    role: 'member',
    redirect: redirect.noneAuthenticated,
    render: ([Transactions]) => {
      return {
        title: 'Transactions',
        body: <Transactions />,
      };
    },
  },
  {
    path: '/about-us',
    components: () => [import(/* webpackChunkName: 'start' */ './About')],
    template: 'blog',
    render: ([About]) => {
      return {
        title: 'About Us',
        body: <About />,
      };
    },
  },
  {
    path: '/terms-of-use',
    components: () => [import(/* webpackChunkName: 'start' */ './Terms')],
    template: 'blog',
    render: ([Terms]) => {
      return {
        title: 'Terms Of Use',
        body: <Terms />,
      };
    },
  },
  {
    path: '/faqs',
    components: () => [import(/* webpackChunkName: 'start' */ './FAQ')],
    template: 'blog',
    render: ([FAQ]) => {
      return {
        title: 'FAQs',
        body: <FAQ />,
      };
    },
  },
  {
    path: '/privacy',
    components: () => [import(/* webpackChunkName: 'start' */ './Privacy')],
    template: 'blog',
    render: ([Privacy]) => {
      return {
        title: 'Privacy',
        body: <Privacy />,
      };
    },
  },
  {
    path: '/risk',
    components: () => [import(/* webpackChunkName: 'start' */ './Risk')],
    template: 'blog',
    render: ([Risk]) => {
      return {
        title: 'Risk',
        body: <Risk />,
      };
    },
  },
  {
    path: '/transaction-fee',
    components: () => [import(/* webpackChunkName: 'start' */ './Fee')],
    template: 'blog',
    render: ([Fee]) => {
      return {
        title: 'Service Fees',
        body: <Fee />,
      };
    },
  },
  {
    path: '/contact-us',
    components: () => [import(/* webpackChunkName: 'start' */ './Contact')],
    template: 'blog',
    render: ([Contact]) => {
      return {
        title: 'Contact Us',
        body: <Contact />,
      };
    },
  },
  {
    path: '/price-table-widget/:user_id?/:size?',
    components: () => [
      import(
        /* webpackChunkName: 'start' */ './Widget/CoinPriceTableWidget.js'
      ),
    ],
    template: 'blank',
    render: ([CoinPriceTableWidget], data) => {
      return {
        title: 'Price Table Widget',
        body: <CoinPriceTableWidget user_id={data.user_id} size={data.size} />,
      };
    },
  },
  {
    path: '/calculator-widget/:coin_id/:user_id?',
    components: () => [
      import(/* webpackChunkName: 'start' */ './Widget/CalculatorWidget.js'),
    ],
    template: 'blank',
    render: ([CalculatorWidget], data) => {
      return {
        title: 'Price Table Widget',
        body: (
          <CalculatorWidget coin_id={data.coin_id} user_id={data.user_id} />
        ),
      };
    },
  },
  {
    path: '/referral-widget/:user_id/:size',
    components: () => [
      import(/* webpackChunkName: 'start' */ './Widget/ReferralWidget.js'),
    ],
    template: 'blank',
    render: ([ReferralWidget], data) => {
      return {
        title: 'Referral Widget',
        body: <ReferralWidget user_id={data.user_id} size={data.size} />,
      };
    },
  },
  {
    path: '/register/referer/:ref_id',
    components: () => [import(/* webpackChunkName: 'start' */ './Home')],
    template: 'home',
    render: ([Home], data) => {
      return {
        title:
          'Sàn Giao Dịch Bitcoin, Ethereum, Ripple, Altcoin, Tiền Điện Tử, Tiền Ảo - Bitmoon.net',
        description:
          'Sàn giao dịch bitmoon.net cung cấp giải pháp mua bán BTC, ETH, XRP, DOGE, LTC, ZEC, DASH, tiền điện tử, tiền ảo uy tín và an toàn nhất tại Việt Nam.',
        body: <Home ref_id={data.ref_id} />,
      };
    },
  },
  {
    path: '/fee-exchange',
    components: () => [import(/* webpackChunkName: 'start' */ './FeeExchange')],
    template: 'blog',
    render: ([FeeExchange]) => {
      return {
        title: 'Fee Exchange',
        body: <FeeExchange />,
      };
    },
  },
  {
    path: '/swap',
    components: () => [import(/* webpackChunkName: 'start' */ './Swap')],
    template: 'blog',
    render: ([Swap]) => {
      return {
        title: 'Swap',
        body: <Swap />,
      };
    },
  },
  {
    path: '/swap/:from_coin/:to_coin',
    components: () => [import(/* webpackChunkName: 'start' */ './Swap/SwapCoin')],
    template: 'blog',
    render: ([SwapCoin], data) => {
      return {
        title: 'Swap Coin',
        body: <SwapCoin from_coin={data.from_coin} to_coin={data.to_coin}/>,
      };
    },
  },
  {
    path: '*',
    components: () => [import(/* webpackChunkName: 'start' */ './ErrorPage')],
    template: 'blog',
    render: ([ErrorPage]) => ({
      title: 'Error',
      body: <ErrorPage />,
    }),
  },
];

function resolveRoute(content, params) {
  const { route, user, next } = content;

  // Skip routes that have no .render() method
  if (!route.render) return next();

  // Check user has approriate role to visit the page
  const role = 'role' in route ? route.role : '';
  const currentRole = user.authenticated ? 'member' : 'guest';
  if (role && role !== currentRole) {
    return { redirect: route.redirect };
  }

  // Shape the result to be passed into the top-level React component (App)
  return {
    params,
    template: route.template || 'normal', // [home, minimize, blog, normal]
    variables:
      typeof route.variables === 'function'
        ? route.variables(params)
        : { ...params },
    components:
      typeof route.components === 'function'
        ? Promise.all(
          route.components().map((promise) => promise.then((x) => x.default))
        ).then((components) => (route.components = components))
        : route.components,
    render: route.render,
    currentRole,
  };
}

export default new Router(routes, { resolveRoute });
