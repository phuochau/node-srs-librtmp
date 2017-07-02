const ref = require('ref');

const VoidRef = ref.types.void;
const VoidRefPtr = ref.refType(VoidRef);
const VoidRefPtrPtr = ref.refType(VoidRefPtr);

const IntRef = ref.types.int;
const IntRefPtr = ref.refType(IntRef);
const IntRefPtrPtr = ref.refType(IntRefPtr);

const CharRef = ref.types.char;
const CharRefPtr = ref.refType(CharRef);
const CharRefPtrPtr = ref.refType(CharRefPtr);

const DoubleRef = ref.types.double;
const DoubleRefPtr = ref.refType(DoubleRef);

module.exports = {
  VoidRef,
  VoidRefPtr,
  VoidRefPtrPtr,
  IntRef,
  IntRefPtr,
  IntRefPtrPtr,
  CharRef,
  CharRefPtr,
  CharRefPtrPtr,
  DoubleRef,
  DoubleRefPtr
}