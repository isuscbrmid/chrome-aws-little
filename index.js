const chromium = require('chrome-aws-lambda');
const log = require('lambda-log');


function parseEventBody (event) {
  let body = {};
  if (event.body !== null && event.body !== undefined) {
    body = (typeof event.body === 'string') ? JSON.parse(event.body) : event.body;   
  }
  log.info('body', body);
  return body;
};

exports.handler = async (event, context) => {
  log.info('event: ', event );
  const body = parseEventBody(event)
  const { data: { attributes: { html }}} = body
  log.info('body: ', body );
  let browser = null;
  let buffer = null;
  const puppeteerOptions = {
    printBackground: true,
    scale: 1
  }
  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    let page = await browser.newPage();

    await page.setContent(html)

    buffer = await page.pdf(puppeteerOptions)

  } catch (error) {
    return context.fail(error);
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
  const results = {
    id: '235325',
    mime_type: 'application/pdf',
    binary_encoding: 'base64',
    binary_stream: buffer.toString('base64')
  }
  return {
    statusCode: 200,
    headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
    },
    body: JSON.stringify({ type: 'BinarySerializer', results })
  }
};