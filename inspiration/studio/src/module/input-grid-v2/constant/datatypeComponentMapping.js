import ObjectType from "../components/DataType/ObjectType";
import ArrayType from "../components/DataType/ArrayType";
import BooleanType from "../components/DataType/BooleanType";
import NumberType from "../components/DataType/NumberType";
import StringType from "../components/DataType/StringType";
import IntType from "../components/DataType/IntType";
import AnyType from "../components/DataType/AnyType";

const DATA_TYPE_COMPONENT_MAPPING = {
  string: StringType,
  number: NumberType,
  boolean: BooleanType,
  object: ObjectType,
  array: ArrayType,
  int: IntType,
  any: AnyType,
};

export default DATA_TYPE_COMPONENT_MAPPING;
