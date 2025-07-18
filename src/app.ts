import { execFile } from 'child_process'
import express from 'express';
import path from 'path';
import https from 'https';

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


  var url = req.query.url as string;
  const filename = url.match(/[^/]+(?=\/?$)/) + ".glb";

  https.get(url, (response) => {
    let body = '';

    response.on('data', (chunk) => body += chunk);
    response.on('end', () => {
      const match = body.match(/https:\/\/[^\s"']+\.glb/g);
      if (match?.[0]) {
        url = match[0];
        console.log(url);
        execFile(scriptPath, [url, tempFile, outputFile], (error, stdout, stderr) => {
          if (error) {
            console.error('🚨 Error:', error);
            return;
          }
          if (stderr) {
            console.error('⚠️ stderr:', stderr);
          }
          console.log('✅ stdout:', stdout);
          res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
          res.sendFile(outputFile);
        });
      } else {
        res.status(404).send('No .glb found'); 
      }
    });
  }).on('error', (err) => {
    res.status(500).send('Request error: ' + err.message);
  });
});

app.listen(port, err => {
  if (err) {
    return console.error(err);
  }
  return console.log(`server is listening on ${port}`);
});


