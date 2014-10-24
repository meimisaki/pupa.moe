pupa.moe
====

A light blog engine for myself

## Usage

* Install `Node.js>=0.8.0` & `redis>=2.4.0` on your server

* `sudo npm install bower -g`

* `git clone https://github.com/meimisaki/pupa.moe.git && cd pupa.moe && npm install`

* edit `lib/config.sample.js` and rename it to `lib/config.js`

* copy your `certificate.pem` and `private-key.pem` files to relative `ssl` folder(optional)

* `npm start`

## Todo

> .less file observation

> i18n

> full text search

> mobile browser compatibility(editor)

> better route implementation

> reduce duplicates of uploaded files(sha1 or md5)

> server process daemon

> post request rate limiter

> database transaction

## Done

> LRUCache

> html renderer

> sanitize comment html

> request logger

> search autocomplete

> https
