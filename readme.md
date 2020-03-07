# Vons Coupon Clicker

_Clicks all the coupons for Vons.com & Target.com automatically!_

## Info

### Target.com

To maximise your discounts sign up for a [RedCard](https://goto.target.com/YP0PJ)\
This gives you permanent 5% off and there is a debit card if you wanted to avoid any downsides of a credit card.

- Target also only allows you to save 60 deals at a time.
  - Because of this, offers are sorted "Trending" by trending.
- Due to issues with login, Target can't be used with headless mode yet.

## Instructions

### 1. Install node

1. Install nodejs: [nodejs.org](https://nodejs.org)
2. `npm install` in project directory

### 2. Cridentials

1. copy `config.example.json` to `config.json`
2. edit `config.json` with your login emails and passwords
   1. Remove any site you don't want to use

### 3. Run

- Headless: `npm run start`
- With browser window: `npm run watch`
