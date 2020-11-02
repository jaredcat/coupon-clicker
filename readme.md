# Coupon Clicker

_Automatically click all those coupons!_

Currently supports:

* Vons.com
* Target.com

## Info

### Target.com

To maximize your discounts sign up for a [RedCard](https://goto.target.com/YP0PJ)\
This gives you **permanent 5%** off and there is a debit card option if you wanted to avoid any hassle of having another credit card.

* Target also only allows you to save 60 deals at a time.
  * Because of this, offers are sorted by "Trending".
* Due to issues with login, Target can't be used with headless mode yet.

## Instructions

### 1. Install node

1. Install nodejs: [nodejs.org](https://nodejs.org)
2. `npm install` in project directory

### 2. Credentials

1. copy `config.example.json` to `config.json`
2. edit `config.json` with your login emails and passwords
   1. Remove any site you don't want to use

### 3. Run

* Headless: `npm run start`
* With browser window: `npm run watch`
