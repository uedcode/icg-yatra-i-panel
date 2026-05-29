export const environment = {
  production: true,
  dummyData: false,

  baseApi: 'https://testing.uedeveloper.com/yatra-i-pilotage/',
  api: 'https://testing.uedeveloper.com/yatra-i-pilotage/webapi/',
  fileUrl: 'https://testing.uedeveloper.com/',
  baseHref: '/pilotage/',

  ipChecker: "https://whatismyip.monstrkart.com/index.php",
  recaptcha: {
    isEnabled: false,
    textCaptchaEnabled: true,
    siteKey: '6LcWzLIkAAAAABYAhcISETEWai7sTdufc9nZQ6bW',
  },
  authConfig: {
    basicClientAuth: 'Basic VVNFUl9DTElFTlRfQVBQOnBhc3N3b3Jk',
    storageKeys: {
      accessToken: 'yatraAccessToken',
      refreshToken: 'yatraRefreshToken',
      expiresIn: 'yatraExpiresIn',
      accessCount: 'yatraAccessCount',
      userDetails: 'yatraUserDetails',
      deviceId: 'yatraDeviceId',
      isDashboard: 'isDashboard',
    },
    moduleStorageKeys: {
      ADV: {
        accessToken: 'yatraAccessTokenAdv',
        refreshToken: 'yatraRefreshTokenAdv',
        expiresIn: 'yatraExpiresInAdv',
        accessCount: 'yatraAccessCountAdv',
        userDetails: 'yatraUserDetailsAdv',
        deviceId: 'yatraDeviceIdAdv',
      },
      CLM: {
        accessToken: 'yatraAccessTokenClm',
        refreshToken: 'yatraRefreshTokenClm',
        expiresIn: 'yatraExpiresInClm',
        accessCount: 'yatraAccessCountClm',
        userDetails: 'yatraUserDetailsClm',
        deviceId: 'yatraDeviceIdClm',
      },
    },
  },
  appConfig: {
    id: 'YATRA',
    logo: 'assets/images/logo.png',
    favicon: 'assets/images/logo.png',
    name: 'ICG Yatra',
    slogan: 'ICG Yatra',
    buildNo: 'Version v1.1.0 Build 20251227_1000',
  },
};
//npm run start:staging
//ng build --c staging
//ng build --c staging --base-href /pilotage/
