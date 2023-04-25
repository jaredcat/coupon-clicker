# Coupon Clicker

_Automatically click all those coupons!_

Currently supports:

- Vons.com
- Target.com

Add custom sites configs and create a new site in `sites` folder!
Submit your own site file in a PR!

## Info

### Vons.com

Vons has a captcha page when when signing in. You will need to sign up for [2captcha](https://2captcha.com/?from=17648232) and add a few dollars to your account and add your token to your `config.json`.
Each login will use about $0.01 so you don't need much.

### Target.com

To maximize your discounts sign up for a [RedCard](https://goto.target.com/YP0PJ)\
This gives you **permanent 5%** (plus another 5% on your birthday) off. I recommend getting the debit card to avoid the hassle of having another credit card.

- Target also only allows you to save 60 deals at a time.
  - Because of this, offers are sorted by "Trending".

## Instructions

### 1. Install node

1. Install nodejs: [nodejs.org](https://nodejs.org)
2. `npm install --production` in project directory

### 2. Credentials

1. copy `config.example.json` to `config.json`
2. edit `config.json` with your login emails and passwords
   1. Remove any site you don't want to use

### 3. Run

- `npm run start`
