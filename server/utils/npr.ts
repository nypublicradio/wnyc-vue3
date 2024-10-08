import axios from 'axios';
import { cmsSources, FALLBACKIMAGEEP } from '~/composables/globals';
import { howLongAgo } from '~/utilities/helpers'
// Class to normailze NPR data 
export class NPR {
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
            const url = `${process.env.NPR_CDS_API}/v1/documents?collectionIds=${id}`;
            const option = {
                method: 'GET',
                url,
                headers: {
                    Authorization: `Bearer ${process.env.NPR_CDS_API_KEY}`
                }
            };
            const res = await axios(option);
            for (const item of res.data.resources) {
                for (const asset of Object.values(item?.assets)) {
                    if (asset?.enclosures && asset?.isAvailable && asset?.isDownloadable) {
                        const category = await this.getAudioCategory(item);
                        const byline = await this.getAudioByline(item);
                        const publishedDate = item.publishDateTime
                        const body = item.teaser
                        audio.push({
                            id: item.id,
                            audio: asset.enclosures[0].href,
                            title: item.title,
                            estimatedDuration: asset.enclosures[0].duration,
                            category,
                            byline,
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
            return audio;
        } catch (e) {
            console.error('findAudio error = ', e);
        }
    }
    // Fetch the category of the audio
    async getAudioCategory(item) {
        const collections = item?.collections;
        const categoryHref = collections?.filter(collection => collection.rels.includes('slug')).map(collection => collection.href);
        const request = await this.getDocument(categoryHref[0]);
        const category = request?.resources[0].title;
        return category;
    }
    // Fetch the authors of the audio
    async getAudioByline(item: { assets: { profiles?: { href?: string }[], bylineDocuments?: { href: string }[] }[] }) {
        const bylines: object[] = [];
        for (const contributor of Object.values(item?.assets)) {
            if (contributor?.profiles?.[1]?.href === '/v1/profiles/reference-byline') {
                for (const asset of contributor?.bylineDocuments || []) {
                    const bylineUrl = asset.href;
                    const request = await this.getDocument(bylineUrl);
                    const byline = { firstName: request?.resources[0].title };
                    bylines.push(byline);
                }
            }
        }
        return bylines;
    }
    // Fetch the document from the NPR API
    private async getDocument(url: string): Promise<any> {
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