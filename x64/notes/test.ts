import {rax, rsi} from '../regfile';
import {Code64} from '../code';




var _ = new Code64;
var ins = _.incq(rax).lock();
var ins = _.decq(rax).lock();
// console.log(ins);
// _.mov(rax, 1);
// _.mov(rsi, rax);
// _.syscall();
// _.movq(rax, rax);
// _.push(rax);
// _.push(r8);
// _.pop(rax);
// _.push(r8);
console.log(new Buffer(_.compile()));


// console.log(_.push(rax).write([]));
// console.log(_.push(r8).write([]));
// console.log(_.pop(rax).write([]));
// console.log(_.push(r8).write([]));



// var ops = new i.Operands(r8);
// var encoder = new Encoder;
// var ins = encoder.createInstruction(def.PUSH, ops);
// console.log(ins);
// var code = ins.write([]);

