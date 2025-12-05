// import { setGallery } from "vue-preview-imgs" // Moved to dynamic import
import piexif from 'piexifjs'

export default function useUseGallery () {

  const toast = useToast()

  const isDeletingMedia = ref(false)

  const mediaMenuOptions = [
    { value: 'share', label: 'Share', icon: 'pi pi-share-alt' },
    { value: 'download', label: 'Download', icon: 'pi pi-download' },
    { value: 'delete', label: 'Delete', icon: 'pi pi-trash' },
  ]

  // get supabase storage bucket path
  const getMediaPath = (imageUrl: string, /* options: TransformOptions = {}, */ bucket = 'media') => {
    // if the imageUrl is already a full URL, return it directly
    // if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    //   return imageUrl
    // }

    // if the imageUrl has the extension .webm and has "_audio_" in the name, we need to point to a audio fallback image in the media bucket
    // const isAudioFile = imageUrl.includes('_audio_') && imageUrl.endsWith('.webm')
    // const isVideoFile = imageUrl.includes('_video_') && imageUrl.endsWith('.webm')
    // if (isAudioFile) {
    //   imageUrl = 'fallbacks/audio.png'
    // } else if (isVideoFile) {
    //   imageUrl = 'fallbacks/audio.png'
    // }

    //const currentUser = useSupabaseUser()
    const supabase = useSupabaseClient()
    const path = `${supabase.storage.from(bucket).getPublicUrl(''/* , { transform: options } */).data.publicUrl}${imageUrl}`
    return path
  }


  const deleteMedia = async (storage: { imageUrl: string, bucket: 'media' }, reference: { table: string, id: number, column: string }) => {
    isDeletingMedia.value = true
    const supabase = useSupabaseClient()

    const storageResult = await supabase.storage.from(storage.bucket).remove([storage.imageUrl])

    if (storageResult.error) {
      console.error('Error deleting media:', storageResult.error)
    }

    // Optionally, you can also delete the reference from the database
    if (reference) {
      const { data, error } = await supabase.from(reference.table)
        .select(reference.column)
        .eq('id', reference.id)
        .single()

      if (error || !data) {
        console.error('Error fetching current array:', error)
        return !storageResult.error
      }

      const currentArray = data[reference.column] || []
      const updatedArray = currentArray.filter((item: string) => item !== storage.imageUrl)

      const updateResult = await supabase.from(reference.table)
        .update({ [reference.column]: updatedArray })
        .eq('id', reference.id)

      if (updateResult.error) {
        console.error('Error updating array:', updateResult.error)
      }
      isDeletingMedia.value = false
      return !storageResult.error && !updateResult.error
    }
    isDeletingMedia.value = false
    return !storageResult.error
  }

  const onMediaMenuOptionSelected = async (event: any, image: string | string[], props: any, onSuccessCallback: Function, onFailCallback: Function) => {
    //console.log('Selected option:', event, image, props);

    // Determine if we're handling single or multiple images
    const images = Array.isArray(image) ? image : [image]
    const isMultiple = Array.isArray(image)

    // switch case for the selected options
    switch (event.value) {
      case 'share':
        // Share the image - only handle single image for now
        if (isMultiple) {
          toast.add({
            severity: 'warn',
            summary: 'Share',
            detail: 'Sharing multiple items is not supported yet',
            life: 3000
          })
          return
        }

        if (isMobileOS() && navigator.share && navigator.canShare) {
          // Use native share API on mobile
          try {
            const mediaUrl = getMediaPath(images[0], props.bucket)
            const response = await fetch(mediaUrl)
            const blob = await response.blob()
            const file = new File([blob], images[0].split('/').pop() || 'shared_media', { type: blob.type })

            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: 'Shared Media',
                text: 'Check out this media file',
                files: [file]
              })
              toast.add({
                severity: 'success',
                summary: 'Share',
                detail: 'Media shared successfully',
                life: 3000
              })
            } else {
              // Fallback to URL sharing if file sharing not supported
              await navigator.share({
                title: 'Shared Media',
                text: 'Check out this media file',
                url: mediaUrl
              })
              toast.add({
                severity: 'success',
                summary: 'Share',
                detail: 'Media URL shared successfully',
                life: 3000
              })
            }
          } catch (error) {
            console.error('Share failed:', error)
            // Fallback to clipboard on mobile if share fails
            try {
              await navigator.clipboard.writeText(getMediaPath(images[0], props.bucket))
              toast.add({
                severity: 'success',
                summary: 'Copy Image URL',
                detail: 'Image URL copied to clipboard',
                life: 3000
              })
            } catch {
              toast.add({
                severity: 'error',
                summary: 'Share Failed',
                detail: 'Unable to share or copy the image URL',
                life: 3000
              })
            }
          }
        } else {
          // Use clipboard for desktop
          try {
            await navigator.clipboard.writeText(getMediaPath(images[0], props.bucket))
            toast.add({
              severity: 'success',
              summary: 'Copy Image URL',
              detail: 'Image URL copied to clipboard',
              life: 3000
            })
          } catch {
            toast.add({
              severity: 'error',
              summary: 'Copy Image URL',
              detail: 'Unable to copy the image URL to the clipboard',
              life: 3000
            })
          }
        }
        break
      case 'download':
        // Download the image(s)
        try {
          let successCount = 0
          let failCount = 0

          for (const imageUrl of images) {
            try {
              const mediaUrl = getMediaPath(imageUrl, props.bucket)
              const response = await fetch(mediaUrl)
              const blob = await response.blob()

              const link = document.createElement('a')
              const url = window.URL.createObjectURL(blob)
              link.href = url
              link.download = imageUrl.split('/').pop() || 'downloaded_media'
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              window.URL.revokeObjectURL(url)
              successCount++
            } catch (error) {
              console.error('Download failed for:', imageUrl, error)
              failCount++
            }
          }

          if (successCount > 0) {
            const message = isMultiple
              ? `Downloaded ${successCount} of ${images.length} media files`
              : 'Downloading media to your device'
            toast.add({
              severity: 'success',
              summary: 'Download',
              detail: message,
              life: 3000
            })
          }

          if (failCount > 0) {
            const message = isMultiple
              ? `Failed to download ${failCount} of ${images.length} media files`
              : 'Unable to download the media file'
            toast.add({
              severity: 'error',
              summary: 'Download Failed',
              detail: message,
              life: 3000
            })
          }
        } catch (error) {
          console.error('Download failed:', error)
          toast.add({
            severity: 'error',
            summary: 'Download Failed',
            detail: isMultiple ? 'Unable to download media files' : 'Unable to download the media file',
            life: 3000
          })
        }
        break
      case 'delete':
        // Delete the image(s)
        try {
          let successCount = 0
          let failCount = 0

          for (const imageUrl of images) {
            try {
              const success = await deleteMedia(
                { imageUrl, bucket: props.bucket },
                { table: props.table, id: props.id, column: props.column }
              )
              if (success) {
                successCount++
              } else {
                failCount++
              }
            } catch (error) {
              console.error('Delete failed for:', imageUrl, error)
              failCount++
            }
          }

          if (successCount > 0) {
            const message = isMultiple
              ? `Deleted ${successCount} of ${images.length} media files successfully`
              : 'Media deleted successfully'
            toast.add({
              severity: 'success',
              summary: 'Delete',
              detail: message,
              life: 3000
            })
            if (successCount === images.length) {
              onSuccessCallback()
            }
          }

          if (failCount > 0) {
            const message = isMultiple
              ? `Failed to delete ${failCount} of ${images.length} media files`
              : 'Media deletion failed'
            toast.add({
              severity: 'error',
              summary: 'Delete',
              detail: message,
              life: 3000
            })
            if (failCount === images.length) {
              onFailCallback()
            }
          }
        } catch (error) {
          console.error('Delete operation failed:', error)
          toast.add({
            severity: 'error',
            summary: 'Delete',
            detail: isMultiple ? 'Failed to delete media files' : 'Media deletion failed',
            life: 3000
          })
          onFailCallback()
        }
        break
      default:
        console.warn('Unknown option selected:', event.value)
    }
  }

  // Generate video thumbnail
  const generateVideoThumbnail = (videoUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Unable to get 2D context from canvas'))
        return
      }

      video.crossOrigin = 'anonymous'
      video.currentTime = 1 // Capture frame at 1 second

      video.onloadeddata = () => {
        try {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

          // Convert to data URL (base64)
          const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8)
          resolve(thumbnailUrl)
        } catch (error) {
          console.error('Error generating video thumbnail:', error)
          // Use fallback image path directly
          resolve('/images/video-image.webp')
        }
      }

      video.onerror = () => {
        console.error('Failed to load video for thumbnail, using fallback image')
        // Use fallback image path directly
        resolve('/images/video-image.webp')
      }

      video.src = videoUrl
    })
  }


  // Helper function to decode Windows XP fields (UTF-16 encoded)
  const decodeXPField = (field: any): string | null => {
    if (!field) return null

    try {
      // XP fields are stored as arrays of UTF-16 bytes
      if (Array.isArray(field)) {
        // Convert array of bytes to string
        let result = ''
        for (let i = 0; i < field.length - 1; i += 2) {
          const charCode = field[i] + (field[i + 1] << 8)
          if (charCode === 0) break // Null terminator
          result += String.fromCharCode(charCode)
        }
        return result || null
      }

      // If it's already a string, return it
      if (typeof field === 'string') {
        return field
      }

      return String(field)
    } catch (error) {
      console.warn('Error decoding XP field:', error)
      return null
    }
  }

  // Extract metadata from image URL using piexif
  const extractImageMetadata = async (imageUrl: string) => {
    try {
      const response = await fetch(getMediaPath(imageUrl))
      const arrayBuffer = await response.arrayBuffer()
      const uint8Array = new Uint8Array(arrayBuffer)

      // Check if this is a JPEG file by looking at the magic bytes
      const isJpeg = uint8Array[0] === 0xFF && uint8Array[1] === 0xD8

      if (!isJpeg) {
        console.warn('Image is not a JPEG file, EXIF extraction skipped')
        return { success: false, metadata: {} }
      }

      // Convert to base64 DataURL format for piexif
      let binary = ''
      for (const byte of uint8Array) {
        binary += String.fromCharCode(byte)
      }
      const base64 = btoa(binary)
      const dataUrl = `data:image/jpeg;base64,${base64}`

      // Extract EXIF data using piexif.load() as per documentation
      const exifObj = piexif.load(dataUrl)

      // Parse and organize the metadata for better readability
      const parsedMetadata: {
        basic: any
        ifd0: any
        exif: any
        gps: any
        interop: any
        thumbnail: any
        customMetadata?: any
      } = {
        basic: {},
        ifd0: {},
        exif: {},
        gps: {},
        interop: {},
        thumbnail: {}
      }

      // Parse EXIF data (camera-specific info) to get dimensions
      let imageWidth = 0
      let imageHeight = 0
      if (exifObj.Exif) {
        const exif = exifObj.Exif
        imageWidth = exif[piexif.ExifIFD.PixelXDimension] || 0
        imageHeight = exif[piexif.ExifIFD.PixelYDimension] || 0
      }

      // Extract basic file info
      parsedMetadata.basic = {
        fileSize: `${Math.round(arrayBuffer.byteLength / 1024)} KB`,
        fileType: 'JPEG',
        isValidJpeg: isJpeg,
        width: imageWidth,
        height: imageHeight
      }

      // Parse IFD0 data (Image File Directory - main image info)
      if (exifObj['0th']) {
        const ifd0 = exifObj['0th']
        parsedMetadata.ifd0 = {
          imageDescription: ifd0[piexif.ImageIFD.ImageDescription],
          make: ifd0[piexif.ImageIFD.Make],
          model: ifd0[piexif.ImageIFD.Model],
          software: ifd0[piexif.ImageIFD.Software],
          datetime: ifd0[piexif.ImageIFD.DateTime],
          artist: ifd0[piexif.ImageIFD.Artist],
          copyright: ifd0[piexif.ImageIFD.Copyright],
          xResolution: ifd0[piexif.ImageIFD.XResolution],
          yResolution: ifd0[piexif.ImageIFD.YResolution],
          resolutionUnit: ifd0[piexif.ImageIFD.ResolutionUnit],
          orientation: ifd0[piexif.ImageIFD.Orientation],
          // Windows XP fields (decoded from UTF-16)
          xpComment: decodeXPField(ifd0[piexif.ImageIFD.XPComment]),
          xpAuthor: decodeXPField(ifd0[piexif.ImageIFD.XPAuthor]),
          xpKeywords: decodeXPField(ifd0[piexif.ImageIFD.XPKeywords]),
          xpSubject: decodeXPField(ifd0[piexif.ImageIFD.XPSubject]),
          xpTitle: decodeXPField(ifd0[piexif.ImageIFD.XPTitle])
        }
      }

      // Parse EXIF data (camera-specific info)
      if (exifObj.Exif) {
        const exif = exifObj.Exif
        parsedMetadata.exif = {
          dateTimeOriginal: exif[piexif.ExifIFD.DateTimeOriginal],
          dateTimeDigitized: exif[piexif.ExifIFD.DateTimeDigitized],
          exposureTime: exif[piexif.ExifIFD.ExposureTime],
          fNumber: exif[piexif.ExifIFD.FNumber],
          iso: exif[piexif.ExifIFD.ISOSpeedRatings],
          flash: exif[piexif.ExifIFD.Flash],
          focalLength: exif[piexif.ExifIFD.FocalLength],
          pixelXDimension: exif[piexif.ExifIFD.PixelXDimension],
          pixelYDimension: exif[piexif.ExifIFD.PixelYDimension]
        }
      }

      // Parse GPS data
      if (exifObj.GPS) {
        const gps = exifObj.GPS
        parsedMetadata.gps = {
          latitude: gps[piexif.GPSIFD.GPSLatitude],
          latitudeRef: gps[piexif.GPSIFD.GPSLatitudeRef],
          longitude: gps[piexif.GPSIFD.GPSLongitude],
          longitudeRef: gps[piexif.GPSIFD.GPSLongitudeRef],
          altitude: gps[piexif.GPSIFD.GPSAltitude],
          timestamp: gps[piexif.GPSIFD.GPSTimeStamp],
          datestamp: gps[piexif.GPSIFD.GPSDateStamp]
        }
      }

      //console.log('Extracted EXIF metadata:', parsedMetadata)

      // Try to parse JSON from XP Subject field if it exists
      if (parsedMetadata.ifd0?.xpSubject) {
        try {
          // Look for JSON in the XP Subject field
          const subjectText = parsedMetadata.ifd0.xpSubject
          if (typeof subjectText === 'string' && subjectText.includes('Metadata:')) {
            const jsonStart = subjectText.indexOf('{')
            if (jsonStart !== -1) {
              const jsonText = subjectText.substring(jsonStart)
              const jsonData = JSON.parse(jsonText)
              parsedMetadata.customMetadata = jsonData
              //console.log('Found custom JSON metadata in XP Subject:', jsonData)
            }
          }
        } catch (error) {
          console.warn('Could not parse JSON from XP Subject:', error)
        }
      }

      return { success: true, metadata: parsedMetadata }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.warn('Failed to extract metadata:', error)
      return { success: false, metadata: {}, error: errorMessage }
    }
  }

  const generateGalleryList = async (items: any[]) => {
    const galleryItems = await Promise.all(
      items.map(async (item, i) => {
        const metadata = await extractImageMetadata(item)
        // create the thumb height based on the ratio of the image
        const mH = metadata?.metadata?.basic?.height
        const mW = metadata?.metadata?.basic?.width
        const thumbHeight = mH ? Math.round(100 * mH / mW) : 75
        return {
          src: getMediaPath(item),
          msrc: getMediaPath(item, { width: 100, height: thumbHeight }),
          w: mW || 1600,
          h: mH || 1200,
          cropped: true,
          title: item.name || `Image ${i + 1}`,
          alt: item.name || `Image ${i + 1}`,
        }
      })
    )
    return galleryItems
  }

  const launchGallery = async (images = [], index = 0) => {
    const imageList = await generateGalleryList(images)

    // Transform items to include video detection
    const galleryItems = imageList.map(item => {
      const isVideo = item.src.includes('.mp4') || item.src.includes('.webm') || item.src.includes('.mov')

      if (isVideo) {
        return {
          ...item,
          html: `<video controls loop playsinline crossorigin="anonymous" style="width: 100%; height: 100%;">
             <source src="${item.src}" type="video/${item.src.split('.').pop()}">
             Your browser does not support the video tag.
           </video>`,
          type: 'video'
        }
      }

      return {
        ...item,
        type: 'image'
      }
    })

    // Dynamically import vue-preview-imgs to avoid SSR issues with photoswipe.css
    let setGallery
    try {
      const module = await import("vue-preview-imgs")
      setGallery = module.setGallery
    } catch (e) {
      console.error("Failed to load gallery module", e)
      return
    }

    const lightbox = setGallery({
      dataSource: galleryItems,
      options: {
        html: true,
        getThumbBoundsFn: false,
        getDoubleTapZoom (isMouseClick, item) {
          if (item.type === 'video') {
            return 1
          }
          return isMouseClick ? 1.5 : 2
        }
      }
    })
    lightbox.loadAndOpen(index)
  }



  // Function to embed metadata into image using EXIF
  const embedMetadataInImage = (file, metadata, metadataProp) => {
    // Only process image files
    if (!file.type.startsWith('image/')) {
      return file
    }

    // piexifjs only supports EXIF embedding in JPEG and TIFF formats
    // WebP will be converted to JPEG to support EXIF metadata
    const supportsExif = file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/tiff'

    return new Promise((resolve) => {
      try {
        const reader = new FileReader()

        reader.onload = function (event) {
          try {
            const imageData = event.target.result

            // Create EXIF data object
            const exifDict = {
              "0th": {},
              Exif: {},
              GPS: {},
              "1st": {},
              thumbnail: null
            }

            // Extract meaningful information from metadata
            const userInfo = metadataProp[0] // user
            const patientInfo = metadataProp[1] // patient  
            const pointInfo = metadataProp[2] // editing point

            // Add metadata to appropriate EXIF fields
            exifDict["0th"][piexif.ImageIFD.ImageDescription] = "Veterinary documentation image from Heavy Petting App"
            exifDict["0th"][piexif.ImageIFD.Software] = "Heavy Petting App"

            // Use Copyright field appropriately (not for dumping JSON)
            const copyrightText = userInfo?.email ? `© ${userInfo.email}` : "© Heavy Petting App User"
            exifDict["0th"][piexif.ImageIFD.Copyright] = copyrightText

            // Use Artist field for the veterinarian/user
            if (userInfo?.email) {
              exifDict["0th"][piexif.ImageIFD.Artist] = userInfo.email
            }

            // Use Make/Model fields for meaningful information
            exifDict["0th"][piexif.ImageIFD.Make] = "Heavy Petting App"
            if (patientInfo?.name) {
              exifDict["0th"][piexif.ImageIFD.Model] = `Patient: ${patientInfo.name}`
            }

            // Function to encode text as UTF-16LE for XP fields (Windows EXIF extension)
            const encodeUTF16LE = (text) => {
              const buffer = new ArrayBuffer(text.length * 2)
              const view = new Uint16Array(buffer)
              for (let i = 0; i < text.length; i++) {
                view[i] = text.charCodeAt(i)
              }
              return Array.from(new Uint8Array(buffer))
            }

            // Use XPComment for human-readable case information (Windows-compatible)
            if (pointInfo?.type_label && patientInfo?.name) {
              const caseInfo = `Patient: ${patientInfo.name}, Condition: ${pointInfo.type_label}`
              exifDict["0th"][piexif.ImageIFD.XPComment] = encodeUTF16LE(caseInfo)
            }

            // Store additional structured metadata in XPKeywords for searchability
            const keywords = []
            if (patientInfo?.species) keywords.push(`Species:${patientInfo.species}`)
            if (pointInfo?.type_label) keywords.push(`Condition:${pointInfo.type_label}`)
            if (patientInfo?.name) keywords.push(`Patient:${patientInfo.name}`)
            keywords.push('Source:HeavyPettingApp')

            if (keywords.length > 0) {
              const keywordString = keywords.join(';')
              exifDict["0th"][piexif.ImageIFD.XPKeywords] = encodeUTF16LE(keywordString)
            }

            // Store complete metadata dump in XPSubject for programmatic access
            const metadataString = JSON.stringify(metadata)
            exifDict["0th"][piexif.ImageIFD.XPSubject] = encodeUTF16LE(`Metadata: ${metadataString}`)

            // Add timestamp
            const now = new Date()
            const dateString = now.toISOString().replace(/:/g, '').replace(/\..+/, '').replace('T', ':')
            exifDict["0th"][piexif.ImageIFD.DateTime] = dateString
            exifDict.Exif[piexif.ExifIFD.DateTimeOriginal] = dateString
            exifDict.Exif[piexif.ExifIFD.DateTimeDigitized] = dateString

            // Convert non-JPEG/TIFF formats to JPEG for EXIF support (piexifjs limitation)
            if (!supportsExif) {
              // Convert to JPEG with EXIF
              const canvas = document.createElement('canvas')
              const ctx = canvas.getContext('2d')
              const img = new Image()

              img.onload = function () {
                canvas.width = img.width
                canvas.height = img.height
                ctx.drawImage(img, 0, 0)

                // Add image dimensions to EXIF data
                exifDict.Exif[piexif.ExifIFD.PixelXDimension] = img.width
                exifDict.Exif[piexif.ExifIFD.PixelYDimension] = img.height

                // Convert to JPEG
                canvas.toBlob((blob) => {
                  if (!blob) {
                    console.warn('Failed to convert image to JPEG for EXIF embedding')
                    resolve(file)
                    return
                  }

                  const reader2 = new FileReader()
                  reader2.onload = (event2) => {
                    try {
                      const jpegData = event2.target.result
                      const exifBytes = piexif.dump(exifDict)
                      const newImageData = piexif.insert(exifBytes, jpegData)

                      // Convert back to blob and then to file
                      const byteString = atob(newImageData.split(',')[1])
                      const ab = new ArrayBuffer(byteString.length)
                      const ia = new Uint8Array(ab)
                      for (let i = 0; i < byteString.length; i++) {
                        ia[i] = byteString.charCodeAt(i)
                      }
                      const finalBlob = new Blob([ab], { type: 'image/jpeg' })

                      const originalName = file.name.replace(/\.[^/.]+$/, '') // Remove extension
                      const jpegFile = new File([finalBlob], `${originalName}.jpg`, {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                      })

                      resolve(jpegFile)
                    } catch (error) {
                      console.error('Error embedding EXIF in converted JPEG:', error)
                      resolve(file)
                    }
                  }
                  reader2.readAsDataURL(blob)
                }, 'image/jpeg', 0.9)
              }

              img.onerror = function () {
                console.warn('Failed to load image for EXIF conversion')
                resolve(file)
              }

              img.src = URL.createObjectURL(file)
            } else {
              // For JPEG/TIFF files, directly embed EXIF
              try {
                // Get image dimensions for EXIF data
                const img = new Image()
                img.onload = function () {
                  // Add image dimensions to EXIF data
                  exifDict.Exif[piexif.ExifIFD.PixelXDimension] = img.width
                  exifDict.Exif[piexif.ExifIFD.PixelYDimension] = img.height

                  try {
                    const exifBytes = piexif.dump(exifDict)
                    const newImageData = piexif.insert(exifBytes, imageData)

                    // Convert back to blob and then to file
                    const byteString = atob(newImageData.split(',')[1])
                    const ab = new ArrayBuffer(byteString.length)
                    const ia = new Uint8Array(ab)
                    for (let i = 0; i < byteString.length; i++) {
                      ia[i] = byteString.charCodeAt(i)
                    }
                    const finalBlob = new Blob([ab], { type: file.type })

                    const newFile = new File([finalBlob], file.name, {
                      type: file.type,
                      lastModified: Date.now()
                    })

                    resolve(newFile)
                  } catch (error) {
                    console.error('Error embedding EXIF in image:', error)
                    resolve(file)
                  }
                }
                img.onerror = function () {
                  console.error('Error loading image for dimension extraction')
                  resolve(file)
                }
                img.src = imageData
              } catch (error) {
                console.error('Error embedding EXIF in image:', error)
                resolve(file)
              }
            }
          } catch (error) {
            console.error('Error processing image for EXIF embedding:', error)
            resolve(file)
          }
        }

        reader.onerror = function () {
          console.error('Error reading file for EXIF embedding')
          resolve(file)
        }

        reader.readAsDataURL(file)
      } catch (error) {
        console.error('Error in embedMetadataInImage:', error)
        resolve(file)
      }
    })
  }



  return { launchGallery, generateGalleryList, getMediaPath, extractImageMetadata, embedMetadataInImage, deleteMedia, generateVideoThumbnail, mediaMenuOptions, onMediaMenuOptionSelected, isDeletingMedia }
}
