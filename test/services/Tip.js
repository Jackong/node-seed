/**
 * Created by daisy on 14-7-6.
 */

var sinon = require('sinon');
var should = require('should');
var mongoose = require('mongoose');

var UserTip = require('../../model/user/Tip');
var Favorite = require('../../model/Favorite');
var Tip = require('../../model/Tip');
var TipService = require('../../services/Tip');

describe('TipService', function () {
    describe('.addTip()', function () {
        var lookId = 'look id';
        var favoriteId = 'shirt';
        var tip = new Tip({author: new mongoose.Types.ObjectId});

        it('should sync to user tips and the favorite after saving succeed', sinon.test(function (done) {
            this.stub(UserTip, 'putNewLook');
            this.stub(Favorite, 'putNewTip');
            this.stub(tip, 'save');
            TipService.addTip(lookId, favoriteId, tip, function (err, doc) {
                should.not.exist(err);
                should.exist(doc);
                tip.save.called.should.be.true;
                UserTip.putNewLook.called.should.be.true;
                Favorite.putNewTip.called.should.be.true;
                done();
            });
            tip.save.yield(null, new Tip({_id: new mongoose.Types.ObjectId}));
            UserTip.putNewLook.yield(null, null);
            Favorite.putNewTip.yield(null, null);
        }));

        it('should not sync to user and favorite when saving failed', sinon.test(function (done) {
            this.stub(UserTip, 'putNewLook');
            this.stub(Favorite, 'putNewTip');
            this.stub(tip, 'save');
            TipService.addTip(lookId, favoriteId, tip, function (err, doc) {
                should.exist(err);
                tip.save.called.should.be.true;
                UserTip.putNewLook.called.should.be.false;
                Favorite.putNewTip.called.should.be.false;
                done();
            });
            tip.save.yield('save failed', null);
        }))
    });
});