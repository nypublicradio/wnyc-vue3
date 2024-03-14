import { ref, nextTick } from "vue"
import { Filesystem, Directory } from "@capacitor/filesystem"
import {
    useFileSystem,
    useFileSystemLS,
    useCurrentEpisode,
    useGlobalToast,
    useTogglePlayTrigger,
    useIsApp,
    useCurrentUser
} from "~/composables/states"
import { Capacitor } from '@capacitor/core';
import { prepForPlayer, resizePublisherImageUrl } from "~/utilities/helpers"
import { FALLBACKIMAGELOCAL } from "~/composables/globals"
import { Preferences } from "@capacitor/preferences"

// directory to save to in the CapacitorJS FileSystem
export const localStorageKey = "fileSystemLS"
// directory to save to in the CapacitorJS FileSystem
const directoryToSaveTo = Directory.External
const appDirectory = "wnyc-downloads"

// get the file name from a URL
export const fileNameFromURL = (url: string) => {
    let urlWithoutParams = url
    if (url.includes("?")) {
        alert('split = ' + JSON.stringify(url.split("?")[0]))
        urlWithoutParams = url.split("?")[0]
    }
    return urlWithoutParams.substring(urlWithoutParams.lastIndexOf("/") + 1)
}

// check if a file is already downloaded
export const isAlreadyDownloaded = (file) => {
    const isApp = useIsApp()
    if (isApp) {
        const fileSystemLS = useFileSystemLS()
        const check = fileSystemLS.value.find((entry) => entry.id === file.id || entry.originalId === file.id)
        const alreadyDownloaded = check === undefined ? false : true
        return alreadyDownloaded
    } else {
        return false
    }
}

// traverse the directory and return the filesystem
const traverseDirectory = async (path) => {
    const result = []
    const files = await Filesystem.readdir({
        path: path,
        directory: directoryToSaveTo,
    })

    files.files.forEach((file, index) => {
        result[index] = file
    })
    result.forEach(async (file) => {
        const fullPath = `${path}/${file.name}`
        const stats = await Filesystem.readdir({
            path: fullPath,
            directory: directoryToSaveTo,
        })
        file.files = stats.files
    })
    return result
}

// request permissions for the Filesystem. Not sure if we really need this. 
const requestPermissions = async () => {
    try {
        const status = await Filesystem.requestPermissions()
        console.log("STATUS = ", status)
        if (status.publicStorage === "granted") {
            console.log("Permission granted")
        } else {
            console.log("Permission denied")
        }
    } catch (error) {
        console.error("Failed to request permissions", error)
    }
}

