# Video Batch Converter
Resize and convert videos in batches. Using node.js to replace my hard-to-maintain shell script.

```
node index.js [directory]
```

### Options
| Options | Description  |  Type  | Default value |
| -------------------- | ------------ | ------------   | ------------ |
| `-t, --threshold` | The video will split evenly when its duration is greater than the threshold. Threshold value in second. |  *number*  | 300 |
| `-f, --format` | The output format of the videos. |  *string*  | mp4 |
| `-s, --size` | The output converted size of the videos. |  *string*  | 480x? |
| `-i, --input` | The input directory to process. |  *directory*  | N/A |
| `-h, --help ` | Print this usage guide. |  N/A  | N/A |
