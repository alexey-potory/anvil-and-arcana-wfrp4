import fs from "fs-extra";

function trimSrc(path) {
    const prefix = 'src/';
    if (path.startsWith(prefix)) {
        return path.slice(prefix.length);
    }
    return path;
}

export function copySrcFolder(name) {

    const path = require('path');

    const subdir = trimSrc(name);
    const dest = path.resolve(__dirname, `dist/${subdir}`);

    fs.ensureDirSync(dest);
    fs.copySync(name, dest);
}

export function copySrcFile(name) {
    const path = require('path');

    const subpath = trimSrc(name);
    const dest = path.resolve(__dirname, `dist/${subpath}`);

    // Ensure the parent directory of the destination file exists
    fs.ensureDirSync(path.dirname(dest));

    // Copy the file to the destination
    fs.copyFile(name, dest);
}
