import {Property, Subtype, Serialize} from "../../json";
import {StringSerializer} from "../../json/string-serializer";
import {ArrayOfString} from "../../json/array-serializer";

export class ModelA {

    @Property(String, "baseFieldString")
    baseFieldString: string;

}

@Subtype("type", "D", () => ModelD)
export class ModelB extends ModelA {

    constructor () {
        super();
        this.type = "B";
        console.log("called constructor b");
    }

    @Property(String)
    type: string;

    @Property(String, "jsonFieldString")
    fieldString: string;

    @Property(Number)
    fieldNumber: number;

    @Property(Number)
    fieldNumberAsString: number;

    @Property(Boolean, "__fieldBoolean")
    fieldBoolean: boolean;

    @Property(ArrayOfString)
    fieldArray: string[];

}

export class ModelC {
    constructor (b: ModelB) {
        this.fieldModelB = b;
    }
    @Property(ModelB)
    fieldModelB: ModelB;

}

@Serialize
export class ModelD extends ModelB {
    constructor () {
        super();
        this.type = "D";
        console.log("called constructor d");
    }

    @Property(Boolean)
    fieldModelD: boolean;
}
