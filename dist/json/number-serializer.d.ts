import { Serializer, SerializationOptions } from "./index";
export declare class NumberSerializer extends Serializer {
    static INSTANCE: NumberSerializer;
    serialize(value: any, options?: SerializationOptions): any;
    unserialize(value: any, options?: SerializationOptions): any;
}