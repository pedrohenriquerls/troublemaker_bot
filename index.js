const Slackbot = require('slackbots');
const axios = require('axios');
const restify = require('restify');

const bot = new Slackbot({
  token: 'xoxb-707123959318-704993216373-1WRU6JsObSJQwWU4LsgCPdNT',
  name: 'githubissuebot'
});

bot.on('start', function() {
  console.log('slackbot running...');
});
bot.on('error', err => console.log(err));

const server = restify.createServer();
server.get('/ping', function(req, res, next){
  res.send('pong');
  next();
});
server.post('/github/webhook', (req, res, next) => {
  //console.log('request params', req.body);
  const githubJson = JSON.parse(req.body.payload);
  const issue = githubJson.issue;
  const action = githubJson.action;
  const { user, title, body, url, labels } = issue;
  const formattedLabels = labels.map((label) => label.name).join('\n');

  if (action === 'opened') {
    const messageParams = {
      'slackbot': 'true',
      "attachments": [
        {
          "pretext": `Issue _${action}_ by <${user.html_url}|${user.login}>`,
          "title": `<${url}|${title}>`,
          "text": `${body}\n\n *Labels*\n${formattedLabels}`,
          "mrkdwn_in": [
            "text",
            'pretext'
          ]
        }
      ]
    };

    bot.postMessageToChannel('geral', null, messageParams);
  }

  // events with labeled actions happen when the user change one label issue
  // Event with opened action happen when the use create a new issue
  // Event closed
  // Event reopened
  // body { issue: { url, title, body, labels: { name } }}
  //  bot.postMessageToChannel('channel-name', 'message');
  res.send('ok');
  next();
});

server.use(restify.plugins.bodyParser({
  requestBodyOnGet: true
}));
server.listen(3000, function() {
  console.log('%s listening at %s', server.name, server.url);
});
