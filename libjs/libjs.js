// # libjs
// 
// `libjs` creates wrappers around system calls, similar to what `libc` does for `C` language.
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
// `libsys` library contains our only native dependency -- the `syscall` function.
// 
//     sys.syscall(cmd: number, ...args): number
var sys = require('./sys');
// `defs` provides platform specific constants and structs, the default one we use is `x86_64`.
var defs = require('./definitions');
// In development mode we use `debug` library to trace all our system calls. To see debug output,
// set `DEBUG` environment variable to `libjs:*`, example:
// 
//     DEBUG=libjs:* node script.js
var debug = require('debug')('libjs:syscall');
// Export definitions and other modules all as part of the library.
__export(require('./ctypes'));
__export(require('./definitions'));
__export(require('./socket'));
// ## Files
// 
// Standard file operations.
// ### read
//
//     read(fd: number, buf: Buffer): number
// 
// Read data from file associated with `fd` file descriptor into buffer `buf`.
// Up to size of the `buf.length` will be read or less.
//
// Returns a `number` which is the actual bytes read into the buffer, if negative,
// represents an error.
/**
 * @param fd {number}
 * @param buf {Buffer}
 * @returns {number}
 */
function read(fd, buf) {
    debug('read', fd);
    return sys.syscall(defs.syscalls.read, fd, buf, buf.length);
}
exports.read = read;
// ### write
//
//     write(fd: number, buf: string|Buffer): number
//
// Write data to a file descriptor. Example, write to console (where `STDOUT` has value `1` as a file descriptor):
//
//     libjs.write(1, 'Hello console\n');
function write(fd, buf) {
    debug('write', fd);
    if (!(buf instanceof Buffer))
        buf = new Buffer(buf + '\0');
    return sys.syscall(defs.syscalls.write, fd, buf, buf.length);
}
exports.write = write;
// ### open
// 
//     open(pathname: string, flags: defs.FLAG, mode?: defs.MODE): number
// 
// Opens a file, returns file descriptor on success or a negative number representing an error.
// 
// Read data from a file:
// 
//     var fd = libjs.open('/tmp/data.txt', libjs.FLAG...);
//     var buf = new Buffer(1024);
//     libjs.read(fd, buf);
function open(pathname, flags, mode) {
    debug('write', pathname, flags, mode);
    var args = [defs.syscalls.open, pathname, flags];
    if (typeof mode === 'number')
        args.push(mode);
    return sys.syscall.apply(null, args);
}
exports.open = open;
// ### close
//
// Close file descriptor.
function close(fd) {
    debug('close', fd);
    return sys.syscall(defs.syscalls.close, fd);
}
exports.close = close;
// ### access
//
// Check user's permissions for a file
//
// In `libc`:
//
//     int access(const char *pathname, int mode);
function access(pathname, mode) {
    debug('access', pathname, mode);
    return sys.syscall(defs.syscalls.access, pathname, mode);
}
exports.access = access;
// ### chmod and fchmod
//
// Change permissions of a file. On success, zero is returned.  On error, -1 is returned,
// and errno is set appropriately.
//
// In `libc`:
//
//     int chmod(const char *pathname, mode_t mode);
//     int fchmod(int fd, mode_t mode);
function chmod(pathname, mode) {
    debug('chmod', pathname, mode);
    return sys.syscall(defs.syscalls.chmod, pathname, mode);
}
exports.chmod = chmod;
function fchmod(fd, mode) {
    debug('fchmod', fd, mode);
    return sys.syscall(defs.syscalls.chmod, fd, mode);
}
exports.fchmod = fchmod;
// ### chown, fchown and lchown
//
// These system calls change the owner and group of a file.  The
// `chown()`, `fchown()`, and `lchown()` system calls differ only in how the
// file is specified:
//
//  - `chown()` changes the ownership of the file specified by pathname, which is dereferenced if it is a symbolic link.
//  - `fchown()` changes the ownership of the file referred to by the open file descriptor fd.
//  - `lchown()` is like chown(), but does not dereference symbolic links.
//
//     chown(pathname: string, owner: number, group: number): number
//     fchown(fd: number, owner: number, group: number): number
//     lchown(pathname: string, owner: number, group: number): number
//
// In `libc`:
//
//     int chown(const char *pathname, uid_t owner, gid_t group);
//     int fchown(int fd, uid_t owner, gid_t group);
//     int lchown(const char *pathname, uid_t owner, gid_t group);
function chown(pathname, owner, group) {
    debug('chown', pathname, owner, group);
    return sys.syscall(defs.syscalls.chown, pathname, owner, group);
}
exports.chown = chown;
function fchown(fd, owner, group) {
    debug('fchown', fd, owner, group);
    return sys.syscall(defs.syscalls.fchown, fd, owner, group);
}
exports.fchown = fchown;
function lchown(pathname, owner, group) {
    debug('lchown', pathname, owner, group);
    return sys.syscall(defs.syscalls.lchown, pathname, owner, group);
}
exports.lchown = lchown;
// ## fsync and fdatasync
//
// Synchronize a file's in-core state with storage.
function fsync(fd) {
    debug('fsync', fd);
    return sys.syscall(defs.syscalls.fsync, fd);
}
exports.fsync = fsync;
function fdatasync(fd) {
    debug('fdatasync', fd);
    return sys.syscall(defs.syscalls.fdatasync, fd);
}
exports.fdatasync = fdatasync;
// ### stat, lstat, fstat
// 
// Fetches and returns statistics about a file.
//
//     stat(filepath: string): defs.stat
//     lstat(linkpath: string): defs.stat
//     fstat(fd: number): defs.stat
// 
// Returns a `stat` object of the form:
//
//     interface stat {
//         dev: number;
//         ino: number;
//         nlink: number;
//         mode: number;
//         uid: number;
//         gid: number;
//         rdev: number;
//         size: number;
//         blksize: number;
//         blocks: number;
//         atime: number;
//         atime_nsec: number;
//         mtime: number;
//         mtime_nsec: number;
//         ctime: number;
//         ctime_nsec: number;
//     }
function stat(filepath) {
    debug('stat', filepath);
    var buf = new Buffer(defs.stat.size);
    var result = sys.syscall(defs.syscalls.stat, filepath, buf);
    if (result == 0)
        return defs.stat.unpack(buf);
    throw result;
}
exports.stat = stat;
function lstat(linkpath) {
    debug('lstat', linkpath);
    var buf = new Buffer(defs.stat.size);
    var result = sys.syscall(defs.syscalls.lstat, linkpath, buf);
    if (result == 0)
        return defs.stat.unpack(buf);
    throw result;
}
exports.lstat = lstat;
function fstat(fd) {
    debug('fstat', fd);
    var buf = new Buffer(defs.stat.size);
    var result = sys.syscall(defs.syscalls.fstat, fd, buf);
    if (result == 0)
        return defs.stat.unpack(buf);
    throw result;
}
exports.fstat = fstat;
// ### truncate and ftruncate
//
// Truncate a file to a specified length
//
//     truncate(path: string, length: number): number
//     ftruncate(fd: number, length: number): number
//
// In `libc`:
//
//     int truncate(const char *path, off_t length);
//     int ftruncate(int fd, off_t length);
function truncate(path, length) {
    debug('truncate', path, length);
    return sys.syscall(defs.syscalls.truncate, path, length);
}
exports.truncate = truncate;
function ftruncate(fd, length) {
    debug('ftruncate', fd, length);
    return sys.syscall(defs.syscalls.ftruncate, fd, length);
}
exports.ftruncate = ftruncate;
// ### link
//
// Make a new name for a file.
//
// In `libc`:
//
//     int link(const char *oldpath, const char *newpath);
function link(oldpath, newpath) {
    debug('link', oldpath, newpath);
    return sys.syscall(defs.syscalls.link, oldpath, newpath);
}
exports.link = link;
// ### lseek
//
// Seek into position in a file.
function lseek(fd, offset, whence) {
    debug('lseek', fd, offset, whence);
    return sys.syscall(defs.syscalls.lseek, fd, offset, whence);
}
exports.lseek = lseek;
// ### mkdir, mkdirat and rmdir
//
// In `libc`:
//
//     int mkdir(const char *pathname, mode_t mode);
//     int mkdirat(int dirfd, const char *pathname, mode_t mode);
function mkdir(pathname, mode) {
    debug('mkdir', pathname, mode);
    return sys.syscall(defs.syscalls.mkdir, pathname, mode);
}
exports.mkdir = mkdir;
function mkdirat(dirfd, pathname, mode) {
    debug('mkdirat', dirfd, pathname, mode);
    return sys.syscall(defs.syscalls.mkdirat, dirfd, pathname, mode);
}
exports.mkdirat = mkdirat;
function rmdir(pathname) {
    debug('rmdir', pathname);
    return sys.syscall(defs.syscalls.rmdir, pathname);
}
exports.rmdir = rmdir;
// #define open_not_cancel_2(name, flags) \
// 0028    INLINE_SYSCALL (open, 2, (const char *) (name), (flags))
// dirp->fd = fd;
// #ifndef NOT_IN_libc
// __libc_lock_init (dirp->lock);
// #endif
// dirp->allocation = allocation;
// dirp->size = 0;
// dirp->offset = 0;
// dirp->filepos = 0;
// struct __dirstream
// 30   {
//     31     void *__fd;         /* `struct hurd_fd' pointer for descriptor.  */
//     32     char *__data;       /* Directory block.  */
//     33     int __entry_data;       /* Entry number `__data' corresponds to.  */
//     34     char *__ptr;        /* Current pointer into the block.  */
//     35     int __entry_ptr;        /* Entry number `__ptr' corresponds to.  */
//     36     size_t __allocation;    /* Space allocated for the block.  */
//     37     size_t __size;      /* Total valid data in the block.  */
//     38     __libc_lock_define (, __lock) /* Mutex lock for this structure.  */
//     39   };
// 8 + 8 + 4 + 8 + 4 + 8 + 8 + 4 + 8 + 8 + 8 + 4 = 80
// https://fossies.org/dox/glibc-2.23/struct____dirstream.html
// void * 	__fd
// char * 	__data
// int 	__entry_data
// char * 	__ptr
// int 	__entry_ptr
// size_t 	__allocation
// size_t 	__size
// int 	fd
// size_t 	size
// size_t 	offset
// off_t 	filepos
// int 	errcode
// `opendir` returns `Buffer` because we need to keep the reference to that `Buffer`
// otherwise JavaScript garbage-collector will free that memory.
function opendir(name) {
    debug('opendir', name);
    var flags = 0 /* O_RDONLY */ | 2048 /* O_NDELAY */ | 65536 /* O_DIRECTORY */ | 0 /* O_LARGEFILE */;
    var dfd = open(name, flags);
    if (dfd < 0)
        throw dfd;
    // > The opendir() function sets the close-on-exec flag for the file
    // > descriptor underlying the DIR *.
    // var res = fcntl(dfd, defs.FCNTL.SETFL, defs.FD.CLOEXEC) < 0);
    // if(res < 0) throw res;
    var dirp = {
        __fd: [dfd, 0],
        __data: [0x8000, 0]
    };
    return defs.DIR.pack(dirp);
}
exports.opendir = opendir;
function readdir() {
}
exports.readdir = readdir;
// ## Time
//
//
// ## utime, utimes, utimensat and futimens
// 
// In `libc`:
//
//     int utime(const char *filename, const struct utimbuf *times);
//     int utimes(const char *filename, const struct timeval times[2]);
//     int utimensat(int dirfd, const char *pathname, const struct timespec times[2], int flags);
//     int futimens(int fd, const struct timespec times[2]);
function utime(filename, times) {
    debug('utime', filename, times);
    var buf = defs.utimbuf.pack(times);
    return sys.syscall(defs.syscalls.utime, filename, buf);
}
exports.utime = utime;
function utimes(filename, times) {
    debug('utimes', filename, times);
    var buf = defs.timevalarr.pack(times);
    return sys.syscall(defs.syscalls.utimes, buf);
}
exports.utimes = utimes;
function utimensat(dirfd, pathname, timespecarr, flags) {
}
exports.utimensat = utimensat;
function futimens(fd, times) {
}
exports.futimens = futimens;
// ## Sockets
// ### socket
//
// In `libc`:
//
//     int socket(int domain, int type, int protocol);
//
// Useful references:
//  - http://www.skyfree.org/linux/kernel_network/socket.html
//  - https://github.com/torvalds/linux/blob/master/net/socket.c
//  - http://www.wangafu.net/~nickm/libevent-book/01_intro.html
//  - https://banu.com/blog/2/how-to-use-epoll-a-complete-example-in-c/epoll-example.c
function socket(domain, type, protocol) {
    debug('socket', domain, type, protocol);
    return sys.syscall(defs.syscalls.socket, domain, type, protocol);
}
exports.socket = socket;
// ### connect
//
// In `libc`:
//
//     int connect(sockfd, (struct sockaddr *)&serv_addr, sizeof(serv_addr));
function connect(fd, sockaddr) {
    debug('connect', fd, sockaddr.sin_addr.s_addr.toString(), require('./socket').hton16(sockaddr.sin_port));
    var buf = defs.sockaddr_in.pack(sockaddr);
    return sys.syscall(defs.syscalls.connect, fd, buf, buf.length);
}
exports.connect = connect;
function bind(fd, sockaddr) {
    debug('bind', fd, sockaddr.sin_addr.s_addr.toString(), require('./socket').hton16(sockaddr.sin_port));
    var buf = defs.sockaddr_in.pack(sockaddr);
    return sys.syscall(defs.syscalls.bind, fd, buf, buf.length);
}
exports.bind = bind;
// int listen(int sockfd, int backlog);
function listen(fd, backlog) {
    debug('listen', fd, backlog);
    return sys.syscall(defs.syscalls.listen, fd, backlog);
}
exports.listen = listen;
// int accept(int sockfd, struct sockaddr *addr, socklen_t *addrlen);
function accept(fd, buf) {
    debug('accept', fd);
    var buflen = defs.int32.pack(buf.length);
    return sys.syscall(defs.syscalls.accept, fd, buf, buflen);
}
exports.accept = accept;
// int accept4(int sockfd, struct sockaddr *addr, socklen_t *addrlen, int flags);
function accept4(fd, buf, flags) {
    debug('accept4', fd, flags);
    var buflen = defs.int32.pack(buf.length);
    return sys.syscall(defs.syscalls.accept4, fd, buf, buflen, flags);
}
exports.accept4 = accept4;
function shutdown(fd, how) {
    debug('shutdown', fd, how);
    return sys.syscall(defs.syscalls.shutdown, fd, how);
}
exports.shutdown = shutdown;
// TODO: does not work yet...
// ssize_t sendto(int sockfd, const void *buf, size_t len, int flags, const struct sockaddr *dest_addr, socklen_t addrlen);
function sendto(fd, buf, flags, addr) {
    if (flags === void 0) { flags = 0; }
    debug('sendto', fd);
    var params = [defs.syscalls.sendto, fd, buf, buf.length, flags, 0, 0];
    if (addr) {
        var addrbuf = defs.sockaddr.pack(addr);
        params[5] = addrbuf;
        params[6] = addrbuf.length;
    }
    return sys.syscall.apply(null, params);
}
exports.sendto = sendto;
// ssize_t send(int sockfd, const void *buf, size_t len, int flags);
function send(fd, buf, flags) {
    if (flags === void 0) { flags = 0; }
    debug('send', fd);
    return sendto(fd, buf, flags);
}
exports.send = send;
// ## Process
// ### getpid
//
// Get process ID.
function getpid() {
    debug('getpid');
    return sys.syscall(defs.syscalls.getpid);
}
exports.getpid = getpid;
// ### getppid
//
// Get parent process ID.
//
//     getppid(): number
function getppid() {
    debug('getppid');
    return sys.syscall(defs.syscalls.getppid);
}
exports.getppid = getppid;
// ### getuid
//
// Get parent user ID.
//
//     getuid(): number
function getuid() {
    debug('getuid');
    return sys.syscall(defs.syscalls.getuid);
}
exports.getuid = getuid;
// ### geteuid
//
// Get parent real user ID.
//
//     geteuid(): number
function geteuid() {
    debug('geteuid');
    return sys.syscall(defs.syscalls.geteuid);
}
exports.geteuid = geteuid;
// ### getgid
//
// Get group ID.
//
//     getgid(): number
function getgid() {
    debug('getgid');
    return sys.syscall(defs.syscalls.getgid);
}
exports.getgid = getgid;
// ### getgid
//
// Get read group ID.
//
//     getegid(): number
function getegid() {
    debug('getegid');
    return sys.syscall(defs.syscalls.getegid);
}
exports.getegid = getegid;
// ## Events
// ### fcntl
function fcntl(fd, cmd, arg) {
    debug('fcntl', fd, cmd, arg);
    var params = [defs.syscalls.fcntl, fd, cmd];
    if (typeof arg !== 'undefined')
        params.push(arg);
    return sys.syscall.apply(null, params);
}
exports.fcntl = fcntl;
// ### epoll_create
//
// Size is ignored, but must be greater than 0.
//
// In `libc`:
//
//     int epoll_create(int size);
//
function epoll_create(size) {
    debug('epoll_create', size);
    return sys.syscall(defs.syscalls.epoll_create, size);
}
exports.epoll_create = epoll_create;
// int epoll_create1(int flags);
function epoll_create1(flags) {
    debug('epoll_create1');
    return sys.syscall(defs.syscalls.epoll_create1, flags);
}
exports.epoll_create1 = epoll_create1;
// typedef union epoll_data {
//     void    *ptr;
//     int      fd;
//     uint32_t u32;
//     uint64_t u64;
// } epoll_data_t;
//
// struct epoll_event {
//     uint32_t     events;    /* Epoll events */
//     epoll_data_t data;      /* User data variable */
// };
// http://man7.org/linux/man-pages/man2/epoll_wait.2.html
// int epoll_wait(int epfd, struct epoll_event *events, int maxevents, int timeout);
function epoll_wait(epfd, buf, maxevents, timeout) {
    debug('epoll_wait', epfd, maxevents, timeout);
    return sys.syscall(defs.syscalls.epoll_wait, epfd, buf, maxevents, timeout);
}
exports.epoll_wait = epoll_wait;
// int epoll_pwait(int epfd, struct epoll_event *events, int maxevents, int timeout, const sigset_t *sigmask);
// export function epoll_pwait() {
//
// }
// int epoll_ctl(int epfd, int op, int fd, struct epoll_event *event);
function epoll_ctl(epfd, op, fd, epoll_event) {
    var buf = defs.epoll_event.pack(epoll_event);
    return sys.syscall(defs.syscalls.epoll_ctl, epfd, op, fd, buf);
}
exports.epoll_ctl = epoll_ctl;
// ## Memory
// ### mmap
//
// Map files or devices into memory
//
//     mmap(addr: number, length: number, prot: defs.PROT, flags: defs.MAP, fd: number, offset: number): number
//
// In `libc`:
//
//     void *mmap(void *addr, size_t length, int prot, int flags, int fd, off_t offset);
//
function mmap(addr, length, prot, flags, fd, offset) {
    debug('mmap', addr, length, prot, flags, fd, offset);
    return sys.syscall64(defs.syscalls.mmap, addr, length, prot, flags, fd, offset);
}
exports.mmap = mmap;
// ### munmap
//
// In `libc`:
//
//     int munmap(void *addr, size_t length);
//
function munmap(addr, length) {
    debug('munmap', sys.addr64(addr), length);
    return sys.syscall(defs.syscalls.munmap, addr, length);
}
exports.munmap = munmap;
// ### shmget
// 
//     shmget(key: number, size: number, shmflg: defs.IPC|defs.FLAG): number
//
// Allocates a shared memory segment. `shmget()` returns the identifier of the shared memory segment associated with the
// value of the argument key. A new shared memory segment, with size equal to the value of size rounded up to a multiple
// of `PAGE_SIZE`, is created if key has the value `IPC.PRIVATE` or key isn't `IPC.PRIVATE`, no shared memory segment
// corresponding to key exists, and `IPC.CREAT` is specified in `shmflg`.
// 
// In `libc`:
// 
//     int shmget (key_t key, int size, int shmflg);
//
// Reference:
// 
//  - http://linux.die.net/man/2/shmget
// 
// Returns:
// 
//  - If positive: identifier of the shared memory block.
//  - If negative: `errno` =
//    - `EINVAL` -- Invalid segment size specified
//    - `EEXIST` -- Segment exists, cannot create
//    - `EIDRM` -- Segment is marked for deletion, or was removed
//    - `ENOENT` -- Segment does not exist
//    - `EACCES` -- Permission denied
//    - `ENOMEM` -- Not enough memory to create segment
/**
 * @param key {number}
 * @param size {number}
 * @param shmflg {IPC|FLAG} If shmflg specifies both IPC_CREAT and IPC_EXCL and a shared memory segment already exists
 *      for key, then shmget() fails with errno set to EEXIST. (This is analogous to the effect of the combination
 *      O_CREAT | O_EXCL for open(2).)
 * @returns {number} `shmid` -- ID of the allocated memory, if positive.
 */
