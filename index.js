function ResolverError(msg, name) {
  this.message = msg;
  this.name = name;
}

ResolverError.prototype = new Error();

function Resolver() {
  this.parameters = [];
  this.asPromise = false;
}

Resolver.types = ['string', 'boolean', 'number', 'object', 'array'];

Resolver.checkType = function(param, type) {
  return type == 'array' ? Array.isArray(param) : typeof param === type;
};

Resolver.prototype.asPromise = function(asPromise)
{
    this.asPromise = (typeof asPromise == 'boolean') ? asPromise : true;
};

Resolver.prototype.getParameter = function(name) {
  if (!this.parameters.length) {
    return null;
  }

  for (var i = 0, len = this.parameters.length; i < len; i++) {
    if (name === this.parameters[i].name) {
      return this.parameters[i];
    }
  }

  return null;
};

Resolver.prototype.getAllParameters = function() {
  return this.parameters;
};

Resolver.prototype.addParameter = function(param) {
  var checkParameter = function(param) {
    if (typeof param != 'object') {
      return false;
    }

    if (!param.name || typeof param.required != 'boolean') {
      return false;
    }

    return true;
  };

  if (!checkParameter(param)) {
    throw new ResolverError(
      'Resolver error: parameter not valid',
      'PARAMETER_NOT_VALID'
    );
  }

  var p = {
    name: param.name,
    required: param.required
  };

  if (typeof param.type != 'undefined') {
    if (Resolver.types.indexOf(param.type) == -1) {
      throw new Error('Resolver error: wrong type "' + param.type + '"');
    }

    p.type = param.type;
  }

  if (typeof param.default != 'undefined') {
    if (p.required) {
      throw new Error(
        'Resolver error: trying to set default value to required parameter'
      );
    }

    if (p.type && !Resolver.checkType(param.default, p.type)) {
      throw new Error(
        'Resolver error: default value doesn\'t match the param type'
      );
    }

    p.default = param.default;
  }

  if (typeof param.values != 'undefined') {
    if (!Array.isArray(param.values)) {
      throw new Error('Resolver error: available values is not an array');
    }

    if (!param.values.length) {
      throw new Error('Resolver error: available values array is empty');
    }

    p.values = param.values;
  }

  this.parameters.push(p);

  return this;
};

Resolver.prototype._resolve = function(data, callback) {
  var getKeys = function(obj) {
    if (typeof obj != 'object') {
      return [];
    }

    var keys = [];
    for (var k in obj) {
      keys.push(k);
    }

    return keys;
  };

  if (!this.parameters.length) {
    return callback(
      new ResolverError(
        'Resolver error: no parameters specified',
        'NO_RESOLVER_PARAMETERS'
      )
    );
  }

  if (!getKeys(data).length) {
    return callback(
      new ResolverError(
        'Resolver error: empty data provided',
        'EMPTY_DATA'
      )
    );
  }

  var resolved = {};
  for (var i = 0; i < this.parameters.length; i++) {
    var param = this.parameters[i];

    if (param.required) {
      if (typeof data[param.name] == 'undefined') {
        return callback(
          new ResolverError(
            'Resolver error: "' + param.name + '" required parameter not found',
            'NO_REQUIRED_PARAMETER'
          )
        );
      }
    } else {
      if (
        typeof data[param.name] == 'undefined' &&
        typeof param.default == 'undefined'
      ) {
        continue;
      }

      data[param.name] = typeof data[param.name] == 'undefined' ?
      param.default : data[param.name];
    }

    if (
      typeof param.type == 'string' &&
      !Resolver.checkType(data[param.name], param.type)
    ) {
      return callback(
        new ResolverError(
          'Resolver error: "' + param.name + '" has wrong type',
          'PARAMETER_WRONG_TYPE'
        )
      );
    }

    if (param.values && param.values.indexOf(data[param.name]) == -1) {
      return callback(
        new ResolverError(
          'Resolver error: "' + param.name + '" has wrong value',
          'PARAMETER_WRONG_VALUE'
        )
      );
    }

    resolved[param.name] = data[param.name];
  }

  return callback(null, resolved);
};

Resolver.prototype.resolve = function(data, callback) {
    this._resolve(data, callback);
};

Resolver.prototype.resolvePromise = function(inputData) {
    var _this = this;
    return new Promise(function(fulfill, reject) {
        _this._resolve(inputData, function(err, data) {
            if (err) return reject(err);
            return fulfill(data);
        });
    });
};

module.exports = Resolver;
