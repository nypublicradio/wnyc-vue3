import format from 'date-fns/format'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { useFileSystem, useAppDirectory, useCurrentEpisode } from '~/composables/states'

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













export const fileNameFromURL = (url: string) => {
  return url.substring(url.lastIndexOf('/') + 1);
}

export const readStoreDir = async () => {
  const appDirectory = useAppDirectory()
  const fileSystem = useFileSystem()

  //nitial check to see if the appDirectory exists and if not, create it
  await createAppDirectory()

  try {
    fileSystem.value = await Filesystem.readdir({
      path: `${appDirectory.value}/`,
      directory: Directory.Data,
    })
  } catch (e) {
    console.error('Unable to read dir', e);
  }

}

const createAppDirectory = async () => {
  // initial check to see if the appDirectory exists and if not, create it
  const appDirectory = useAppDirectory()
  const appDirectories = await Filesystem.readdir({
    path: '',
    directory: Directory.Data,
  })

  const result = appDirectories.files.filter(entry => entry.type === 'directory' && entry.name === appDirectory.value);

  if (result.length === 0) {
    try {
      await Filesystem.mkdir({
        path: `${appDirectory.value}`,
        directory: Directory.Data
      })
    } catch (e) {
      console.error('Unable to create directory', e);
    }
  }
}

export const fetchAndStoreMp3 = async (file: { file: string; title: string; details: string; image: string }) => {

  const appDirectory = useAppDirectory()

  // Fetch the MP3 file as a Blob
  const response = await fetch(file.file);
  const mp3Blob = await response.blob();

  // Read the Blob as a data URL using FileReader
  const reader = new FileReader();
  reader.onload = async function () {
    const base64DataUrl: any = this.result;

    try {
      await Filesystem.writeFile({
        path: `${appDirectory.value}/${fileNameFromURL(file.file)}`,
        data: base64DataUrl,
        directory: Directory.Data,
      })
      readStoreDir()
    } catch (e) {
      console.error('Unable to write file', e);
    }
  };
  reader.readAsDataURL(mp3Blob);
  return
}

export const playMp3 = async (file: { file: string; title: string; details: string; image: string }) => {
  const currentEpisode = useCurrentEpisode()
  currentEpisode.value = file
}
export const playStoredMp3 = async (file: { name: string; uri: string }) => {
  console.log('file = ', file)
  const currentEpisode = useCurrentEpisode()
  const appDirectory = useAppDirectory()
  try {
    const b64Content = await Filesystem.readFile({
      path: `${appDirectory.value}/${file.name}`,
      directory: Directory.Data,
    })

    // details and image are hard coded right now
    currentEpisode.value = {
      title: file.name,
      file: `data:audio/mpeg;base64,${b64Content.data}`,
      details: '<p>This is a sample description for this audio file</p>',
      image: 'https://media.wnyc.org/i/448/448/l/80/2020/10/atc.jpg',
    }
  } catch (e) {
    console.error('Unable to read file', e);
  }
}

export const deleteStoredMp3 = async (file: { file: string; title: string; details: string; image: string; name: string; uri: string }) => {
  const appDirectory = useAppDirectory()
  console.log('FILE =  ', file)
  try {
    Filesystem.deleteFile({
      path: `${appDirectory.value}/${file.name || fileNameFromURL(file.file)}`,
      directory: Directory.Data,
    })
    setTimeout(() => {
      readStoreDir()
    }, 100)
  } catch (e) {
    console.error(`Unable to delete file}`, e);
  }

}

export const formatFileSize = (bytes: number, decimals: number = 2) => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