function shmget(key, size, shmflg) {
    debug('shmget', key, size, shmflg);
    return sys.syscall(defs.syscalls.shmget, key, size, shmflg);
}
exports.shmget = shmget;
// ### shmat`
//
//     shmat(shmid: number, shmaddr: number = defs.NULL, shmflg: defs.SHM = 0): [number, number]
//
// Attaches the shared memory segment identified by shmid to the address space of the calling process.
// 
// In `libc`:
// 
//     void *shmat(int shmid, const void *shmaddr, int shmflg);
// 
// Reference:
// 
//  - http://linux.die.net/man/2/shmat
//
// Returns:
//
//  - On success shmat() returns the address of the attached shared memory segment; on error (void *) -1
//  is returned, and errno is set to indicate the cause of the error.
/**
 * @param shmid {number} ID returned by `shmget`.
 * @param shmaddr {number} Optional approximate address where to allocate memory, or NULL.
 * @param shmflg {SHM}
 * @returns {number}
 */
function shmat(shmid, shmaddr, shmflg) {
    if (shmaddr === void 0) { shmaddr = defs.NULL; }
    if (shmflg === void 0) { shmflg = 0; }
    debug('shmat', shmid, shmaddr, shmflg);
    return sys.syscall64(defs.syscalls.shmat, shmid, shmaddr, shmflg);
}
exports.shmat = shmat;
// ### shmdt
//
// Detaches the shared memory segment located at the address specified by shmaddr from the address space of the calling
// process. The to-be-detached segment must be currently attached with shmaddr equal to the value returned by the
// attaching shmat() call.
//
// In `libc`:
//
//      int shmdt(const void *shmaddr);
//
// Reference:
//
//  - http://linux.die.net/man/2/shmat
/**
 * @param shmaddr {number}
 * @returns {number} On success shmdt() returns 0; on error -1 is returned, and errno is set to indicate the cause of the error.
 */
