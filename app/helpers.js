



//Populates an array of file path references based on dir parameter
//Mutates the passed fileList array parameter, also returns it
var getFilePaths = (dir, filelist) => {
    var path = path || require('path');
    var fs = fs || require('fs'),
        files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach( file => {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            filelist = getFilePaths(path.join(dir, file), filelist);
        }
        else {
            filelist.push(path.join(dir, file));
        }
    });
    return filelist;
};

module.exports = {
    getFilePaths: getFilePaths
};

