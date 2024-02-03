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
    resizePublisherImageUrl,
} from "~/utilities/helpers"
import { Preferences } from "@capacitor/preferences"

// directory to save to in the CapacitorJS FileSystem
export const localStorageKey = "fileSystemLS"

const directoryToSaveTo = Directory.External

export const fileNameFromURL = (url: string) => {
    let urlWithoutParams = url;
    if (url.includes('?')) {
        urlWithoutParams = url.split("?")[0];
    }
    return urlWithoutParams.substring(urlWithoutParams.lastIndexOf("/") + 1);
}

export const isAlreadyDownloaded = async (file) => {
    const fileSystemLS = useFileSystemLS()
    const check = fileSystemLS.value.find(
        (entry) => entry.id === file.id
    )
    const alreadyDownloaded = check === undefined ? false : true
    console.log('alreadyDownloaded = ', alreadyDownloaded)
    return alreadyDownloaded
}


async function traverseDirectory(path) {
    let result = [];
    const files = await Filesystem.readdir({ path });

    files.files.forEach((file, index) => {
        result[index] = file;
    })
    result.forEach(async (file, index) => {
        const fullPath = `${path}/${file.name}`;
        const stats = await Filesystem.readdir({ path: fullPath });
        file.files = stats.files;
    })
    console.log('fileSystem.value =', result)
    return result;
}

export const initFileSystem = async () => {
    const fileSystem = useFileSystem()
    const fileSystemLS = useFileSystemLS()

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
    // check if already downloaded
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
        })
            .catch((e) => {
                console.error("Unable to create directory", e)
            })

        // Fetch the MP3 file as a Blob
        const mp3Response = await fetch(file.audio)
        const mp3Blob = await mp3Response.blob()

        // Fetch the IMAGE file as a Blob
        //const imgUrl = resizePublisherImageUrl(file.image.template, 288, 288, 80)
        // redirect CORS issues forced me to use the large file url
        const imgUrl = file.image.url
        const imgResponse = await fetch(imgUrl)
        const imgBlob = await imgResponse.blob()

        // Read the Image as a data URL using FileReader
        const imgReader = new FileReader()
        imgReader.onload = async function () {
            const base64DataUrl: any = this.result
            const nameFromUrl = fileNameFromURL(file.image.url)
            await Filesystem.writeFile({
                path: `${appDirectory}/${file.id}/${nameFromUrl}`,
                data: base64DataUrl,
                directory: directoryToSaveTo,
            })
                .then((fileURI) => {
                    console.log('image saved =', base64DataUrl)
                })
                .catch((e) => {
                    console.error("Unable to write file", e)
                })
        }
        imgReader.readAsDataURL(mp3Blob)


        // Read the Blob as a data URL using FileReader
        const mp3Reader = new FileReader()
        mp3Reader.onload = async function () {
            const base64DataUrl: any = this.result
            const nameFromUrl = fileNameFromURL(file.audio)
            await Filesystem.writeFile({
                path: `${appDirectory}/${file.id}/${nameFromUrl}`,
                data: base64DataUrl,
                directory: directoryToSaveTo,
            })
                .then((fileURI) => {

                    //create a parralel browser local storage for this data, and bes to add it to the delete function.
                    setTimeout(async () => {
                        // slight delay is needed for the fileSystem to update
                        const thisFileSystemEntry = fileSystem.value?.find(
                            (entry: any) => entry.uri === fileURI.uri ? entry : null
                        )
                        const filesArr: any =
                        {
                            ...file,
                            name: nameFromUrl,
                            uri: `${directoryToSaveTo}/${appDirectory}/${file.id}/${nameFromUrl}`,

                        }
                        // add it to the list
                        fileSystemLS.value.push(filesArr)
                        // save to local storage
                        await Preferences.set({ key: localStorageKey, value: JSON.stringify(fileSystemLS.value) })

                        const globalToast = useGlobalToast()
                        globalToast.value = {
                            severity: "success",
                            summary: "Download Complete",
                            life: 3000,
                        }
                        updateFileSystem()
                        console.log('audio saved =', base64DataUrl)

                    }, 500)
                })
                .catch((e) => {
                    console.error("Unable to write file", e)
                })
        }
        mp3Reader.readAsDataURL(mp3Blob)
    }
}

// async function downloadFile(url, path) {
//     const response = await fetch(url);
//     const blob = await response.blob();
//     const result = await Filesystem.writeFile({
//         path: `${appDirectory}/${path}`,
//         data: blob,
//         directory: FilesystemDirectory.Documents
//     })
//         .then((fileURI) => {
//             return result;
//         })
//         .catch((e) => {
//             console.error("Unable to write file", e)
//         })
// }

export const fetchAndStoreMp3Orig = async (file) => {
    const alreadyDownloaded = await isAlreadyDownloaded(file)
    // check if already downloaded
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
                        const filesArr: any =
                        {
                            ...file,
                            name: nameFromUrl,
                            uri: `${directoryToSaveTo}/${appDirectory}/${nameFromUrl}`,
                            size: thisFileSystemEntry?.size ?? null,
                            ctime: thisFileSystemEntry?.ctime ?? null,
                            mtime: thisFileSystemEntry?.mtime ?? null,
                        }
                        // add it to the list
                        fileSystemLS.value.push(filesArr)
                        // save to local storage
                        await Preferences.set({ key: localStorageKey, value: JSON.stringify(fileSystemLS.value) })

                        const globalToast = useGlobalToast()
                        globalToast.value = {
                            severity: "success",
                            summary: "Download Complete",
                            life: 3000,
                        }
                        updateFileSystem()
                    }, 500)
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

function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

export const playStoredMp3 = async (file) => {
    const currentEpisode = useCurrentEpisode()
    file = prepForPlayer(file)
    await Filesystem.readFile({
        path: `${appDirectory}/${file.id}/${file.name}`,
        directory: directoryToSaveTo,
    })
        .then((b64Content) => {
            const arrayBuffer = base64ToArrayBuffer(b64Content.data);
            const blob = new Blob([arrayBuffer], { type: "audio/mpeg" })
            var url = URL.createObjectURL(blob)
            console.log('url = ', url)
            // eventually we will set a Type for the current episode
            currentEpisode.value = {
                ...file,
                //file: `data:audio/mpeg;base64,${b64Content.data}`,
                file: url,
            }

        })
        .catch((e) => {
            console.error("Unable to read file", e)
        })
}

export const generateAudioBlobUrl = async (file) => {
    try {
        const b64Content = await Filesystem.readFile({
            path: `${appDirectory}/${file.id}/${file.name}`,
            directory: directoryToSaveTo,
        });
        const arrayBuffer = base64ToArrayBuffer(b64Content.data);
        const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
        var url = URL.createObjectURL(blob);
        console.log('generated url =', url)
        return url;
    } catch (e) {
        console.error("Unable to read file", e);
    }
};

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

                await Preferences.set({ key: localStorageKey, value: JSON.stringify(updatedFileSystem) })

                updateFileSystem()
            }, 100)
        })
        .catch((e) => {
            console.error("Unable to delete file", e)
        })
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

                await Preferences.set({ key: localStorageKey, value: JSON.stringify(updatedFileSystemLS) })

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

export const initReadOfPreferences = async () => {
    let val: any = []
    try {
        const { value } = await Preferences.get({ key: 'fileSystemLS' })
        val = value ?? "[]"
    } catch (error) {
        console.error("preference read error = ", error)
    }
    return JSON.parse(val ?? '[]')
}

