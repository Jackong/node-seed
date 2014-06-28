/**
 * Created by daisy on 14-6-4.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var TagLook = require('./tag/Look');
var TagFollower = require('./tag/Follower');
var UserFollower = require('./user/Follower');
var UserFeed = require('./user/Feed');

var logger = require('../common/logger');

var Favorite = Schema({
    _id: String,//aspect
    wants: [{ type: Schema.Types.ObjectId }],//User:想要的人
    wantCount: {type: Number, default: 0},
    tips: [{type: Schema.Types.ObjectId}],//Tip:提示信息
    tipCount: {type: Number, default: 0}
});

var Look = Schema({
    _id: String,//文件MD5
    publisher: Schema.Types.ObjectId,//User:发布者
    image: String,//图片
    isValid: {type: Boolean, default: true},
    tags: [{type: String, lowercase: true, trim: true}],//标签
    description: String,//描述
    created: {type: Date, default: Date.now},
    updated: {type: Date, default: Date.now},
    likes: [{ type: Schema.Types.ObjectId }],//User:喜欢的人
    favorites: [Favorite]//Favorite:心仪的东西
});

Look.static('appendTagsAndFavorites', function (lookId, tags, favorites, callback) {
    return this.update(
        {
            _id: lookId
        },
        {
            $addToSet: {
                tags: {
                    $each: tags
                },
                favorites: {
                    $each: favorites
                }
            }
        },
        {
            upsert: true
        },
        callback
    );
});

Look.static('getTrend', function (start, num, callback) {
    if (start < 0 || num <= 0) {
        return callback(null, []);
    }
    this.aggregate(
        { $project: { likes: 1, publisher: 1, image: 1, tags: 1, description: 1, created: 1, favorites: 1}},
        { $unwind: '$likes' },
        { $group: {
            _id: '$_id',
/*            publisher: '$publisher',
            image: '$image',
            tags: '$tags',
            description: '$description',
            created: '$created',
            favorites: '$favorites',*/
            likeCount: { $sum: 1 }
        }},
        { $sort: {likeCount: -1, created: -1}},
        { $skip: start},
        { $limit: num},
        callback
    );
});


Look.static('gets', function (lookIds, callback) {
    this.find(
        {
            _id: {
                $in: lookIds
            }
        },
        {
            likes: 1,
            image: 1,
            tags: 1,
            description: 1,
            created: 1,
            favorites: 1
        },
        callback
    )
});

module.exports = mongoose.model('Look', Look);