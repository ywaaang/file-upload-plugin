/* eslint-disable prettier/prettier */
const path = require("path");
const glob = require("glob");
const fs = require("fs");
const formData = require("form-data");
const chalk = require("chalk");
const form = new formData();

class FileUploadPlugin {
  constructor(options) {
    this.options = options;
  }

  upload(files) {
    const { uploadUrl, params } = this.options;
    files.forEach((file, index) => {
      form.append(`file.${index}`, fs.createReadStream(file));
    })
    Object.keys(params || {}).forEach(k => {
      form.append(k, params[k]);
    });
    return new Promise((resolve, reject) => {
      form.submit(uploadUrl, err => {
        if (!err) resolve();
        else reject(err);
      })
    })
  }

  apply(compiler) {
    const { filePattern, params } = this.options;
    compiler.hooks.done.tap("file-upload-plugin", async (status) => {
      try {
        if (!this.options) {
          throw new Error("file-upload-plugin must have options");
        }
        console.log(chalk.green('Start finding the file'));
        const files = glob.sync(
          path.join(status.compilation.outputOptions.path, `./${filePattern || '*.*'}`)
        );
        console.log(chalk.blue(`A total of ${files.length} files were found`));
        console.log(chalk.green('Start uploading the file'));
        await this.upload(files);
        console.log(chalk.green('Upload file complete'));
      } catch (e) {
        throw new Error(e)
      }
    });
  }
}

module.exports = FileUploadPlugin;
