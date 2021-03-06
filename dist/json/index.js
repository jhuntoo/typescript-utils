"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var serializer_1 = require("./serializer");
var string_serializer_1 = require("./string-serializer");
var number_serializer_1 = require("./number-serializer");
var boolean_serializer_1 = require("./boolean-serializer");
var ArraySerializer = (function (_super) {
    __extends(ArraySerializer, _super);
    function ArraySerializer(valueType) {
        _super.call(this);
        this.valueType = valueType;
    }
    ArraySerializer.prototype.serialize = function (value, options) {
        if (this.isUndefinedOrNull(value)) {
            return this.serializeUndefinedOrNull(value, options);
        }
        else if (Array.isArray(value)) {
            var array = [];
            if (this.valueType instanceof serializer_1.Serializer) {
                for (var _i = 0, value_1 = value; _i < value_1.length; _i++) {
                    var i = value_1[_i];
                    array.push(this.valueType.serialize(i, options));
                }
            }
            else {
                for (var _a = 0, value_2 = value; _a < value_2.length; _a++) {
                    var i = value_2[_a];
                    array.push(serialize(i, this.valueType));
                }
            }
            return array;
        }
        else if (!options || !options.ignoreErrors) {
            throw 'Cannot serialize "' + value + " as array";
        }
        else {
            return undefined;
        }
    };
    ArraySerializer.prototype.unserialize = function (json, options) {
        if (Array.isArray(json)) {
            if (this.valueType) {
                var array = [];
                if (this.valueType instanceof serializer_1.Serializer) {
                    for (var _i = 0, json_1 = json; _i < json_1.length; _i++) {
                        var i = json_1[_i];
                        array.push(this.valueType.unserialize(i));
                    }
                }
                else {
                    for (var _a = 0, json_2 = json; _a < json_2.length; _a++) {
                        var i = json_2[_a];
                        array.push(unserialize(i, this.valueType));
                    }
                }
                return array;
            }
            else {
                return json;
            }
        }
        else if (this.isUndefinedOrNull(json)) {
            return this.unserializeUndefinedOrNull(json, options);
        }
        else if (!options || !options.ignoreErrors) {
            throw 'Cannot unserialize "' + json + " to array.";
        }
        else {
            return undefined;
        }
    };
    return ArraySerializer;
}(serializer_1.Serializer));
exports.ArraySerializer = ArraySerializer;
exports.ArrayOfAny = new ArraySerializer();
exports.ArrayOfString = new ArraySerializer(String);
exports.ArrayOfNumber = new ArraySerializer(Number);
var ObjectSerializer = (function (_super) {
    __extends(ObjectSerializer, _super);
    function ObjectSerializer() {
        _super.apply(this, arguments);
    }
    ObjectSerializer.prototype.serialize = function (object, options) {
        if (object === null || object === undefined)
            return object;
        if (object.toJSON) {
            object = object.toJSON();
        }
        /*
        if (typeof object == "object") {

            for (let k in object) {
                if (object[k] === undefined || object[k] === null) {
                    delete object[k];
                }
            }

        }*/
        return object;
    };
    ObjectSerializer.prototype.unserialize = function (json, options) {
        if (this.isUndefinedOrNull(json))
            return json;
        else if (options && typeof options["propertyType"] === "function") {
            return unserialize(json, options["propertyType"]);
        }
        return json;
    };
    return ObjectSerializer;
}(serializer_1.Serializer));
var OBJECT_SERIALIZER = new ObjectSerializer();
function toJsonImpl(object, prototype) {
    var json = {};
    var prototypeOfPrototype = prototype ? Object.getPrototypeOf(prototype) : null;
    var properties = prototype["__json__properties"];
    var ignoredProperties = prototype["__json__ignoredProperties"];
    if (prototype && prototypeOfPrototype && prototypeOfPrototype["toJSON"]) {
        var prototypeJson = prototypeOfPrototype.toJSON.call(object);
        if (typeof prototypeJson === "object") {
            json = prototypeJson;
        }
    }
    for (var propertyName in properties) {
        if (!ignoredProperties || ignoredProperties.indexOf(propertyName) < 0) {
            var propertyConfig = properties[propertyName];
            var propertyDescriptor = Object.getOwnPropertyDescriptor(object, propertyName);
            //let propertyValue = propertyDescriptor && propertyDescriptor.get ? object[propertyName] : (propertyDescriptor ? propertyDescriptor.value : null);
            var propertyValue = object[propertyName];
            var jsonName = propertyConfig.propertyJsonName ? propertyConfig.propertyJsonName : propertyName;
            var serializer = propertyConfig.propertyType instanceof serializer_1.Serializer ? propertyConfig.propertyType : serializerForType(propertyConfig.propertyType);
            json[jsonName] = serializer.serialize(propertyValue, propertyConfig);
        }
    }
    return json;
}
function fromJsonImpl(instance, prototype, json) {
    var prototypeOfPrototype = prototype ? Object.getPrototypeOf(prototype) : undefined;
    if (prototype && prototypeOfPrototype && prototypeOfPrototype["fromJSON"]) {
        prototypeOfPrototype.fromJSON.apply(instance, [json]);
    }
    var properties = prototype["__json__properties"];
    var ignoredProperties = prototype["__json__ignoredProperties"];
    for (var propertyName in properties) {
        if (!ignoredProperties || ignoredProperties.indexOf(propertyName) < 0) {
            var propertyConfig = properties[propertyName];
            var jsonName = propertyConfig.propertyJsonName ? propertyConfig.propertyJsonName : propertyName;
            var serializer = propertyConfig.propertyType instanceof serializer_1.Serializer ? propertyConfig.propertyType : serializerForType(propertyConfig.propertyType);
            instance[propertyName] = serializer.unserialize(json[jsonName], propertyConfig);
        }
    }
}
function serializerForType(type) {
    if (type === Boolean)
        return boolean_serializer_1.BooleanSerializer.INSTANCE;
    if (type === Number)
        return number_serializer_1.NumberSerializer.INSTANCE;
    if (type === String)
        return string_serializer_1.StringSerializer.INSTANCE;
    if (type === Array)
        return exports.ArrayOfAny;
    return OBJECT_SERIALIZER;
}
function setupSerialization(constructor) {
    constructor["__json__serialization"] = true;
    if (!constructor.hasOwnProperty("toJSON") || constructor.hasOwnProperty("__json__toJSON")) {
        constructor["__json__toJSON"] = true;
        constructor.toJSON = function () {
            return toJsonImpl(this, constructor);
        };
    }
    if (!constructor.hasOwnProperty("fromJSON") || constructor.hasOwnProperty("__json__fromJSON")) {
        constructor["__json__fromJSON"] = true;
        constructor.fromJSON = function (json) {
            return fromJsonImpl(this, constructor, json);
        };
    }
}
function Subtype(property, value, typeRef) {
    return function (target) {
        setupSerialization(target);
        var types;
        if (target.hasOwnProperty("__json__subtypes")) {
            types = Object.getOwnPropertyDescriptor(target, "__json__subtypes").value;
        }
        else {
            types = [];
            Object.defineProperty(target, "__json__subtypes", { value: types, enumerable: false, configurable: false });
        }
        types.push({ property: property, value: value, typeRef: typeRef });
    };
}
exports.Subtype = Subtype;
function Property(type, nameOrOptions, options) {
    return function (target, propertyName, propertyDescriptor) {
        var constructor = target;
        var config = { propertyType: type };
        if (typeof nameOrOptions === "string") {
            config.propertyJsonName = nameOrOptions;
        }
        else if (nameOrOptions) {
            Object.assign(config, nameOrOptions);
        }
        if (options) {
            Object.assign(config, options);
        }
        setupSerialization(constructor);
        var properties;
        if (constructor.hasOwnProperty("__json__properties")) {
            properties = Object.getOwnPropertyDescriptor(constructor, "__json__properties").value;
        }
        else {
            properties = {};
            Object.defineProperty(constructor, "__json__properties", { value: properties, enumerable: false, configurable: false });
        }
        properties[propertyName] = config;
    };
}
exports.Property = Property;
function Ignore(target, propertyName, propertyDescriptor) {
    var constructor = target;
    setupSerialization(constructor);
    var properties;
    if (constructor.hasOwnProperty("__json__ignoreProperties")) {
        properties = Object.getOwnPropertyDescriptor(constructor, "__json__ignoreProperties").value;
    }
    else {
        properties = [];
        Object.defineProperty(constructor, "__json__ignoreProperties", { value: properties, enumerable: false, configurable: false });
    }
    properties.push(propertyName);
}
exports.Ignore = Ignore;
/**
 * Marks a class, that is to be serialized by json serialization engine.
 */
