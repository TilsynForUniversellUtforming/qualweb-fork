import QW_ACT_R1 from './rules/QW-ACT-R1';
import QW_ACT_R2 from './rules/QW-ACT-R2';
import QW_ACT_R3 from './rules/QW-ACT-R3';
import QW_ACT_R4 from './rules/QW-ACT-R4';
import QW_ACT_R5 from './rules/QW-ACT-R5';
import QW_ACT_R7 from './rules/QW-ACT-R7';
import QW_ACT_R8 from './rules/QW-ACT-R8';
import QW_ACT_R14 from './rules/QW-ACT-R14';
import QW_ACT_R18 from './rules/QW-ACT-R18';

const rules = {
  'QW-ACT-R1': new QW_ACT_R1(),
  'QW-ACT-R2': new QW_ACT_R2(),
  'QW-ACT-R3': new QW_ACT_R3(),
  'QW-ACT-R4': new QW_ACT_R4(),
  'QW-ACT-R5': new QW_ACT_R5(),
  'QW-ACT-R7': new QW_ACT_R7(),
  'QW-ACT-R8': new QW_ACT_R8(),
  'QW-ACT-R14': new QW_ACT_R14(),
  'QW-ACT-R18': new QW_ACT_R18(),
};

const rulesToExecute = {
  'QW-ACT-R1': true,
  'QW-ACT-R2': true,
  'QW-ACT-R3': true,
  'QW-ACT-R4': true,
  'QW-ACT-R5': true,
  'QW-ACT-R7': true,
  'QW-ACT-R8': true,
  'QW-ACT-R14': true,
  'QW-ACT-R18': true
};

export {
  rules,
  rulesToExecute
};
