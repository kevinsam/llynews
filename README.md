# Cirrus Web Accelerator v2.0.0

**Application Name:** Cirrus Web Accelerator

**Application Description:** This is a Node Web Accelerator that allows project teams to get up and running with a Node project quicker then starting from scratch.

**Prefix:** CIRR_WEB_ACCELERATOR

**Author:** Nick Liffen

**Team:** Cirrus

**Information Classification:** Green

**Development Language:** Node

**Heroku Add-Ons:** New Relic APM, Papertrail

**ALM Record URL:** N/A

**WIKI:** This README.md file only goes over high level information on this project, for more detail please see this repository's [Wiki](https://github.com/EliLillyCo/CIRR_WEB_ACCELERATOR/wiki).

**Deploy to Heroku:** [![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)


---

**Install:**

1. Run `npm install`.
2. Run `npm install -g eslint`
3. Copy the `.env-sample` file to `.env` and add values to the empty keys. (Please read on to find out how to find these values)

---

**Running:**

1. Run `npm run build` in one terminal window.
2. Run `npm start` in another terminal window.

If you find any bugs or Issues with this web accelerator and you cannot find the answer in this README or the [Wiki](https://github.com/EliLillyCo/CIRR_WEB_ACCELERATOR/wiki) please log an [Issue](https://github.com/EliLillyCo/CIRR_WEB_ACCELERATOR/issues). If you think there is something important missing please open a Pull Request (See contributing section below).

---

**Deploying to Heroku:**

1. Press the Deploy to Heroku button found below. Once you clicked the deploy button you will have to enter some values.
2. Enter in the application name.
3. Enter what Region OR Private Space you would like the application to live in.
4. Enter in your environment variables. If you do not need authentication you only need to enter: NEW_RELIC_APP_NAME & set AUTH_REQUIRED to **false**. If you do need authentication you will need to enter in the following values: NEW_RELIC_APP_NAME, Set AUTH_REQUIRED to **true**, OPENID_NONCE, OPENID_CLIENT_ID & COOKIE_SECRET. Please see the description of each value for where to find this information.
5. Click the deploy button.
6. Your application will be in Heroku.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

For more information about Authentication please see the Authentication section below.

If you open the `Environment Variables` section within the `Settings` tab. You will notice Heroku has automatically added three variables; two for NEw Relic and one for Papertrail. Please copy these values to your local `.env` file.

---

**Heroku Continuous Integration:**

This repository comes with all the files needed to run Heroku Continuous Integration (CI), and three CI tests. Please enable Heroku CI in your pipeline. Please then add **two** values to the environment variables found in the `Settings` tab.

Please **remove** the space between the API_TOKEN. Once you remove the space you will have a valid API Token.


|       Key       | Value                                         |
|:---------------:|-----------------------------------------------|
| API_TOKEN       | 4dd6f93457aa6da79d     2be57f291c654b76b2c4f1 |
| GITHUB_USERNAME | lillyherokuciint                              |

The tests that this will run is:

1. Security Checks (Static Source Code Analysis)(Checkmark). This will output if you have any low, medium or high security faults in your application.
2. Coding Standards Checks (AirBnB Style Guide)(ESlint). This will compare your code to the AirBnB Style Guide. Please see the *coding standards* section below for more details.
3. Unit Testing Checks (Mocha). This will run unit tests against your application. The Development Team will need to add their own Unit Tests.

More information can be found on [LillyDev](https://lillydev.com/heroku/ci)).

---

**Authentication:**

This accelerator comes with authentication out of the box.

To get started, copy the following environment variables into your `.env` file:

**Note:** Changing these from their preset values will break authentication.

```
OPENID_RESP_TYPE=id_token
OPENID_SERV=https://federate-qa.xh1.lilly.com
OPENID_SCOPE=openid auth_web
OPENID_JWKS_URI=https://federate-qa.xh1.lilly.com/pf/JWKS
CALLBACK=/auth/ping/callback
```

There are also some environment variables that require your configuration:

1. `OPENID_NONCE` = A secure, high entropy key. You can create a value [here](http://randomkeygen.com/)
2. `OPENID_CLIENT_ID`= Your auth client id. this can be found by looking for your `BUSINESS AREA` here: https://cirr-heroku-auth-standards.herokuapp.com.
3. `COOKIE_SECRET`= A secure, high entropy key. You can create a value [here](http://randomkeygen.com/)
4. `DISABLE_AUTH_LOGS` = By default the Auth Flow will log entries to the console. Disable this
by setting this value to `false.`. The Default Value is `true`.
5. `AUTH_REQUIRED` = `true`

Your application **needs** to following the naming standards set out here: https://cirr-heroku-auth-standards.herokuapp.com. Your application will not authenticate otherwise and you will get an `invalid uri-redirect` message.

When `AUTH_REQUIRED` is set to **false** your application is going to have no authentication.

When you set `AUTH_REQUIRED` to **true** your application is going to try and authenticate with Ping. When a user visits your app, they will be redirected to single sign-on before being permitted access.

It is recommended to set `AUTH_REQUIRED` to `false` on your local machine.
It is recommended to set `AUTH_REQUIRED` to `true` in Heroku.

**Note:** Authentication only works on port `3000`. Please make sure you do not run authentication on any other port or you will get an error message of `invalid uri-redirect`

---

**Coding Standards:**

1. Make sure you have Eslint downloaded and installed on your IDE.
    1. Atom: [Linter](https://atom.io/packages/linter), [ESLint](https://atom.io/packages/linter-eslint)
    2. Sublime: [Linter](https://packagecontrol.io/packages/SublimeLinter), [ESlint](https://packagecontrol.io/packages/SublimeLinter-contrib-eslint)
    3. Other IDE's: [Linter](http://eslint.org)
2. Make sure you have EditorConfig downloaded and installed on your IDE:
    1. Atom: [EditorConfig](https://github.com/sindresorhus/atom-editorconfig#readme)
    2. Sublime: [EditorConfig](https://github.com/sindresorhus/editorconfig-sublime#readme)
    3. Other IDE's: [EditorConfig](http://editorconfig.org)

This project uses ESlint for JavaScript Coding Standards. The AirBnb Style Guide is used for this project. Please ensure that all code passes the coding checks before pushing code. Run `npm run lint` to find out if your code has passed or not.

This project also uses [EditorConfig](http://editorconfig.org) to set up our coding style across IDE's.

---

**Contributing:**

1. Clone the repository.
2. Read this README file.
3. Make some changes.
4. Once you're done with your changes send a pull request into the *develop* branch. (see naming details below).
5. Heroku will create a review application.
6. In the Pull Request, open the Review Application and make sure your changes are present and working.
7. Make sure Continuous Integration has passed (Green tick in Pull Request).
8. Wait for feedback.

When you open a pull request please follow these naming conventions:

1. `feature/featureName`
2. `enhancement/enhancementName`
3. `bug/bugName`
