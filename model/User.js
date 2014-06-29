/**
 * Created by daisy on 14-6-4.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var async = require('async');

var User = Schema({
    account: {type: String, unique: true, lowercase: true, trim: true},
    password: String,
    nick: String,
    avatar: String,
    sex: {type: Boolean, default: true},
    birthday: Date,
    city: String,
    webSite: String,
    intro: String,
    points: {type: Number, default: 0},
    isValid: {type: Boolean, default: true},
    created: {type: Number, default: Date.now },
    updated: {type: Number, default: Date.now }
});

User.static('perfect', function (uids, callback) {
    if (uids.length <= 0) {
        return callback(null, []);
    }
    this.find(
        {
            _id: {
                $in: uids
            },
            isValid: true
        },
        {
            nick: 1,
            avatar: 1
        },
        {
            lean: true
        },
        function (err, users) {
            if (err) {
                return callback(null, []);
            }
            var userMap = {};
            async.each(users, function (user, callback) {
                userMap[user._id] = user;
                callback();
            }, function (err) {
                callback(err, userMap);
            });
        }
    );
});

module.exports = mongoose.model('User', User);
