import AnyType from "../common/DataType/AnyType";
import ArrayType from "../common/DataType/ArrayType";
import BooleanType from "../common/DataType/BooleanType";
import IntType from "../common/DataType/IntType";
import NumberType from "../common/DataType/NumberType";
import ObjectType from "../common/DataType/ObjectType";
import StringType from "../common/DataType/StringType";

const MAPPING = {
  string: StringType,
  number: NumberType,
  boolean: BooleanType,
  object: ObjectType,
  array: ArrayType,
  int: IntType,
  any: AnyType,
};

export default MAPPING;
