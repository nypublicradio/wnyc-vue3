import axios from 'axios';
import { cmsSources, FALLBACKIMAGEEP } from '~/composables/globals';
import { deduplicateArray, howLongAgo } from '~/utilities/helpers'
// Class to normailze NPR data
export class NPR {
    getFromNPR(path: string, options: Record<string, any> = {}) {
        options.headers = options.headers ?? {}
        options.headers['Authorization'] = `Bearer ${process.env.NPR_CDS_API_KEY}`
        return axios.get(`${process.env.NPR_CDS_API}/v1/${path}`, options).catch(e => { console.error('NPR CDS error', e); return [] });
    }

    async multiDocumentRequest(ids, maxDocumentsPerRequest = 20) {
        // NPR CDS api has a document request limit of 20, so we may need to make multiple requests
        const deduplicatedIds = deduplicateArray(ids)
        const idBatches = []
        while (deduplicatedIds.length) {
            idBatches.push(deduplicatedIds.splice(0, maxDocumentsPerRequest))
        }
        const requests = idBatches.map(ids => this.getFromNPR(`documents?ids=${ids.join(',')}`))
        const responses = await Promise.all(requests)
        // append all the resources from each response into a single array
        return responses.reduce((acc, response) => acc.concat(response.data.resources), [])
    }

    // Fetch the image of the show
    findImageUrl(item) {
        try {
            let imageUrl = null;
            for (const asset of Object.values(item.resources[0].assets)) {
                if (asset.profiles[0]?.href === '/v1/profiles/image') {
                    const imageEnclosure = asset.enclosures.find(enclosure => enclosure.rels.includes('image-square'));
                    if (imageEnclosure) {
                        imageUrl = { href: imageEnclosure.href, template: imageEnclosure.hrefTemplate };
                        break; // Exit the loop once the matching image URL is found

                    }
                }
            }
            return imageUrl;
        } catch (e) {
            console.error('findImageUrl error = ', e);
        }
    }
    // Fetch the image of the episode
    async findEpisodeImage(item, imageRatio = 'image-standard') {
        try {
            if (item?.assets) {
                for (const asset of Object.values(item?.assets)) {

                    if (asset.cardStyle === 'ProgramSegment') {
                        const res = await this.getDocument(asset?.documentLink?.href);
                        for (const asset of Object.values(res.resources[0].assets)) {
                            if (asset.enclosures) {
                                const imageEnclosure = asset.enclosures.find(enclosure => enclosure.rels.includes(imageRatio));
                                if (imageEnclosure) {
                                    return {
                                        template: imageEnclosure.hrefTemplate,
                                        alt: asset.altText,
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                return null;
            }
        } catch (e) {
            console.error('findDocumentLink error = ', e);
        }
        return null;
    }
    // Fetch all segments for a episode and return audio array
    async findAudio(id, show) {
        const showTitle = show.resources[0].title
        const audio = [];
        try {
            const res = await this.getFromNPR(`documents?collectionIds=${id}`)
            for (const item of res.data.resources) {
                for (const asset of Object.values(item?.assets)) {
                    if (asset?.enclosures && asset?.isAvailable && asset?.isDownloadable) {
                        const publishedDate = item.publishDateTime
                        const body = item.teaser
                        const categoryId = this.getCategoryId(item) ?? []
                        audio.push({
                            id: item.id,
                            audio: asset.enclosures[0].href,
                            title: item.title,
                            estimatedDuration: asset.duration,
                            categoryId,
                            bylineIds: this.getBylineIds(item),
                            publishAt: publishedDate,
                            publicationDate: publishedDate,
                            hideFavorite: true,
                            headers: {
                                brand: {
                                    title: cmsSources.NPR,
                                    logoImage: FALLBACKIMAGEEP,
                                }
                            },
                            showTitle: `${showTitle} - ${howLongAgo(publishedDate)}`,
                            body,
                            meta: {
                                slug: item.id,
                            },
                        });
                    }
                }
            }
            const audioWithMetadata = await this.addMetadata(audio, res.data.resources)
            return audioWithMetadata;
        } catch (e) {
            console.error('findAudio error = ', e);
        }
    }
    async addMetadata(audio, itemData) {
        const categories = audio.map(item => item.categoryId).filter(item => item)
        const categoryDocsRequest = this.multiDocumentRequest(categories)
        const bylineDocIds = audio.reduce((acc, item) => { return acc.concat(item.bylineIds) }, [])
        const bylineDocsRequest = this.multiDocumentRequest(bylineDocIds)
        const [categoryDocs, bylineDocs] = await Promise.all([categoryDocsRequest, bylineDocsRequest])

        // map ids to category names
        const categoryMap = {}
        categoryDocs.forEach(
            item => categoryMap[item.id] = item.title
        )

        // map ids to author names
        const bylineMap = {}
        bylineDocs.forEach((item) => {
            if (item.title) {
                bylineMap[item.id] = item.title
            }
        })
        // sometimes the byline asset is not a separate document and includes the name directly
        itemData.forEach((item) => {
            item.bylines?.map(byline => byline.href.split('/')[2]).forEach((bylineId) => {
                if (item.assets?.[bylineId]?.name)
                    bylineMap[bylineId] = item.assets[bylineId].name
            })
        })

        const audioWithMetadata = audio.map((item) => {
            const category = categoryMap[item.categoryId]
            const byline = item.bylineIds?.map(id => ({ firstName: bylineMap[id] }))
            return {
                ...item,
                category,
                byline,
            }
        });
        return audioWithMetadata
    }
    getBylineIds(item) {
        // Get the byline ids from all bylineDocuments with type biography
        const bylineIds = item.bylines?.map(byline => {
            const assetId = byline.href.split('/')[2]
            if (item.assets[assetId].bylineDocuments)
                return item.assets[assetId].bylineDocuments.find(bylineDoc => bylineDoc.rels.includes('biography'))?.href.split('/')[3]
            else
                return assetId
        }).filter(item => item) ?? []
        return bylineIds
    }
    getCategoryId(item) {
        // Get the category id from the first collection that has a topic or program relationship
        const categoryId = item.collections?.find(
            collection => collection.rels.includes('topic') || collection.rels.includes('program')
        )?.href?.split('/')[3];
        return categoryId
    }
    // Fetch the document from the NPR API
    async getDocument(url: string): Promise<any> {
        try {
            const options = {
                method: 'GET',
                url: `${process.env.NPR_CDS_API}${url}`,
                headers: {
                    Authorization: `Bearer ${process.env.NPR_CDS_API_KEY}`
                },
            };
            const data = await axios(options);
            return data.data;
        } catch (e) {
            console.error('getDocument error = ', e, url);
        }
    }
}