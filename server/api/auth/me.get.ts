export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  return {
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
    },
  }
})
