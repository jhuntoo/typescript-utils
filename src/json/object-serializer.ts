import {Serializer, SerializationOptions} from "./serializer";
import {unserialize, serialize} from "./index";

/**
 * Serializer of objects, that should be treated as Maps, where key is always a string and value of given type.
 */
export class ObjectAsMapSerializer extends Serializer {

    constructor (valueType?: Function | Serializer) {
    	super();
        this.valueType = valueType;
    }

    private valueType: Function | Serializer;

    public serialize (value: any, options?: SerializationOptions): any {
        if (this.isUndefinedOrNull(value)) {
            return this.serializeUndefinedOrNull(value, options);

        } else if (typeof value === "object") {

            let json = {};

            for (let i in value) {
                json[i] = this.valueType instanceof Serializer ? this.valueType.serialize(value[i]) : serialize(value[i]);
            }

            return json;

        } else if (!options || !options.ignoreErrors) {
	        throw 'Cannot serialize "' + value + " as object";

        } else {
            return undefined;
        }
	}

	public unserialize (value: any, options?: SerializationOptions) : any {

        if (typeof value === "object") {

            if (this.valueType) {
                let object = {};

                for (let i in value) {
                    object[i] = this.valueType instanceof Serializer ? this.valueType.unserialize(value[i]) : unserialize(value[i], this.valueType);
                }

                return object;

            } else {
			    return value;
            }

        } else if (this.isUndefinedOrNull(value)) {
            return this.unserializeUndefinedOrNull(value, options);

        } else if (!options || !options.ignoreErrors) {
			throw 'Cannot unserialize "' + value + " to object.";

		} else {
            return undefined;
        }
	}
}
