let optionDefinitions = [
  { name: 'threshold', alias: 't', type: Number, defaultValue: 5 * 60, description: 'The video will split evenly when its duration is greater than the threshold. Threshold value in second.' },
  { name: 'format', alias: 'f', type: String, defaultValue: 'mp4', description: 'The output format of the videos.' },
  { name: 'size', alias: 's', type: String, defaultValue: '480x?', description: 'The output converted size of the videos.' },
  { name: 'input', alias: 'i', type: String, defaultOption: true, typeLabel: '[underline]{directory}', description: 'The input directory to process.' },
  { name: 'help', alias: 'h', type: Boolean, description: 'Print this usage guide.' }
];

let usageDefinitions = [{
  header: 'Video Batch Converter',
  content: 'Resize and convert videos in batches.'
}, {
  header: 'Options',
  optionList: optionDefinitions
}];

module.exports.optionDefinitions = optionDefinitions;
module.exports.usageDefinitions = usageDefinitions;
