const showdown = require('showdown');
const mrkdwn = require('html-to-mrkdwn');
const converter = new showdown.Converter({metadata: true});
converter.setFlavor('github');

module.exports = function parseGithubIssue(payload) {
  const issue = payload.issue;
  const action = payload.action;

  const { user, title, body, url, labels, number } = issue;
  const { html_url, avatar_url, login } = user;

  // https://api.slack.com/tools/block-kit-builder
  const message = {
    'slackbot': 'true',
    'attachments': [
      {
        pretext: parsePretext(issue, action),
        color: actionColor(action),
        author_name: login,
        author_link: html_url,
        author_icon: avatar_url,
        title: parseTitle(issue),
        title_link: url,
        text: parseBody(issue),
        mrkdwn_in: [
          'text',
          'pretext'
        ]
      }
    ]
  };

  return {
    action,
    message
  };
};

function actionColor(action) {
  switch(action) {
  case 'opened':
    return '#368da6';
  case 'reopened':
    return '#a63655';
  case 'closed':
    return '#36a64f';
  }
}

function parsePretext(issue, action) {
  const { user } = issue;
  const { html_url, login } = user;
  return `Issue _${action}_ by <${html_url}|${login}>`;
}

function parseTitle(issue) {
  const { number, title } = issue;
  return `#${number} ${title}`;
}

function parseBody(issue) {
  const { labels, body } = issue;
  const formattedLabels = formatLabels(labels);
  const bodyHtml = converter.makeHtml(body);
  const formattedBody = mrkdwn(bodyHtml).text;

  return `${formattedBody}\n\n *Labels*\n${formattedLabels}`;
}

function formatLabels(labels) {
  return labels.map((label) => label.name).join('\n');
}
