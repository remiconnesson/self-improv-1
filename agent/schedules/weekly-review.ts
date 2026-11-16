import { defineSchedule } from 'eve/schedules'
import slack from '../channels/slack'

export default defineSchedule({
  cron: '0 8 * * 1',
  run({ to, waitUntil, appAuth }) {
    waitUntil(
      to(slack, { channelId: process.env.REVIEW_SLACK_CHANNEL! }).send(
        `Load the self-review skill and review your production runs from the last 7 days. Your source is in ${process.env.AGENT_REPOSITORY}.`,
        { auth: appAuth },
      ),
    )
  },
})
