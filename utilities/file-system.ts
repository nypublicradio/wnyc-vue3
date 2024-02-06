import { Filesystem, Directory /* Encoding */ } from "@capacitor/filesystem"
import {
    useFileSystem,
    useFileSystemLS,
    useAppDirectory,
    useCurrentEpisode,
    useGlobalToast,
    useTogglePlayTrigger,
} from "~/composables/states"
import { appDirectory } from "~/composables/globals"
import { prepForPlayer, resizePublisherImageUrl, saveRecentlyPlayed } from "~/utilities/helpers"
import { Preferences } from "@capacitor/preferences"

// directory to save to in the CapacitorJS FileSystem
export const localStorageKey = "fileSystemLS"

const directoryToSaveTo = Directory.External

export const fileNameFromURL = (url: string) => {
    let urlWithoutParams = url
    if (url.includes("?")) {
        urlWithoutParams = url.split("?")[0]
    }
    return urlWithoutParams.substring(urlWithoutParams.lastIndexOf("/") + 1)
}

export const isAlreadyDownloaded = async (file) => {
    const fileSystemLS = useFileSystemLS()
    const check = fileSystemLS.value.find((entry) => entry.id === file.id)
    const alreadyDownloaded = check === undefined ? false : true
    return alreadyDownloaded
}

async function traverseDirectory(path) {
    let result = []
    const files = await Filesystem.readdir({ path })

    files.files.forEach((file, index) => {
        result[index] = file
    })
    result.forEach(async (file, index) => {
        const fullPath = `${path}/${file.name}`
        const stats = await Filesystem.readdir({ path: fullPath })
        file.files = stats.files
    })
    return result
}

const requestPermissions = async () => {
    try {
        const status = await Filesystem.requestPermissions()
        if (status.hasPermission) {
            console.log("Permission granted")
        } else {
            console.log("Permission denied")
        }
    } catch (error) {
        console.error("Failed to request permissions", error)
    }
}

export const initFileSystem = async () => {
    const fileSystem = useFileSystem()
    const fileSystemLS = useFileSystemLS()

    // request permissions
    await requestPermissions()

    //initial check to see if the appDirectory exists and if not, create it
    await createAppDirectory()

    fileSystem.value = await traverseDirectory(`${directoryToSaveTo}/${appDirectory}`)
    fileSystemLS.value = await initReadOfPreferences()
}

export const updateFileSystem = async () => {
    const fileSystem = useFileSystem()

    fileSystem.value = await traverseDirectory(`${directoryToSaveTo}/${appDirectory}`)
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
    const alreadyDownloaded = await isAlreadyDownloaded(file)
    // check if already downloaded and alert the user
    if (alreadyDownloaded) {
        const globalToast = useGlobalToast()
        globalToast.value = {
            severity: "info",
            summary: "Already downloaded",
            life: 6000,
        }
    } else {
        const fileSystem = useFileSystem()
        const fileSystemLS = useFileSystemLS()

        // create the directory
        await Filesystem.mkdir({
            path: `${appDirectory}/${file.id}`,
            directory: directoryToSaveTo,
        }).catch((e) => {
            console.error("Unable to create directory", e)
        })

        // Fetch the IMAGE file as a Blob
        const imgUrl = resizePublisherImageUrl(file.image.template, 288, 288, 80)
        const imgUrlAlt = file.image.url
        let imgResponse;

        // try catch to use the alt image if the primary image fails... CORS is the problem locally
        try {
            imgResponse = await fetch(imgUrl);
        } catch (error) {
            console.log('Error fetching primary image: ', error);
            imgResponse = await fetch(imgUrlAlt);
        }
        const imgBlob = await imgResponse.blob()

        // Convert the blob to a base64 string
        const reader = new FileReader()
        reader.onloadend = async function () {
            const base64String = reader.result.split(",")[1]
            const base64Format = reader.result.split(",")[0]

            // Save the base64 string
            const nameFromUrl = fileNameFromURL(file.image.url)
            await Filesystem.writeFile({
                path: `${appDirectory}/${file.id}/${nameFromUrl}`,
                data: base64String,
                directory: directoryToSaveTo,
            })
                .then((fileURI) => {
                    console.log("image saved")
                })
                .catch((e) => {
                    console.error("Unable to write file", e)
                })
        }
        reader.readAsDataURL(imgBlob)

        // Fetch the MP3 file as a Blob
        const mp3Response = await fetch(file.audio)
        const mp3Blob = await mp3Response.blob()

        // Read the Blob as a data URL using FileReader
        const mp3Reader = new FileReader()
        mp3Reader.onloadend = async function () {
            const base64String = mp3Reader.result.split(",")[1]
            const nameFromUrl = fileNameFromURL(file.audio)
            await Filesystem.writeFile({
                path: `${appDirectory}/${file.id}/${nameFromUrl}`,
                data: base64String,
                directory: directoryToSaveTo,
            })
                .then(async (fileURI) => {
                    //create a parralel browser local storage for this data, and bes to add it to the delete function.
                    await updateFileSystem()
                    setTimeout(async () => {
                        // slight delay is needed for the fileSystem to update

                        const thisFileSystemEntry = fileSystem.value?.find((entry: any) =>
                            `${entry.uri}/${nameFromUrl}` === fileURI.uri ? entry : null
                        )
                        // find the image
                        const directoryImage = thisFileSystemEntry.files.find((entry) => {
                            const mainString = entry.name
                            const subStrings = [".jpg", ".jpeg", ".png", ".gif", ".webp"]

                            return subStrings.some((substring) => mainString.includes(substring))
                        })
                        //find the audio
                        const directoryAudio = thisFileSystemEntry.files.find((entry) => {
                            const mainString = entry.name
                            const subStrings = [".mp3"]

                            return subStrings.some((substring) => mainString.includes(substring))
                        })
                        //append directory,image and aduio to the file object
                        const newFile: any = {
                            ...file,
                            directory: thisFileSystemEntry,
                            directoryImage: directoryImage,
                            directoryAudio: directoryAudio,
                        }
                        // add it to the list
                        fileSystemLS.value.push(newFile)
                        // save to local storage, selay needed for some reason
                        setTimeout(async () => {
                            await Preferences.set({
                                key: localStorageKey,
                                value: JSON.stringify(fileSystemLS.value),
                            })
                        }, 500)

                        // alert the user
                        const globalToast = useGlobalToast()
                        globalToast.value = {
                            severity: "success",
                            summary: "Download Complete",
                            life: 3000,
                        }

                    }, 500)
                })
                .catch((e) => {
                    console.error("Unable to write file", e)
                })
        }
        mp3Reader.readAsDataURL(mp3Blob)
    }
}