// initial check to see if the appDirectory exists and if not, create it
const createAppDirectory = async () => {
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

// initial pull of the preferencce plugin files data
export const initReadOfPreferences = async () => {
    let val = []
    try {
        const { value } = await Preferences.get({ key: "fileSystemLS" })
        val = value ?? "[]"
    } catch (error) {
        console.error("preference read error = ", error)
    }
    return JSON.parse(val ?? "[]")
}

// initializing the fileSystem, gets called in the setup function of the App.vue
export const initFileSystem = async () => {
    const fileSystem = useFileSystem()
    const fileSystemLS = useFileSystemLS()

    // request permissions
    await requestPermissions()

    //initial check to see if the appDirectory exists and if not, create it
    await createAppDirectory()

    fileSystem.value = await traverseDirectory(appDirectory)
    fileSystemLS.value = await initReadOfPreferences()
}

// update the fileSystem, this is called after a download or delete
export const updateFileSystem = async () => {
    const fileSystem = useFileSystem()
    fileSystem.value = await traverseDirectory(appDirectory)
}

// handle downloading a file to the desktop
const downloadFileToDesktop = async (url, filename) => {
    const globalToast = useGlobalToast()
    globalToast.value = {
        severity: "info",
        summary: "Downloading to your computer",
        life: 3000,
    }
    try {
        // Fetch the file data
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        // Get the Blob from the response
        const blob = await response.blob();

        // Create a Blob URL
        const blobUrl = URL.createObjectURL(blob);

        // Create an anchor element and set its attributes
        const aElm = document.createElement('a');
        aElm.href = blobUrl;
        aElm.download = filename;

        // Append the anchor element to the body
        document.body.appendChild(aElm);

        // Trigger a click event on the anchor element to start the download
        aElm.click();

        // Cleanup: remove the anchor element and revoke the Blob URL
        document.body.removeChild(aElm);
        URL.revokeObjectURL(blobUrl);

        // alert the user
        globalToast.value = {
            severity: "success",
            summary: "Download Complete",
            life: 3000,
        }

    } catch (error) {
        console.error('Error downloading file:', error);
        // alert the user
        globalToast.value = {
            severity: "error",
            summary: "Error downloading file",
            life: 3000,
        }
    }
}

// download and store the mp3 file and image file 
export const handleFetchAndStoreMp3 = async (file, index = null) => {
    const isApp = useIsApp()
    const globalToast = useGlobalToast()
    const isSegments = Array.isArray(file.audio) && Array.isArray(file.segments) ? true : false
    const slug = isSegments ? file.segments[index].slug : file.meta.slug
    // set the originalId initally only to keep track of the original id
    file.originalId = file.originalId || file.id;
    const uniqueDirId = isSegments ? `${file.originalId}-${file.segments[index].segmentNumber}` : file.id
    file.id = uniqueDirId

    if (!isApp.value) {
        // is runnning in the browser
        //desktop download
        const audioFile = index !== null ? file.audio[index] : file.audio
        downloadFileToDesktop(audioFile, `WNYC-download-${file.id}-${slug}`)
        return null
    } else {
        // is running as an app
        // check if user is logged in
        const user = useCurrentUser()
        if (!user.value) {
            // not logged in, prompt the user to log in
            const accountPromptSideBar = useAccountPromptSideBar()
            accountPromptSideBar.value = true
        } else {
            // user is logged in
            // check if already downloaded and alert the user
            const alreadyDownloaded = isAlreadyDownloaded(file)
            if (alreadyDownloaded) {
                globalToast.value = {
                    severity: "info",
                    summary: "Already downloaded",
                    life: 3000,
                }
                return null
            } else {
                // app download
                const fileSystem = useFileSystem()
                const fileSystemLS = useFileSystemLS()

                globalToast.value = {
                    severity: "info",
                    summary: "Download started!",
                    life: 3000,
                }
                const fileImage = file.image.template ?? file.image.url ?? file.image

                // create the directory
                await Filesystem.mkdir({
                    path: `${appDirectory}/${file.id}`,
                    directory: directoryToSaveTo,
                }).catch((e) => {
                    console.error("Unable to create directory", e)
                })

                // Fetch the IMAGE file as a Blob
                const imgUrl = resizePublisherImageUrl(fileImage, 288, 288, 80)
                //const imgUrlAlt = file.image.url

                // downlaod image

                const imgNameFromUrl = fileNameFromURL(fileImage)
                await Filesystem.downloadFile({
                    url: imgUrl,
                    path: `${appDirectory}/${file.id}/${imgNameFromUrl}`,
                    directory: directoryToSaveTo,
                })
                    .then(() => {
                        console.log("image saved")
                    })
                    .catch((e) => {
                        console.error("Unable to write file", e)
                    })

                // download the MP3
                const audioNameFromUrl = isSegments ? `${slug}.mp3` : fileNameFromURL(file.audio)

                // Add progress listener
                const progress = ref({ loadedBytes: 0, totalBytes: 0, percentage: 0 });
                const progressListener = await Filesystem.addListener('progress', (event) => {
                    progress.value = {
                        loadedBytes: event.bytes,
                        totalBytes: event.contentLength,
                        percentage: (event.bytes / event.contentLength) * 100,
                    };
                    //console.log('progress = ', progress.value.percentage)
                });

                Filesystem.downloadFile({
                    url: isSegments ? file.audio[index] : file.audio,
                    path: `${appDirectory}/${file.id}/${audioNameFromUrl}`,
                    directory: directoryToSaveTo,
                    progress: true,
                })
                    .then(async (fileURI) => {
                        // remove the progress listener once the file is downloaded
                        progressListener.remove();
                        await updateFileSystem().then(() => {

                            setTimeout(async () => {
                                // slight delay is needed for the fileSystem to update
                                await nextTick()
                                const thisFileSystemEntry = await fileSystem.value.find((entry) =>
                                    fileURI.path.includes(entry.name) ? entry : null)

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
                                const newFile = {
                                    ...file,
                                    directory: thisFileSystemEntry,
                                    directoryImage: directoryImage,
                                    directoryAudio: directoryAudio,
                                    id: uniqueDirId,
                                    title: isSegments ? file.segments[index].title : file.title,
                                }
                                // add it to the fileSystemLS list
                                fileSystemLS.value.push(newFile)
                                // save to local storage, delay needed for some reason
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
                    })
                    .catch((e) => {
                        console.error("Unable to write file", e)
                    })
                return progress
            }
        }
    }
}

// handle initial call to determine if it is a single download or multiple segment downloads
export const fetchAndStoreMp3 = async (file) => {
    // if multiple audio and multiple segments, download all
    if (Array.isArray(file.audio) && Array.isArray(file.segments)) {
        const progressResults = [];
        for (let i = 0; i < file.audio.length; i++) {
            const progress = await handleFetchAndStoreMp3(file, i);
            progressResults.push(progress);
        }
        return progressResults;
    } else {
        return handleFetchAndStoreMp3(file)
    }
}

// handle playing the stored mp3 files and it stored image
export const playStoredMp3 = async (file) => {
    const currentEpisode = useCurrentEpisode()
    const togglePlayTrigger = useTogglePlayTrigger()

    if (currentEpisode.value?.directoryAudio?.name !== file.directoryAudio?.name) {
        file = await prepForPlayer(file)
        try {
            // get audio file
            const audio = await Filesystem.getUri({
                path: `${appDirectory}/${file.id}/${file?.directoryAudio?.name}`,
                directory: directoryToSaveTo,
            })
            await nextTick()
            const savedAudioSrc = Capacitor.convertFileSrc(audio.uri);

            // get image file
            const image = await Filesystem.getUri({
                path: `${appDirectory}/${file.id}/${file?.directoryImage?.name}`,
                directory: directoryToSaveTo,
            })
            await nextTick()
            const savedImageSrc = Capacitor.convertFileSrc(image.uri);

            // set the currentEpisode to the file with updated stored URIs for the image adn audio
            currentEpisode.value = {
                ...file,
                file: savedAudioSrc,
                image: savedImageSrc
            }
            togglePlayTrigger.value = !togglePlayTrigger.value

        } catch (e) {
            console.error("Unable to read file", e)
        }
        // not sure how we would handle tracking the saveRecentlyPlayed without a connection. If this were to become a feature, we would need to save the file to local storage and then save it to the server when a connection is re-established
        //saveRecentlyPlayed(file, file.type)
    }

    togglePlayTrigger.value = !togglePlayTrigger.value
}

// handle getting the stored image URI
export const getDownloadedImageUri = async (file) => {
    //const isApp = useIsApp()
    const fileName = file.directoryImage?.name

    try {
        const result = await Filesystem.getUri({
            path: `${appDirectory}/${file.id}/${fileName}`,
            directory: directoryToSaveTo,
        })
        await nextTick()
        return Capacitor.convertFileSrc(result.uri)

    } catch (e) {
        console.error("Unable to read file", e)
        return FALLBACKIMAGELOCAL
    }
}

// handle recursively deleting a directory
export const deleteDirectory = (file) => {
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
                    (entry) => entry.id !== file.id
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

//handle deleting recursively the root appDirectory and reinitializing the fileSystem
export const deleteAll = () => {
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

// helper function associated with the the file system to format the file size for display
export const formatFileSize = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 B"

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ["B", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}


