import * as libfs from '../fs';
import * as fs from 'fs';

var path = __dirname + '/test.txt';

// fs.accessSync(__dirname + '/data.txt');
// libfs.accessSync(__dirname + '/data.txt');


// var fd = fs.openSync(path, 'r');
// var stats = fs.fstatSync(fd);
// console.log(stats);

// var stats2 = libfs.statSync(path);
// console.log(stats2.isFile());
// console.log(stats2.isDirectory());
// console.log(stats2.isSocket());
// libfs.utimesSync(path, '2142342344', NaN);
// libfs.utimesSync(path, Date.now(), Date.now());
// fs.utimesSync(path, 2, 2);

// fs.linkSync(path, path + '2');
// libfs.linkSync(path, path + '3');

// libfs.mkdirSync(path + '.dir');
// var name = libfs.mkdtempSync(__dirname + '/temp-');
// console.log(name);


var buf = new Buffer(10);
var fd = libfs.openSync(path, 'r');
var bytes = libfs.readSync(fd, buf, 0, 10, null);
console.log(buf);
console.log(bytes, buf.toString());




