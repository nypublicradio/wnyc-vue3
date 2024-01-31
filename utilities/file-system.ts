import { Filesystem, Directory, /* Encoding */ } from "@capacitor/filesystem"
import {
    useFileSystem,
    useFileSystemLS,
    useAppDirectory,
    useCurrentEpisode,
    useGlobalToast,
} from "~/composables/states"
import {
    appDirectory,
} from "~/composables/globals"
import {
    prepForPlayer,
} from "~/utilities/helpers"
import { Preferences } from "@capacitor/preferences"
const globalToast = useGlobalToast()

const directoryToSaveTo = Directory.External

export const fileNameFromURL = (url: string) => {
    let urlWithoutParams = url;
    if (url.includes('?')) {
        urlWithoutParams = url.split("?")[0];
    }
    return urlWithoutParams.substring(urlWithoutParams.lastIndexOf("/") + 1);
}

export const updateFileSystem = async () => {
    const fileSystem = useFileSystem()

    //initial check to see if the appDirectory exists and if not, create it
    await createAppDirectory()

    fileSystem.value = await Filesystem.readdir({
        path: `${appDirectory}/`,
        directory: directoryToSaveTo,
    })
        .then((val) => {
            return val ? val : []
        })
        .catch((e) => {
            console.error("Unable to read dir", e)
        })
}

const createAppDirectory = async () => {
    // initial check to see if the appDirectory exists and if not, create it
    const appDirectories = await Filesystem.readdir({
        path: "",
        directory: directoryToSaveTo,
    })

    const result = appDirectories.files.filter(
        (entry) => entry.type === "directory" && entry.name === appDirectory
    )

    if (result.length === 0) {
        await Filesystem.mkdir({
            path: `${appDirectory}`,
            directory: directoryToSaveTo,
        })
            //.then(() => { })
            .catch((e) => {
                console.error("Unable to create directory", e)
            })
    }
}

export const fetchAndStoreMp3 = async (file) => {
    if (Boolean(isAlreadyDownloaded(file))) {
        globalToast.value = {
            severity: "info",
            summary: "Already downloaded",
            life: 6000,
        }
    } else {
        const fileSystem = useFileSystem()
        const fileSystemLS = useFileSystemLS()

        // check if already downloaded

        // Fetch the MP3 file as a Blob
        const response = await fetch(file.audio)
        const mp3Blob = await response.blob()

        // Read the Blob as a data URL using FileReader
        const reader = new FileReader()
        reader.onload = async function () {
            const base64DataUrl: any = this.result
            const nameFromUrl = fileNameFromURL(file.audio)
            await Filesystem.writeFile({
                path: `${appDirectory}/${nameFromUrl}`,
                data: base64DataUrl,
                directory: directoryToSaveTo,
            })
                .then((fileURI) => {


                    //create a parralel browser local storage for this data, and bes to add it to the delete function.
                    setTimeout(async () => {
                        // slight delay is needed for the fileSystem to update
                        const thisFileSystemEntry = fileSystem.value?.files.find(
                            (entry: any) => entry.uri === fileURI.uri ? entry : null
                        )
                        console.log('thisFileSystemEntry = ', thisFileSystemEntry)
                        const filesArr: any =
                        {
                            ...file,
                            file: file.file,
                            name: nameFromUrl,
                            uri: `${directoryToSaveTo}/${appDirectory}/${nameFromUrl}`,
                            image: file.image.template,
                            size: thisFileSystemEntry?.size ?? null,
                            ctime: thisFileSystemEntry?.ctime ?? null,
                            mtime: thisFileSystemEntry?.mtime ?? null,
                        }


                        fileSystemLS.value.push(filesArr)
                        await Preferences.set({ key: "fileSystemLS", value: JSON.stringify(fileSystemLS.value) })

                        globalToast.value = {
                            severity: "success",
                            summary: "Download Complete",
                            life: 3000,
                        }
                    }, 500)
                    updateFileSystem()
                })
                .catch((e) => {
                    console.error("Unable to write file", e)
                })
        }
        reader.readAsDataURL(mp3Blob)
    }
}

// export const playMp3 = async (file: {
//     file: string
//     title: string
//     details: string
//     image: string
// }) => {
//     const currentEpisode = useCurrentEpisode()
//     currentEpisode.value = file
// }

export const playStoredMp3 = async (file) => {
    const currentEpisode = useCurrentEpisode()

    await Filesystem.readFile({
        path: `${appDirectory}/${file.name}`,
        directory: directoryToSaveTo,
    })
        .then((b64Content) => {
            console.log('file = ', file)
            // eventually we will set a Type for the current episdode
            currentEpisode.value = {
                ...file,
                image: file.image,
                audio: `data:audio/mpeg;base64,${b64Content.data}`,
                file: `data:audio/mpeg;base64,${b64Content.data}`,
            }

        })
        .catch((e) => {
            console.error("Unable to read file", e)
        })
}

export const deleteStoredMp3 = async (file) => {
    const fileSystem = useFileSystem()
    const fileSystemLS = useFileSystemLS()
    const nameFromUrl = fileNameFromURL(file.name)
    Filesystem.deleteFile({
        path: `${appDirectory}/${file.name || nameFromUrl}`,
        directory: directoryToSaveTo,
    })
        .then(() => {
            // also delete from the fileSystemLS state and local storage
            setTimeout(async () => {
                const updatedFileSystem = fileSystem.value.files.filter(
                    (entry: any) => entry.name !== (file.name || nameFromUrl)
                )

                fileSystem.value.files = updatedFileSystem

                const updatedFileSystemLS = fileSystemLS.value.filter(
                    (entry: any) => entry.name !== (file.name || nameFromUrl)
                )
                fileSystemLS.value = updatedFileSystemLS

                await Preferences.set({ key: "fileSystemLS", value: JSON.stringify(updatedFileSystem) })

                updateFileSystem()
            }, 100)
        })
        .catch((e) => {
            console.error("Unable to delete file", e)
        })
}

export const formatFileSize = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 B"

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ["B", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

// initial pull of the preferencce plugin files data

// export const initReadOfPreferences = async () => {
//     let val: any = []
//     try {
//         const { value } = await Preferences.get({ key: 'fileSystemLS' })
//         val = value ?? "[]"
//         // const val = await Preferences.get({ key: "fileSystemLS" })
//         console.log("val = ", JSON.parse(val))
//     } catch (error) {
//         console.error("preference read error = ", error)
//     }
//     return JSON.parse(val ?? '[]')
// }

export const isAlreadyDownloaded = async (file) => {
    console.log('file = ', file)
    const fileSystemLS = useFileSystemLS()
    console.log('fileSystemLS.value = ', fileSystemLS.value)
    const check = fileSystemLS.value.find(
        (entry) => entry.id === file.id
    )
    const alreadyDownloaded = check === undefined ? false : true
    console.log('alreadyDownloaded = ', alreadyDownloaded)
    return alreadyDownloaded
}
