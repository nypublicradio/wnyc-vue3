export default defineEventHandler(async (event) => {
  // We fetch the raw HTML file from the server assets directory.
  // This keeps our codebase clean and separates the HTML/JS logic from the Nitro backend.
  const html = await useStorage('assets:server').getItem('widgets/ondemand_player.html')
  
  if (!html) {
    return 'Widget not found'
  }
  
  // Set the proper content type so the browser renders it as a webpage instead of text
  event.node.res.setHeader('Content-Type', 'text/html')
  
  return html
})
