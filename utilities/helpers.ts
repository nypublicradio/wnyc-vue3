import format from 'date-fns/format'

// format ISO timestamp to return only the time
export function formatTime(date: any) {
  if (date) {
    const dateObject = new Date(date)
    return format(dateObject, 'h:mm a')
  }
  return null
}

/*
formats the url of a publisher image so it works with our design system image components
*/
export const formatPublisherImageUrl = (url) => { return url.replace("%s/%s/%s/%s", "%width%/%height%/c/%quality%") }