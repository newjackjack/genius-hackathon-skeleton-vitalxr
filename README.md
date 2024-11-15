# Product Genius feed client app

Front-end app for [FacetChat](https://github.com/gamalon/facetchat) created via `React` and `Webpack` bundler.

### Setup

* Install Node
* `npm install`

### Run the client

* To run the local instance: `npm start`
* The configuration can be set under `/dist/index.html`:
```
  GAMALON.init({
    container: '#pg-app-wrapper',                // Feed mounting container selector
    organizationId: 'valuepetsupplies',          // Shop ID ("my-test-store.shopify.com" -> "my-test-store")
    serverURL: 'https://facetchat.dev.gmln.io',  // Backend server URL
    serverBehavior: { use_cards: true },         // Server behavior flags
    analytics: { disableAll: true },             // Analytics configuration
  });
```
[Type defenitions](https://github.com/gamalon/genius-hackathon-skeleton/blob/main/client/src/entities.js#L981-L1122) for the front-end configuration object

### Building the client bundle
To build the production bundle run: `npm run build:prod`, this will create a `facet-chat.js` in the `/dist` folder.
