import ffmpeg from 'fluent-ffmpeg';
   import ffmpegPath from '@ffmpeg-installer/ffmpeg';

   ffmpeg.setFfmpegPath(ffmpegPath.path);

   // Video paths - update with your own video locations
   const videos = [
     // Example: { input: './public/demo-images/video1.mp4', output: './public/demo-images/thumbs/video1.jpg' },
   ];

   videos.forEach(({ input, output }) => {
     ffmpeg(input)
       .screenshots({
         timestamps: ['2'],
         filename: output.split('/').pop(),
         folder: output.substring(0, output.lastIndexOf('/')),
         size: '600x?'
       })
       .on('end', () => console.log(`✅ Created: ${output}`))
       .on('error', (err) => console.error(`❌ Error: ${err.message}`));
   });