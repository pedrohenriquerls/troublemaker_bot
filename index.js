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
  const issuePayload = req.body;
  const issue = parseGithubIssue(issuePayload);
  sendIssueToChannels(issue);

  res.send('ok');
  next();
});

const validActions = ['opened', 'reopened', 'closed'];
function sendIssueToChannels(issue) {
  const { action, message, channels } = issue;

  if (validActions.includes(issue.action)) {
    channels.forEach((channel) => {
      bot.postMessageToChannel(channel, null, message);
    });
  }
}

server.use(restify.plugins.bodyParser({
  requestBodyOnGet: true
}));
server.listen(process.env.PORT, function() {
  console.log('%s listening at %s', server.name, server.url);
});
