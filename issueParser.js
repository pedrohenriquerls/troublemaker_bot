module.exports = function parseGithubIssue(payload) {
  const issue = payload.issue;
  const action = payload.action;

  const { user, title, body, url, labels, number } = issue;
  const { html_url, avatar_url, login } = user;

  // TODO improve the body formatter https://api.slack.com/tools/block-kit-builder
  const message = {
    'slackbot': 'true',
    'attachments': [
      {
        pretext: parsePretext(issue, action),
        color: '#36a64f',
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
  const formattedBody = body;
  return `${formattedBody}\n\n *Labels*\n${formattedLabels}`;
}

function formatLabels(labels) {
  return labels.map((label) => label.name).join('\n');
}
