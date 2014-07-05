/**
 * Created by daisy on 14-7-5.
 */
define(['angular', 'angularResource'], function (angular) {
    'use strict';

    return angular.module('iWomen.services', ['ngResource'])
        .factory('Account', function ($resource) {
            return $resource('api/accounts/:account', {}, {
                signUp: {
                    method: 'POST'
                },
                signIn: {
                    method: 'GET'
                },
                checkLogin: {
                    method: 'GET', url: 'api/accounts/check'
                },
                updatePassword: {
                    method: 'PUT'
                },
                forgot: {
                    method: 'GET', url: 'api/accounts/forgot/:account'
                }
            })
        })
        .factory('Look', function ($resource) {
            return $resource('api/looks/:lookId', {}, {
                gets: {
                    method: 'GET', url: 'api/looks/:type'
                }
            })
        })
        .factory('LookCache', function ($cacheFactory, Look) {
            return {
                publish: function (lookId, image, description, favoriteId, tags, callback) {
                    Look.save({
                        lookId: lookId,
                        image: image,
                        description: description,
                        favoriteId: favoriteId,
                        tags: tags
                    }, function (res) {
                        if (res.code !== 0) {
                            return callback(null, null);
                        }
                        var cache = $cacheFactory.get('looks');
                        callback(cache.put(lookId, res.data.look));
                    });
                },
                gets: function (type, page, num, callabck) {
                    var cache = $cacheFactory.get('looks');
                    if (!cache) {
                        cache = $cacheFactory('looks');
                    }
                    Look.gets({type: type, page: page, num: num}, function (res) {
                        var looks = res.data.looks;
                        angular.forEach(looks, function(look, key) {
                            cache.put(look._id, look);
                        });
                        callabck(looks);
                    });
                },
                getById: function (lookId, callback) {
                    var cache = $cacheFactory.get('looks');
                    if (cache) {
                        var look = cache.get(lookId);
                        if (look) {
                            return callback(look);
                        }
                    }
                    cache = $cacheFactory('looks');
                    Look.get({lookId: lookId}, function (res) {
                        var look = res.data.look;
                        cache.put(lookId, look);
                        callback(look);
                    });
                },
                favorites: function (callback) {
                    var cache = $cacheFactory.get('favorites');
                    if (cache) {
                        return callback(cache.get('all'));
                    }
                    cache = $cacheFactory('favorites');
                    Look.gets({type: 'favorites'}, function (res) {
                        var favorites = res.data.favorites;
                        cache.put('all', favorites);
                        callback(favorites);
                    });
                }
            }
        });
});