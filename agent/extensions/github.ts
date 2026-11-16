import githubExtension from '@github-tools/eve-extension'
import { isScheduleAuth } from 'eve/schedules'

const [owner, repo] = (process.env.AGENT_REPOSITORY ?? '').split('/')

export default githubExtension({
  connector: 'github/github-agent',
  actAs: 'caller',
  preset: 'auto',
  requireApproval: 'auto',
  overrides: {
    editFiles: {
      approval: ({ session, toolInput }) => {
        const scheduled = isScheduleAuth(session.auth.current)
        const ownRepository = toolInput?.owner === owner && toolInput?.repo === repo
        const agentBranch = typeof toolInput?.branch === 'string' && toolInput.branch.startsWith('agent/')
        return scheduled && ownRepository && agentBranch ? 'not-applicable' : 'user-approval'
      },
    },
  },
})
