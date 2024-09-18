import axios from 'axios';
import { cmsSources, FALLBACKIMAGEEP } from '~/composables/globals';
import { howLongAgo } from '~/utilities/helpers'
// Class to normailze NPR data 
export class NPR {

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

    // Fetch all segments for a episode and return audio array
    async findAudio(item, showTitle) {
        try {
            let audio = [];
            for (const asset of Object.values(item?.items)) {
                const option = {
                    method: 'GET',
                    url: `${process.env.NPR_CDS_API}${asset.href}`,
                    headers: {
                        Authorization: `Bearer ${process.env.NPR_CDS_API_KEY}`
                    }
                };
                const response = await axios(option);
                for (const asset of Object.values(response.data.resources[0].assets)) {
                    if (asset?.isAvailable) {
                        const category = await this.getAudioCategory(response.data.resources[0]);
                        const byline = await this.getAudioByline(response.data.resources[0]);
                        const publishedDate = response.data.resources[0].publishDateTime
                        const body = response.data.resources[0].teaser
                        audio.push({
                            id: asset.id,
                            audio: asset.enclosures[0].href,
                            title: asset.title,
                            estimatedDuration: asset.duration,
                            category,
                            byline,
                            publishAt: publishedDate,
                            publicationDate: publishedDate,
                            headers: {
                                brand: {
                                    title: cmsSources.NPR,
                                    logoImage: FALLBACKIMAGEEP,
                                }
                            },
                            showTitle: `${showTitle} - ${howLongAgo(publishedDate)}`,
                            description: "test description",
                            body,
                            //TODO: Find Catagories, Authors
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
    async getAudioByline(item: { assets: any[] }) {
        let bylines: object[] = [];
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
    async getDocument(url) {
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