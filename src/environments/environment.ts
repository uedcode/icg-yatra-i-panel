export const environment = {
  production: false,
  dummyData: false,

  baseApi: 'http://localhost:8084/yatra-i/',
  api: 'http://localhost:8084/yatra-i/webapi/',
  fileUrl: 'http://localhost:8084/yatra-i/',

  // baseApi: 'http://119.42.158.216:8111/yatra-i/',
  // api: 'http://119.42.158.216:8111/yatra-i/webapi/',
  // fileUrl: 'http://119.42.158.216:8111/yatra-i/',

  // baseApi: 'https://testing.uedeveloper.com/yatra-i-pilotage/',
  // api: 'https://testing.uedeveloper.com/yatra-i-pilotage/webapi/',
  // fileUrl: 'https://testing.uedeveloper.com/',

  // baseApi: 'https://api.pilotage.in/',
  // api: 'https://api.pilotage.in/webapi/',
  // fileUrl: 'https://api.pilotage.in/',

  baseHref: '/app/',
  ipChecker: 'https://whatismyip.monstrkart.com/index.php',
  // ipChecker : "https://test.aptimyst.com/whatismyip/index.php",
  recaptcha: {
    isEnabled: false,
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
  },
  esignConfig: {
    authUrl: 'https://authenticate.sandbox.emudhra.com',
    gatewayStorageKey: 'gateway',
    redirectStorageKey: 'esignRedirectPath',
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
