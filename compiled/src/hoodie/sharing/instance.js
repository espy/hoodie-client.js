// Generated by CoffeeScript 1.3.3
var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __slice = [].slice;

Hoodie.Sharing.Instance = (function() {

  function Instance(options) {
    if (options == null) {
      options = {};
    }
    this._sync = __bind(this._sync, this);

    this._toggle = __bind(this._toggle, this);

    this._remove = __bind(this._remove, this);

    this._add = __bind(this._add, this);

    this._is_my_shared_object_and_changed = __bind(this._is_my_shared_object_and_changed, this);

    this.sync = __bind(this.sync, this);

    this.get = __bind(this.get, this);

    this.set = __bind(this.set, this);

    this.hoodie = this.constructor.hoodie;
    this.anonymous = this.hoodie.account.username === void 0;
    this.set(options);
    this._assure_owner_uuid();
    if (this.anonymous) {
      this.hoodie = new Hoodie.Sharing.Hoodie(this.hoodie, this);
    }
  }

  Instance.prototype._memory = {};

  Instance.prototype.set = function(key, value) {
    var _key, _ref;
    if (typeof key === 'object') {
      for (_key in key) {
        value = key[_key];
        this[_key] = this._memory[_key] = value;
      }
    } else {
      this[key] = this._memory[key] = value;
    }
    if ((_ref = this.invitees) != null ? _ref.length : void 0) {
      this["private"] = this._memory["private"] = true;
    }
    return void 0;
  };

  Instance.prototype.get = function(key) {
    return this[key];
  };

  Instance.prototype.save = function(update, options) {
    var defer, _handle_update,
      _this = this;
    if (update == null) {
      update = {};
    }
    defer = this.hoodie.defer();
    if (update) {
      this.set(update);
    }
    _handle_update = function(properties, was_created) {
      _this._memory = {};
      $.extend(_this, properties);
      return defer.resolve(_this);
    };
    this.hoodie.store.update("$sharing", this.id, this._memory, options).then(_handle_update, defer.reject);
    return defer.promise();
  };

  Instance.prototype.add = function(objects) {
    return this.toggle(objects, true);
  };

  Instance.prototype.remove = function(objects) {
    return this.toggle(objects, false);
  };

  Instance.prototype.toggle = function(objects, do_add) {
    var update_method;
    if (!(this.hoodie.isPromise(objects) || $.isArray(objects))) {
      objects = [objects];
    }
    update_method = (function() {
      switch (do_add) {
        case true:
          return this._add;
        case false:
          return this._remove;
        default:
          return this._toggle;
      }
    }).call(this);
    return this.hoodie.store.updateAll(objects, update_method);
  };

  Instance.prototype.sync = function() {
    var _this = this;
    if (this.hasAccount()) {
      return (this.sync = this._sync)();
    } else {
      return this.hoodie.account.sign_up("sharing/" + this.id, this.password).done(function(username, response) {
        _this.save({
          _user_rev: _this.hoodie.account._doc._rev
        });
        return (_this.sync = _this._sync)();
      });
    }
  };

  Instance.prototype.hasAccount = function() {
    return !this.anonymous || (this._user_rev != null);
  };

  Instance.prototype._assure_owner_uuid = function() {
    var config;
    if (this.owner_uuid) {
      return;
    }
    config = this.constructor.hoodie.config;
    this.owner_uuid = config.get('sharing.owner_uuid');
    if (!this.owner_uuid) {
      this.owner_uuid = this.constructor.hoodie.store.uuid();
      return config.set('sharing.owner_uuid', this.owner_uuid);
    }
  };

  Instance.prototype._is_my_shared_object_and_changed = function(obj) {
    var belongs_to_me;
    belongs_to_me = obj.id === this.id || obj.$sharings && ~obj.$sharings.indexOf(this.id);
    return belongs_to_me && this.hoodie.store.is_dirty(obj.type, obj.id);
  };

  Instance.prototype._add = function(obj) {
    var new_value;
    new_value = obj.$sharings ? !~obj.$sharings.indexOf(this.id) ? obj.$sharings.concat(this.id) : void 0 : [this.id];
    if (new_value) {
      delete this.$docs_to_remove["" + obj.type + "/" + obj.id];
      this.set('$docs_to_remove', this.$docs_to_remove);
    }
    return {
      $sharings: new_value
    };
  };

  Instance.prototype.$docs_to_remove = {};

  Instance.prototype._remove = function(obj) {
    var $sharings, idx;
    try {
      $sharings = obj.$sharings;
      if (~(idx = $sharings.indexOf(this.id))) {
        $sharings.splice(idx, 1);
        this.$docs_to_remove["" + obj.type + "/" + obj.id] = {
          _rev: obj._rev
        };
        this.set('$docs_to_remove', this.$docs_to_remove);
        return {
          $sharings: $sharings.length ? $sharings : void 0
        };
      }
    } catch (_error) {}
  };

  Instance.prototype._toggle = function() {
    var do_add;
    try {
      do_add = ~obj.$sharings.indexOf(this.id);
    } catch (e) {
      do_add = true;
    }
    if (do_add) {
      return this._add(obj);
    } else {
      return this._remove(obj);
    }
  };

  Instance.prototype._sync = function() {
    var _this = this;
    return this.save().pipe(this.hoodie.store.loadAll(this._is_my_shared_object_and_changed).pipe(function(shared_object_that_changed) {
      return _this.hoodie.remote.sync(shared_object_that_changed).then(_this._handle_remote_changes);
    }));
  };

  Instance.prototype._handle_remote_changes = function() {
    return console.log.apply(console, ['_handle_remote_changes'].concat(__slice.call(arguments)));
  };

  return Instance;

})();
