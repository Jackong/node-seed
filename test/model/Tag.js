/**
 * Created by daisy on 14-6-23.
 */
var should = require('should');
var mongoose = require('mongoose');
var async = require('async');

require('../../common/mongo');
var Tag = require('../../model/Tag');

describe('Tag', function () {
    describe('.putNewLook()', function () {
        var tags = null;
        var lookId = null;
        beforeEach(function () {
            tags = [];
            lookId = new mongoose.Types.ObjectId;
        });

        it('should be successful when only 1 tag', function (done) {
            tags.push('jack');
            Tag.putNewLook(tags, lookId, function (err) {
                should.not.exist(err);
                done();
            }); 
        });

        it('should successful when more than 1 tags', function (done) {
            tags.push('jack');
            tags.push('daisy');
            Tag.putNewLook(tags, lookId, function (err) {
                should.not.exist(err);
                done();
            });
        });

        it('should be failure with empty tags', function (done) {
            Tag.putNewLook(tags, lookId, function (err) {
                should.exist(err);
                done();
            })
        });

        afterEach(function () {
            Tag.remove({
                _id: {
                    $in: tags
                }
            }).exec();
        });
    });

    describe('.calLookCount()', function () {
        var tag1 = 'jack';
        var tag2 = 'daisy';
        before(function () {
            Tag.putNewLook([tag2], new mongoose.Types.ObjectId, function (err) {
                should.not.exist(err);
            })
        });

        it('should be 1 when only look be put', function (done) {
            async.waterfall([
                function (callback) {
                    Tag.putNewLook([tag1], new mongoose.Types.ObjectId, function (err) {
                        should.not.exist(err);
                        callback(null, 1);
                    })
                }
            ], function (err, count) {
                Tag.calLookCount(tag1, function (err, res) {
                    should.not.exist(err);
                    res[0].count.should.be.exactly(count);
                    done();
                })
            });
        });

        it('should be 2 when 2 look be put', function (done) {
            async.waterfall([
                function (callback) {
                    Tag.putNewLook([tag1], new mongoose.Types.ObjectId, function (err) {
                        should.not.exist(err);
                        callback(null, 1);
                    })
                }
            ], function (err, count) {
                Tag.calLookCount(tag1, function (err, res) {
                    should.not.exist(err);
                    res[0].count.should.be.exactly(count + 1);
                    done();
                })
            });
        });

        after(function () {
            Tag.remove({
                _id: {
                    $in: [tag1, tag2]
                }
            }).exec();
        })
    });
});