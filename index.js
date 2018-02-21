const commandLineArgs = require('command-line-args');
const getUsage = require('command-line-usage');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const { optionDefinitions, usageDefinitions } = require('./option-definitions');

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

function temp() {
  fs.readdir(dirPath, function(err, files) {
    if (err) {
      console.error('Could not list the directory.', err);
      process.exit(1);
    }

    files.forEach(function(file, index) {
      if (!allowFileTypes.includes(path.extname(file))) return false;

      let filePath = path.join(dirPath, file);
      let dirName = path
        .dirname(filePath)
        .split(path.sep)
        .pop();

      ffmpeg.ffprobe(filePath, function(err, metadata) {
        let { duration, tags: { creation_time } } = metadata.format;
        let filenamePrefix = `${dirName}-${+new Date(creation_time)}`;
        duration = Number(duration);

        let count = Math.ceil(duration / clipLengthThreshold);
        let eachDuration = duration / count;

        for (let i = 0; i < count; i++) {
          let suffix = count === 1 ? '' : `-${i + 1}`;
          let outputFilename = `${filenamePrefix}${suffix}${outputFormat}`;
          let seekInput = eachDuration * i;
          let outputPath = path.join(dirPath, outputFilename);

          ffmpeg(filePath)
            .size(outputSize)
            .seekInput(seekInput)
            .duration(eachDuration)
            .save(outputPath)
            .on('error', err => console.error(err))
            .on('end', () => {
              console.log(`done: ${outputFilename}`);
            });
        }
      });
    });
  });
}

async function main() {
  const list = await readFiles(dirPath);
  let i = 0;

  (function next() {
    let videoInfo = list[i++];
    if (videoInfo) {
      console.log('Video Info', videoInfo);
      cutVideo(videoInfo, next);
    }
  })();
}

main();

function readFiles(dirPath) {
  return new Promise((res, rej) => {
    let j = 0;
    const list = [];
    fs.readdir(dirPath, function(err, files) {
      if (err) {
        console.error('Could not list the directory.', err);
        process.exit(1);
      }
      (function next() {
        let file = files[j++];
        if (!file) {
          res(list);
          return false;
        }
        if (!allowFileTypes.includes(path.extname(file))) {
          next();
          return false;
        }

        let filePath = path.join(dirPath, file);
        let dirName = path
          .dirname(filePath)
          .split(path.sep)
          .pop();

        ffmpeg.ffprobe(filePath, function(err, metadata) {
          if (err) {
            console.error(err);
            process.exit(1);
          }

          let { duration, tags: { creation_time } } = metadata.format;
          let filenamePrefix = `${dirName}-${+new Date(creation_time)}`;
          duration = Number(duration);

          let count = Math.ceil(duration / clipLengthThreshold);
          let eachDuration = Math.ceil(duration / count);

          for (let i = 0; i < count; i++) {
            let suffix = count === 1 ? '' : `-${i + 1}`;
            let outputFilename = `${filenamePrefix}${suffix}${outputFormat}`;
            let seekInput = eachDuration * i;
            let outputPath = path.join(dirPath, outputFilename);

            list.push({ filePath, outputSize, seekInput, eachDuration, outputPath, outputFilename });
          }
          next();
        });
      })();
    });
  });
}

function cutVideo({ filePath, outputSize, seekInput, eachDuration, outputPath, outputFilename }, next) {
  ffmpeg(filePath)
    .size(outputSize)
    .seekInput(seekInput)
    .duration(eachDuration)
    .save(outputPath)
    .on('error', err => console.error(err))
    .on('end', () => {
      console.log(`done: ${outputFilename}`);
      next();
    });
}
