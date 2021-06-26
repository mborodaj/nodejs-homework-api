
// const fs = jest.createMockFromModule('fs/promises');
// const unlink = fs('fs/promises').unlink;
// const path = require('path');

// console.log("UNLINK ", unlink);

// async function rename(oldPath, newPath) {
//     console.log("FROM PATH", oldPath);
//     const file = { filename: newPath };
//     await unlink.mockReturnValue(Promise.resolve(oldPath));
//     return await newPath;
// };

// async function mkdir(folder) {
//     console.log(folder);
//     return await folder;
// };

// async function access(path) {
//     console.log('');
//     return await false;
// };

// async function unlink(path) {
//     return await false
// };

// fs.rename = rename;
// fs.mkdir = mkdir;
// fs.access = access;
// fs.unlink = unlink;

// module.exports = fs;