import { connect } from '@vercel/connect/eve'
import { defineMcpClientConnection } from 'eve/connections'
import { isScheduleAuth } from 'eve/schedules'

// eve names a Slack user `slack:<team>:<user>`. On Enterprise Grid the team part is
// the installation workspace, so compare the user part, which is unique across the org.
const userPart = (id: string) => id.trim().split(':').at(-1) ?? ''
const maintainers = new Set((process.env.MAINTAINERS ?? '').split(',').map(userPart).filter(Boolean))
const isMaintainer = (principalId: string) => principalId.startsWith('slack:') && maintainers.has(userPart(principalId))

export default defineMcpClientConnection({
  url: 'https://mcp.vercel.com',
  description: "This agent's own production activity on Vercel: Agent Runs with their traces, runtime errors and runtime logs. Read-only.",
  tools: {
    allow: ['list_agent_runs', 'get_agent_run', 'get_agent_run_trace', 'get_runtime_errors', 'get_runtime_logs'],
  },
  toolCall: {
    providedArguments: {
      teamId: () => process.env.AGENT_TEAM_ID!,
      projectId: () => process.env.AGENT_PROJECT_ID!,
    },
  },
  auth: ({ session }) => {
    const caller = session.auth.current
    if (isScheduleAuth(caller) || (caller !== null && isMaintainer(caller.principalId))) {
      // The Vercel MCP rejects app (client credentials) tokens for this connector,
      // so runs share one dedicated grant, authorized once by a maintainer.
      return connect({
        connector: 'vercel/github-agent',
        principalType: 'app',
        createSubject: () => ({ type: 'user' as const, id: 'self-review', issuer: 'self-improv-1' }),
      })
    }
    return {
      principalType: 'app',
      getToken: () => Promise.reject(new Error('Only scheduled runs and maintainers can read this agent\'s runs.')),
    }
  },
})
