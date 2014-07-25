/**
 * Created by daisy on 14-6-25.
 */

var async = require('async');
var request = require('request');

var oauth = require('../common/config')('oauth');
var helper = require('../common/helper');
var logger = require('../common/logger');
var system = require('../common/config')('system');

var User = require('../model/User');
var Auth = require('../model/Auth');
var SettingService = require('./Setting');

User.onSave(SettingService.onUserSave);

module.exports = {
    MAX_AGE: 86400 * 1000 * 90,
    login: function (authId, uid, req, res) {
        res.cookie('uid', uid, { signed: true, httpOnly: true, maxAge: this.MAX_AGE, path: '/' })
        res.cookie('authId', authId, { signed: true, httpOnly: true, maxAge: this.MAX_AGE, path: '/' })
    },
    logout: function (req, res) {
        res.clearCookie('uid', { path: '/' });
        res.clearCookie('authId', { path: '/' });
    },
    getUid: function (req, res) {
        return req.signedCookies.uid;
    },
    sync: function (platform, authId, accessToken, name, expires, callback) {
        var now = helper.now();
        var uid = this.createUid(platform, authId);
        var self = this;
        async.parallel([
            function syncAuth(callback1) {
                Auth.createOrUpdate(authId, accessToken, platform, uid, now, expires, function (err, num) {
                    if (err || num !== 1) {
                        logger.error('create or update auth fail', authId, accessToken, uid, platform, num, err);
                        return callback('create or update auth fail');
                    }
                    callback(null, authId, uid);
                    callback1();
                });
            },
            function getUserInfo(callback) {
                self.getUserInfoFromPlatform(accessToken, function (err, response, body) {
                    var obj = null;
                    if (err || response.statusCode != 200 || body.error_code) {
                        logger.error('get user info from platform fail', authId, accessToken, name, platform, err, response, body);
                        obj = {
                            nick: name
                        };
                    }
                    obj = {
                        nick: body.username,
                        sex: (body.sex == 1 ? true : (body.sex == 2 ? false : null)),
                        avatar: body.headurl,
                        birthday: Date.parse(body.birthday),
                        city: body.city
                    };
                    User.createOrUpdate(uid, obj, function (err) {
                        if (err) {
                            logger.error('upsert user info fail', uid, obj);
                        }
                        callback(err);
                    });
                    if (body.is_verified == 1) {
                        logger.warn('finding one verified user', body);
                    }
                });
            }
        ], function (err, result) {

        });
    },
    createUid: function (platform, authId) {
        return platform + '' + authId;
    },
    getUserInfoFromPlatform: function (accessToken, callback) {
        request(
            {
                url: oauth.userInfoUrl + '?access_token=' + accessToken,
                json: true
            },
            callback
        );
    },
    getUserInfo: function (uid, callback) {
        if (!uid) {
            return callback('auth id or uid is valid');
        }
        User.getOne(uid, callback);
    }
};
