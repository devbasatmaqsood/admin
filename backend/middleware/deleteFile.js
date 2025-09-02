const fs = require("fs");
exports.deleteFile = (file) => {
  if (file && fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }
};
exports.deleteFiles = function (files) {
  if (!Array.isArray(files)) {
    console.error("Expected an array but received:", typeof files, files);
    return; // Or handle this case appropriately
  }

  files.forEach((file) => {
    try {
      this.deleteFile(file);
    } catch (err) {
      console.error("Error deleting file:", file, err);
    }
  });
};

exports.deleteFilePath = (file) => {
  if (file && fs.existsSync(file)) {
    fs.unlinkSync(file);
  }
};
exports.deleteFilesPath = (files) => {
  files.forEach((file) => this.deleteFilePath(file));
};
