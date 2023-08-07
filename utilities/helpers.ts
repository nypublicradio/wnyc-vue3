import { format } from 'date-fns'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { useFileSystem, useAppDirectory, useCurrentEpisode, useTextSizeOption } from '~/composables/states'
import { Preferences } from '@capacitor/preferences';
import {
  NativeSettings,
  AndroidSettings,
  IOSSettings,
} from 'capacitor-native-settings'
const directoryToSaveTo = Directory.External

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
  //console.log(category, component, label)
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

  //initial check to see if the appDirectory exists and if not, create it
  await createAppDirectory()

  fileSystem.value = await Filesystem.readdir({
    path: `${appDirectory.value}/`,
    directory: directoryToSaveTo,
  }).then((val) => {
    return val
  }).catch((e) => {
    console.error('Unable to read dir', e);
  })


}

const createAppDirectory = async () => {
  // initial check to see if the appDirectory exists and if not, create it
  const appDirectory = useAppDirectory()
  const appDirectories = await Filesystem.readdir({
    path: '',
    directory: directoryToSaveTo,
  })

  const result = appDirectories.files.filter(entry => entry.type === 'directory' && entry.name === appDirectory.value);

  if (result.length === 0) {
    await Filesystem.mkdir({
      path: `${appDirectory.value}`,
      directory: directoryToSaveTo
    }).then(() => {

    }).catch((e) => {
      console.error('Unable to create directory', e);
    })
  }
}

export const fetchAndStoreMp3 = async (file: { file: string; title: string; details: string; image: string; }) => {

  const appDirectory = useAppDirectory()
  const fileSystem = useFileSystem()
  const fileSystemLS = useFileSystemLS()

  // Fetch the MP3 file as a Blob
  const response = await fetch(file.file);
  const mp3Blob = await response.blob();
  //console.log('mp3Blob = ', mp3Blob)

  // Read the Blob as a data URL using FileReader
  const reader = new FileReader();
  reader.onload = async function () {
    const base64DataUrl: any = this.result;
    await Filesystem.writeFile({
      path: `${appDirectory.value}/${fileNameFromURL(file.file)}`,
      data: base64DataUrl,
      directory: directoryToSaveTo,
    }).then(() => {
      //create a parralel browser local storage for this data, and bes to add it to the delete function.
      setTimeout(async () => {

        //await console.log('fileSystemLS = ', fileSystemLS.value)
        // slight delay is needed for the fileSystem to update
        const thisFileSystemEntry = fileSystem.value?.files.find((entry: any) => entry.name === fileNameFromURL(file.file))
        const filesArr: any = [...fileSystemLS.value, { title: file.title, file: file.file, details: file.details, image: file.image, name: fileNameFromURL(file.file), uri: `${directoryToSaveTo}/${appDirectory.value}/${fileNameFromURL(file.file)}`, size: thisFileSystemEntry.size, ctime: thisFileSystemEntry.ctime, mtime: thisFileSystemEntry.mtime }]

        fileSystemLS.value = filesArr
        await Preferences.set({ key: 'files', value: JSON.stringify(filesArr) });
      }, 500)
      readStoreDir()
    }).catch((e) => {
      console.error('Unable to write file', e);
    })
  };
  reader.readAsDataURL(mp3Blob);
}

export const playMp3 = async (file: { file: string; title: string; details: string; image: string }) => {
  const currentEpisode = useCurrentEpisode()
  currentEpisode.value = file
}

export const playStoredMp3 = async (file: { name: string; uri: string, file: string; title: string; details: string; image: string }) => {
  const currentEpisode = useCurrentEpisode()
  const appDirectory = useAppDirectory()

  await Filesystem.readFile({
    path: `${appDirectory.value}/${file.name}`,
    directory: directoryToSaveTo,
  }).then((b64Content) => {
    // eventually we will set a Type for the current episdode
    currentEpisode.value = {
      title: file.title,
      file: `data:audio/mpeg;base64,${b64Content.data}`,
      details: file.details,
      image: file.image,
    }

  }).catch((e) => {
    console.error('Unable to read file', e);
  })

}

export const deleteStoredMp3 = async (file: { file: string; title: string; details: string; image: string; name: string; uri: string }) => {
  const appDirectory = useAppDirectory()
  const fileSystemLS = useFileSystemLS()

  Filesystem.deleteFile({
    path: `${appDirectory.value}/${file.name || fileNameFromURL(file.file)}`,
    directory: directoryToSaveTo,
  }).then(async () => {
    // also delete from the fileSystemLS state and local storage
    const updatedFileSystemLS = fileSystemLS.value.filter((entry: any) => entry.name !== (file.name || fileNameFromURL(file.file)))

    fileSystemLS.value = updatedFileSystemLS
    await Preferences.set({ key: 'files', value: JSON.stringify(updatedFileSystemLS) });

    setTimeout(() => {
      readStoreDir()
    }, 100)
  }).catch((e) => {
    console.error(`Unable to delete file}`, e);
  })
}

export const formatFileSize = (bytes: number, decimals: number = 2) => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// initial pull of the preferencce plugin files data

export const initReadOfPreferences = async () => {
  let val = null
  try {
    val = await Preferences.get({ key: 'files' })
  } catch (error) {

  }
  return JSON.parse(val.value)
}

/**
 * code to calculate the correct suffix to use in the date number
 */
function getOrdinalSuffix(i) {
  const j = i % 10;
  const k = i % 100;
  if (j === 1 && k !== 11) {
    return `${i}st`;
  }
  if (j === 2 && k !== 12) {
    return `${i}nd`;
  }
  if (j === 3 && k !== 13) {
    return `${i}rd`;
  }
  return `${i}th`;
}

/**
 * to get the desired date format for the header
 */
export function getDate() {
  return format(new Date(), 'EEE, MMM do')
}

/**
 * to get the yaer for the footer in the settings 
 */
export function getYear() {
  return new Date().getFullYear();
}

/**
 * helper function to capitalize the first letter of a string
 */
export function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * helper function to change the global font size
 */
export function setFontSize(size: string) {
  //console.log('set size = ', size)
  document.documentElement.style.fontSize = size;
}

/**
 * helper function to toggle darkmode
 */
export function setDarkMode(bool: boolean) {
  bool ? document.documentElement.classList.add('style-mode-dark') : document.documentElement.classList.remove('style-mode-dark');
}

// helper function to get the pixel size from thr label
export const getTextSizePixel = (label) => {
  if (typeof label === 'string') {
    const textSizeOptions = useTextSizeOption()
    return textSizeOptions.value.find(
      (item) => item.label === label
    ).pixel
  } else {
    return label.pixel
  }
}

// set the display settings in one place
export const setDisplaySettings = (data) => {
  setFontSize(getTextSizePixel(data.text_size))
  setDarkMode(data.dark_mode)
}

// generate a random number between min and max
export const getRandomNumber = (min, max) => {
  return Math.random() * (max - min) + min
}

// will take the user to their native os system settings
export const toSystemSettings = () => {
  NativeSettings.open({
    optionAndroid: AndroidSettings.ApplicationDetails,
    optionIOS: IOSSettings.App,
  })
}