function shmdt(shmaddr) {
    debug('shmdt', shmaddr);
    return sys.syscall(defs.syscalls.shmdt, shmaddr);
}
exports.shmdt = shmdt;
/**
 * Performs the control operation specified by cmd on the shared memory segment whose identifier is given in shmid.
 *
 * In `libc`:
 *
 *      int shmctl(int shmid, int cmd, struct shmid_ds *buf);
 *
 * Reference:
 *
 *  - http://linux.die.net/man/2/shmctl
 *
 * @param shmid {number}
 * @param cmd {defs.IPC|defs.SHM}
 * @param buf {Buffer|defs.shmid_ds|defs.NULL} Buffer of size `defs.shmid_ds.size` where kernel will write reponse, or
 *      `defs.shmid_ds` structure that will be serialized for kernel to read data from, or 0 if no argument needed.
 * @returns {number} A successful IPC_INFO or SHM_INFO operation returns the index of the highest used entry in the
 *      kernel's internal array recording information about all shared memory segments. (This information can be used
 *      with repeated SHM_STAT operations to obtain information about all shared memory segments on the system.) A
 *      successful SHM_STAT operation returns the identifier of the shared memory segment whose index was given in
 *      shmid. Other operations return 0 on success. On error, -1 is returned, and errno is set appropriately.
 */
function shmctl(shmid, cmd, buf) {
    if (buf === void 0) { buf = defs.NULL; }
    debug('shmctl', shmid, cmd, buf instanceof Buffer ? '[Buffer]' : buf);
    if (buf instanceof Buffer) {
    }
    else if (typeof buf === 'object') {
        // User provided `defs.shmid_ds` object, so we serialize it.
        buf = defs.shmid_ds.pack(buf);
    }
    else {
    }
    return sys.syscall(defs.syscalls.shmctl, shmid, cmd, buf);
}
exports.shmctl = shmctl;
