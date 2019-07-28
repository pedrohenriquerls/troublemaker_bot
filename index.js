const Slackbot = require('slackbots');
const axios = require('axios');
const restify = require('restify');
const parseGithubIssue = require('./issueParser.js');
const config = require('./config.js');

const { token } = config.slack;
const bot = new Slackbot({
  token: token,
  name: 'Troublemaker'
});

bot.on('start', () => console.log('slackbot running...'));
bot.on('error', err => console.log(err));

const server = restify.createServer();
server.get('/ping', function(req, res, next){
  res.send('pong');
  next();
});

server.post('/github/webhook', (req, res, next) => {
  const issuePayload = JSON.parse(req.body.payload);
  const issue = parseGithubIssue(issuePayload);

  if (issue.action === 'opened') {
    bot.postMessageToChannel('geral', null, issue.message);
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