function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64)
    const len = binaryString.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes.buffer
}

export const playStoredMp3 = async (file) => {
    const currentEpisode = useCurrentEpisode()
    const togglePlayTrigger = useTogglePlayTrigger()

    if (currentEpisode.value?.directoryAudio.name !== file.directoryAudio.name) {
        file = prepForPlayer(file)
        // if image is found, return it as base64
        try {
            const b64Content = await Filesystem.readFile({
                path: `${appDirectory}/${file.id}/${file.directoryAudio.name}`,
                directory: directoryToSaveTo,
            })

            currentEpisode.value = {
                ...file,
                file: `data:audio/mpeg;base64,${b64Content.data}`,
            }
            togglePlayTrigger.value = !togglePlayTrigger.value
        } catch (e) {
            console.error("Unable to read file", e)
        }
        //saveRecentlyPlayed(file, file.type)
    }

    togglePlayTrigger.value = !togglePlayTrigger.value

}

export const getDownloadedImageBase64 = async (file) => {
    // find image in directory/files
    const fileName = file.directoryImage.name
    const base64Type = fileName.split('.').pop();

    try {
        const b64Content = await Filesystem.readFile({
            path: `${appDirectory}/${file.id}/${fileName}`,
            directory: directoryToSaveTo,
        })
        //console.log('b64Content.data =', b64Content.data)
        return `data:image/${base64Type};base64,${b64Content.data}`
    } catch (e) {
        console.error("Unable to read file", e)
    }
}

export const generateAudioBlobUrl = async (file) => {
    try {
        const b64Content = await Filesystem.readFile({
            path: `${appDirectory}/${file.id}/${file.name}`,
            directory: directoryToSaveTo,
        })
        const arrayBuffer = base64ToArrayBuffer(b64Content.data)
        const blob = new Blob([arrayBuffer], { type: "audio/mpeg" })
        var url = URL.createObjectURL(blob)
        console.log("generated url =", url)
        return url
    } catch (e) {
        console.error("Unable to read file", e)
    }
}

export const deleteDirectory = async (file) => {
    const fileSystem = useFileSystem()
    const fileSystemLS = useFileSystemLS()
    Filesystem.rmdir({
        path: `${appDirectory}/${file.id}`,
        directory: directoryToSaveTo,
        recursive: true,
    })
        .then(() => {
            // also delete from the fileSystemLS state and local storage
            setTimeout(async () => {
                const updatedFileSystemLS = fileSystemLS.value.filter(
                    (entry: any) => entry.id !== file.id
                )
                fileSystemLS.value = updatedFileSystemLS

                await Preferences.set({
                    key: localStorageKey,
                    value: JSON.stringify(updatedFileSystemLS),
                })

                updateFileSystem()
            }, 100)
        })
        .catch((e) => {
            console.error("Unable to delete file", e)
        })
}

export const deleteAll = async (file) => {
    const fileSystem = useFileSystem()
    const fileSystemLS = useFileSystemLS()
    Filesystem.rmdir({
        path: `${appDirectory}`,
        directory: directoryToSaveTo,
        recursive: true,
    })
        .then(() => {
            // also delete from the fileSystemLS state and local storage
            setTimeout(async () => {

                fileSystemLS.value = []

                await Preferences.set({
                    key: localStorageKey,
                    value: JSON.stringify([]),
                })

                initFileSystem()
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

export const initReadOfPreferences = async () => {
    let val: any = []
    try {
        const { value } = await Preferences.get({ key: "fileSystemLS" })
        val = value ?? "[]"
    } catch (error) {
        console.error("preference read error = ", error)
    }
    return JSON.parse(val ?? "[]")
}
