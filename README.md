# Product Genius feed client app

Front-end app for [FacetChat](https://github.com/gamalon/facetchat) created via `React` and `Webpack` bundler.

### Setup

* Install Node
* `npm install`

### Run the client

* To run the local instance: `npm start`
* The configuration for your project can be set under `/dist/index.html`:
```
  GAMALON.init({
    organizationId: '######',                    // The Hackathon project identifier
    access_token: '######',                      // Hackathon basic auth username
  });
```
[Type defenitions](https://github.com/gamalon/genius-hackathon-skeleton/blob/main/client/src/entities.js#L981-L1122) for the front-end configuration object

### Setting the styling

The styling can be set multiple ways. We can either modify the [AppVariables.scss](https://github.com/gamalon/genius-hackathon-skeleton/blob/main/client/src/AppVariables.scss) file directly to update the styling defaults, or we can use the settings object [`design.settings.global`](https://github.com/gamalon/genius-hackathon-skeleton/blob/main/client/src/entities.js#L1014) where you set the CSS string that will override the defaults defined in the AppVariables.css.

### Building the client bundle
To build the production bundle run: `npm run build:prod`, this will create a `facet-chat.js` in the `/dist` folder.
