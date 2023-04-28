import format from 'date-fns/format'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { useFileSystem, useCurrentFile, useAppDirectory } from '~/composables/states'

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

export const resizePublisherImage = (url, w, h, q = 80) => {
  //https://media.wnyc.org/i/630/365/c/80/photologue/photos/brian2_630x365.jpg

  //https://media.wnyc.org/i/1860/1240/l/80/2020/10/NYPR_020819_1161_R1_silo_layers-Alison-Stewart.jpg

  const pieces = url.split('/')
  const finalUrlArr = []

  pieces.map((piece, index) => {
    if (index < 4 || index > 7) {
      finalUrlArr.push(piece)
    }
    if (index === 4) {
      finalUrlArr.push(`${w}/${h}/c/${q}`)
    }
  })
  return finalUrlArr.join('/')
}

export const trackClickEvent = (category, component, label) => {
  const { $analytics } = useNuxtApp()
  console.log(category, component, label)
  $analytics.sendEvent('click_tracking', {
    event_category: category,
    component: component,
    event_label: label,
  })
}















const readDir = async () => {
  const appDirectory = useAppDirectory()
  const fileSystem = useFileSystem()
  fileSystem.value = await Filesystem.readdir({
    path: `${appDirectory.value}`,
    directory: Directory.Documents,
  })
}

export const fetchAndStoreMp3 = async (url: string, name: string) => {


  const appDirectory = useAppDirectory()
  // initial check to see if the appDirectory exists and if not, create it
  // const appDirectories = await Filesystem.readdir({
  //   path: '',
  //   directory: Directory.Documents,
  // })

  // console.log('appDirectories = ', appDirectories)
  // const result = appDirectories.files.filter(entry => entry.type === 'directory' && entry.name === appDirectory.value);

  // console.log('result = ', result.length > 0)


  // Fetch the MP3 file as a Blob
  const response = await fetch(url);
  const mp3Blob = await response.blob();

  // Read the Blob as a data URL using FileReader
  const reader = new FileReader();
  reader.onload = async function () {
    const base64DataUrl: any = this.result;

    //localStorage.setItem('mp3DataUrl', base64DataUrl);
    await Filesystem.writeFile({
      path: `${appDirectory.value}${name}`,
      data: base64DataUrl,
      directory: Directory.Documents,
    })
    readDir()
  };
  reader.readAsDataURL(mp3Blob);
}

export const playStoredMp3 = async (name: string) => {
  const currentFile = useCurrentFile()
  const appDirectory = useAppDirectory()
  // const base64DataUrl: any = localStorage.getItem('mp3DataUrl');
  // const audioElement = new Audio(base64DataUrl);
  // audioElement.play();
  currentFile.value = await Filesystem.readFile({
    path: `${appDirectory.value}${name}`,
    directory: Directory.Documents,
  })

}