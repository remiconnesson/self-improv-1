import { connect } from '@vercel/connect/eve'
import { defineMcpClientConnection } from 'eve/connections'
import { isScheduleAuth } from 'eve/schedules'

const maintainers = new Set((process.env.MAINTAINERS ?? '').split(','))

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
    if (isScheduleAuth(caller) || (caller !== null && maintainers.has(caller.principalId))) {
      // The Vercel MCP rejects app (client credentials) tokens for this connector,
      // so runs share one dedicated grant. When it's missing, the agent posts a
      // sign-in button and a maintainer authorizes it once.
      return connect({
        connector: 'vercel/github-agent',
        createSubject: () => ({ type: 'user' as const, id: 'self-review', issuer: 'self-improv-1' }),
      })
    }
    return {
      principalType: 'app',
      getToken: () => Promise.reject(new Error('Only scheduled runs and maintainers can read this agent\'s runs.')),
    }
  },
})
