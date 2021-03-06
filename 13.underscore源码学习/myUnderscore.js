(function() {
  var root = this;
  
  var previousUnderscore = root._;
  
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;
  
  var
    push = ArrayProto.push,
    slice = ArrayProto.slice,
    toString = ObjProto.toString,
    hasOwnProperty = ObjProto.hasOwnProperty;

  var 
    nativeIsArray = Array.isArray,
    nativeKeys = Object.keys,
    nativeBind = FuncProto.bind,
    nativeCreate = Object.create;

  var Ctor = function() {};

  var _ = function(obj) {
    if(obj instanceof _) return obj;
    if(!(this instanceof _)) return new _(obj);
    this.wrapped = obj;
  };

  if(typeof exports !== 'undefined') {
    if(typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  _.VERSION = '1.8.3';

  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch(argCount == null ? 3 :argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection)
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection)
      };
    };
    return function() {
      return func.apply(context, arguments);
    };
  };

  var cb = function(value, context, argCount) {
    if(value == null) return _.identity;
    if(_.isFunction(value)) return optimizeCb(value, context, argCount);
    if(_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };

  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if(length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index ++){
        var source = arguments[index],
            keys = keysFunc[source],
            l = kyes.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if(!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  var baseCreate  = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result =  new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj === null ? void 0 : obj[key];
    };
  };

  var MAX_ARRAY_INDEX =  Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for(i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for(i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++){
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    } 
    return results;
  }

  function creatReduce(dir) {     
    function iterator(obj, iteratee, memo, keys, index, length) {
      for(;index >= 0 && index < length; index ++) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee  = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length -1;
      if(arguments.length < 3) {
        memo  = obj[keys? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    }
  };

  _.reduce = _.foldl = _.inject = createReduce(1);

  _reduceRight = _.foldr = createReduce(-1);

  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !==-1) return obj[key];
  };

  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if(predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _negate(cb(predicate)), context);    
  };

  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = isArrayLike && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys? keys[index]: index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func ： func.apply(value, args);
    })
  };

  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  }
  
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if(value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, context) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result  = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if(computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          computed = lastComputed;
        }
      });
    }
    return result;
  };

  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for(var index = 0, rand; index < length; i++) {
      rand = _.random(0, index);
      if( rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };
  
  _.sample = function(obj, n, guard) {
    if(n == null || guard) {
      if(!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffled(obj).slice(0, Math.max(0, n));
  };

  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if(a !== b) {
        if(a > b || a === void 0) return 1;
        if(a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    }
  };
  _.groupBy = group(function(result, value, key) {
    if(_.has(result, key)) result[key].push(value);else result[key] = [value];
  });

  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  _.countBy = group(function(result, value, key) {
    if (_.has(result, key))result[key]++; else result[key] = 1;
  });

  _.toArray = function(obj) {
    if(!obj) return [];
    if(_.isArray(obj)) return slice.call(obj);
    if(isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  _.first  = _.head = _.take = function(array, n, guard) {
    if(array == null) return void 0;
    if(n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  }

  _.last = function(array, n, guard) {
    if(array == null) return void 0;
    if(n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if(isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        if(!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length + = len;
        while(j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
  };

  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  _.without  = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if(!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if(iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for( var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if(isSorted) {
        if(!i || seen != computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if(!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++ ){
      var item = array[i];
      if(_.contains(result, item)) continue;
      for(var j = 1; j < argsLength; j++){
        if(!_.contains(arguments[j], item)) break;
      }
      if(j === argsLength) result.push(item);
    }
    return result;
  };

  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value) {
      return !_.contains(rest, value);
    });
  };

  _.zip = function(array) {
    return _unzip(arguments);
  }

  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var reslult = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
  }
  
  _.object = function(list, values) {
    var result = {};
    for(var i = 0, length = getLength(list); i < length; i++) {
      if(values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
  };

  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for(;index >= 0 && index < length; index += dir){
        if(predicate(array[index], index, array)) return index;
      }
      return -1;
    }
  };

  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  _.sortedIndex  = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while(low < high) {
      var mid = Math.floor((low + high) / 2);
      if(iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if(typeof idx = 'number') {
        if(dir > 0) {
          i = idx >= 0 ?idx : Math.max(idx + length, i);
        } else {
          length = idx >= 0 ? Math.min(idx + 1, length): idx + length + 1;
        }
      } else if(sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if(item != item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for(idx = dir > 0 ? i: length - 1; idx >= 0 && idx < length; idx += dir) {
        if(array[idx] ===item) return idx;
      }
      return -1;
    };
  };

  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  _.range = function(start, stop, step) {
    if(stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0)
    var range =  Array(length);

    for(var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }
    return range;
  };

  

}.call(this));