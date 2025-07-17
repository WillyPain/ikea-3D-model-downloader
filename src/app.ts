import { execFile } from 'child_process'
import express from 'express';
import path from 'path';

const app = express();
const port = 3000;


app.get('/download', (req, res) => {
  const formPath = path.resolve(__dirname, 'form.html');
  res.sendFile(formPath);
});

app.get('/', (req, res) => {
  const scriptPath = path.join(__dirname, '../src/download-glb.sh');
  const tempFile = path.join(__dirname, '../temp/downloaded.glb');
  const outputFile = path.join(__dirname, '../temp/output.glb');

  const url = req.query.url as string;

  execFile(scriptPath, [url, tempFile, outputFile], (error, stdout, stderr) => {
    if (error) {
      console.error('🚨 Error:', error);
      return;
    }
    if (stderr) {
      console.error('⚠️ stderr:', stderr);
    }
    console.log('✅ stdout:', stdout);
  });
    res.setHeader('Content-Disposition', 'attachment; filename="model.glb"');
    res.sendFile(outputFile);
  });

app.listen(port, err => {
  if (err) {
    return console.error(err);
  }
  return console.log(`server is listening on ${port}`);
});