const commandLineArgs = require('command-line-args');
const getUsage = require('command-line-usage')
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const {optionDefinitions, usageDefinitions} = require('./option-definitions');

const options = commandLineArgs(optionDefinitions);

if (options.help) {
  console.log(getUsage(usageDefinitions));
  process.exit(1);
}

const allowFileTypes = ['.mov'];
const outputFormat = `.${options.format}`;
const clipLengthThreshold = options.threshold;
const dirPath = options.input;
const outputSize = options.size;

console.log('Input path: ', dirPath);
console.log('Output format: ', outputFormat);
console.log('Output size: ', outputSize);
console.log('Threshold: ', clipLengthThreshold);

fs.readdir(dirPath, function (err, files) {
  if (err) {
    console.error("Could not list the directory.", err);
    process.exit(1);
  }

  files.forEach(function (file, index) {
    let filePath = path.join(dirPath, file);
    let extname = path.extname(filePath);
    let dirName = path.dirname(filePath).split(path.sep).pop();

    if (!allowFileTypes.includes(extname)) return false;

    ffmpeg.ffprobe(filePath, function(err, metadata) {
      let { duration, tags: { creation_time } } = metadata.format;
      let filenamePrefix = `${dirName}-${+new Date(creation_time)}`;
      duration = Number(duration);

      let count = Math.ceil(duration / clipLengthThreshold);
      let eachDuration = duration / count;

      for(let i = 0; i < count; i++) {
        let suffix = count === 1 ? '' : `-${i+1}`;
        let outputFilename = `${filenamePrefix}${suffix}${outputFormat}`;

        ffmpeg(filePath)
          .size(outputSize)
          .seekInput(eachDuration * i)
          .duration(eachDuration)
          .save(path.join(dirPath, outputFilename))
          .on('error', err => console.error(err))
          .on('end', () => {
            let { duration, size } = arguments[1].format;
            console.log(`${(size / 1024 / 1024).toFixed(1)}M ${Math.ceil(duration)}s ${outputFilename}`)
          });
      }
    });
  });
});