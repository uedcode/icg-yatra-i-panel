export const environment = {
  production: true,
  dummyData: false,

  baseApi: 'https://icg.net.in/p-api/',
  api: 'https://icg.net.in/p-api/webapi/',
  fileUrl: 'https://icg.net.in/p-api/',

  baseHref: '/',

  ipChecker: "https://whatismyip.monstrkart.com/index.php",
  recaptcha: {
    isEnabled: false,
    siteKey: '6LcWzLIkAAAAABYAhcISETEWai7sTdufc9nZQ6bW',
  },
  appConfig: {
    id: 'PILOTAGE',
    logo: 'assets/images/logo.png',
    favicon: 'assets/images/logo.png',
    name: 'ICG Pilotage',
    slogan: 'ICG Pilotage',
    buildNo: 'Version v1.1.0 Build 20251227_1000',
  },
};
//npm run start:prod
//ng build --prod
