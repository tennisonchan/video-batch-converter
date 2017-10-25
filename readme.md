# Video Batch Converter
Resize and convert videos in batches. Using node.js to replace my hard-to-maintain shell script.

```
node index.js [directory]
```

### Options
-t, --threshold *number*   The video will split evenly when its duration is greater than the threshold. Threshold value in second.
-f, --format *string*      The output format of the videos.
-s, --size *string*        The output converted size of the videos.
-i, --input *directory*    The input directory to process.
-h, --help               Print this usage guide.
