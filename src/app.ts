import { execFile } from 'child_process'
import express from 'express';
import path from 'path';

const app = express();
const port = 3000;

var xClientId: string | null | undefined;
async function authorize(): Promise<string | undefined> {
  var response = await fetch("https://www.ikea.com/global/assets/rotera/script-fragment-n2igtCEN.js");
  var body = await response.text();
  const match = body.match(/this\.modelBase="https:\/\/web-api\.ikea\.com",this\.key="(.*?)"/);
  if (match?.[1]) {
    return match[1];
  }
  return;
}

app.get('/download', (_, res) => {
  const formPath = path.resolve(__dirname, 'form.html');
  res.sendFile(formPath);
});

app.get('/', async (req, res) => {
  const scriptPath = path.join(__dirname, '../src/download-glb.sh');
  const tempFile = path.join(__dirname, '../temp/downloaded.glb');
  const outputFile = path.join(__dirname, '../temp/output.glb');

  var url = req.query.url as string;
  const filename = url.match(/p\/(.*?)\//) + ".glb";
  const productIdMatches = filename.match(/\d+/g);
  const productId = productIdMatches?.[productIdMatches.length - 1] ?? "-1";

  console.log(filename);
  console.log(productId);

  xClientId = await authorize();
  const  modelUrl = await getModelUrl(productId);

  execFile(scriptPath, [modelUrl, tempFile, outputFile], (error, stdout, stderr) => {
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
});

app.listen(port, err => {
  if (err) {
    return console.error(err);
  }
  return console.log(`server is listening on ${port}`);
});


async function getModelUrl(modelId: string): Promise<string> {
  const url = `https://web-api.ikea.com/au/en/rotera/data/model/${modelId}/`;
  const headers: HeadersInit = new Headers();
  headers.set("x-client-id", xClientId!);
  
  var response = await fetch(url, {headers: headers});
  var ikeaObjectData = await response.json();

  return ikeaObjectData.modelUrl;
}