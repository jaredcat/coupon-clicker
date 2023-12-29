# Coupon Clicker

_Automatically click all those coupons!_

Currently supports:

- [Vons.com](src/sites/vons.com/README.md)
- [Target.com](src/sites/target.com/README.md)
- [Honeygain.com](src/sites/honeygain.com/README.md)
- ~~[CVS.com](src/sites/cvs.com/README.md)~~ (Not working: see site readme for more details)

Add custom sites configs and create a new site in [`sites`](src/sites/) folder!
Submit your own site file in a PR!

## Instructions

### 1. Install node

1. Install nodejs: [nodejs.org](https://nodejs.org)
2. `npm install --production` in project directory

### 2. Credentials

1. copy `config.example.js` to `config.js`
2. edit `config.js` with your login emails and passwords
   1. Remove any site you don't want to use

### 3. Run

- `npm run start`
