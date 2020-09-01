// Go here for help creating/editing query: https://developer.github.com/v4/explorer/
function getIssueQuery(search) {
	return {
		query:
        `{
            search(query: "${ search }", type: ISSUE, first: 100) {
              edges {
                node {
                  ... on Issue {
                    number
                    repository {
                      name
                      url
                    }
                    title
                    labels(first: 100) {
                      nodes {
                        name
                        updatedAt
                        url
                      }
                    }
                    assignees(first: 100) {
                      nodes {
                        login
                        name
                        url
                      }
                    }
                    author {
                      login
                        url
                    }
                    body
                    createdAt,
                    url
                  }
                }
              }
            }
          }`
	};
}

function groupIssues(issues, context) {
	const reportedNotReplied = [];
	const reportedAndReplied = [];
	const reportedNotRepliedNoAssignee = [];
	const reportedAndRepliedNoAssignee = [];

	for (const issue of issues) {
		if (issueReportedNotReplied(issue, context)) {
			reportedNotReplied.push(issue);
		} else if (issueReportedAndReplied(issue, context)) {
			reportedAndReplied.push(issue);
		} else if (issueReportedNotRepliedNoAssignee(issue, context)) {
			reportedNotRepliedNoAssignee.push(issue);
		} else if (issueReportedAndRepliedNoAssignee(issue, context)) {
			reportedAndRepliedNoAssignee.push(issue);
		} else {
			context.error(`Unable to group issue:\n${ JSON.stringify(issue, null, 2) }`);
		};
	}

	return {
		reportedNotReplied,
		reportedAndReplied,
		reportedNotRepliedNoAssignee,
		reportedAndRepliedNoAssignee
	};
}

function issueReportedNotReplied(issue, context) {
	try {
		const labels = issue.node.labels.nodes;
		const labelValues = labels.map(label => label.name.toLowerCase());
		const assignees = issue.node.assignees.nodes;
		return labelValues.includes('customer-reported') && !labelValues.includes('customer-replied-to') && assignees.length > 0;
	} catch (err) {
		context.error(err);
	}
}

function issueReportedAndReplied(issue, context) {
	try {
		const labels = issue.node.labels.nodes;
		const labelValues = labels.map(label => label.name.toLowerCase());
		const assignees = issue.node.assignees.nodes;
		return labelValues.includes('customer-reported') && labelValues.includes('customer-replied-to') && assignees.length > 0;
	} catch (err) {
		context.error(err);
	}
}

function issueReportedNotRepliedNoAssignee(issue, context) {
	try {
		const labels = issue.node.labels.nodes;
		const labelValues = labels.map(label => label.name.toLowerCase());
		const assignees = issue.node.assignees.nodes;
		return labelValues.includes('customer-reported') && !labelValues.includes('customer-replied-to') && assignees.length === 0;
	} catch (err) {
		context.error(err);
	}
}

function issueReportedAndRepliedNoAssignee(issue, context) {
	try {
		const labels = issue.node.labels.nodes;
		const labelValues = labels.map(label => label.name.toLowerCase());
		const assignees = issue.node.assignees.nodes;
		return labelValues.includes('customer-reported') && labelValues.includes('customer-replied-to') && assignees.length === 0;
	} catch (err) {
		context.error(err);
	}
}

module.exports = { getIssueQuery, groupIssues };
