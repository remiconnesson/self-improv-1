import { defineSchedule } from 'eve/schedules'
import slack from '../channels/slack'

export default defineSchedule({
  cron: '0 7 * * *',
  run({ to, waitUntil, appAuth }) {
    waitUntil(
      to(slack, { channelId: process.env.REVIEW_SLACK_CHANNEL! }).send(
        'Check your production runs and runtime errors from the last 24 hours. If no run failed and no runtime error is new, call no_reply. Otherwise post one line per failure, with the run ID and the likely cause. Open nothing.',
        { auth: appAuth },
      ),
    )
  },
})