function Serialize(target) {
    setupSerialization(target);
}
exports.Serialize = Serialize;
function serialize(object, options) {
    return OBJECT_SERIALIZER.serialize(object, options);
}
exports.serialize = serialize;
function unserialize(json, targetClass) {
    var serializer = serializerForType(targetClass);
    if (serializer && serializer !== OBJECT_SERIALIZER)
        return serializer.unserialize(json);
    var prototype = targetClass.prototype;
    // if type has subtypes, find apropriate subtype
    if (targetClass.hasOwnProperty("__json__subtypes")) {
        var subtypes = Object.getOwnPropertyDescriptor(targetClass, "__json__subtypes").value;
        for (var _i = 0, subtypes_1 = subtypes; _i < subtypes_1.length; _i++) {
            var subtype = subtypes_1[_i];
            if (json[subtype.property] == subtype.value) {
                prototype = subtype.typeRef.call(null).prototype;
                break;
            }
        }
    }
    if (prototype["fromJSON"]) {
        var instance = Object.create(prototype);
        instance.fromJSON(json);
        return instance;
    }
    else if (targetClass !== Object) {
        var instance = Object.create(prototype);
        targetClass.apply(instance, [json]);
        return instance;
    }
    return json;
}
exports.unserialize = unserialize;
//# sourceMappingURL=index.js.map