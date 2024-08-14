import axios from 'axios';
// Class to normailze NPR data 
export class NPR {
    findImageUrl(item) {
        try {
            let imageUrl = null;
            for (const asset of Object.values(item.resources[0].assets)) {
                if (asset.profiles[0]?.href === '/v1/profiles/image') {
                    const imageEnclosure = asset.enclosures.find(enclosure => enclosure.rels.includes('image-standard'));
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
    async findAudio(item) {
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
                        audio.push({
                            url: asset.enclosures[0].href,
                            title: asset.title,
                            duration: asset.duration,
                        });
                    }
                }
            }
            return audio;
        } catch (e) {
            console.error('findAudio error = ', e);
        }
    }
    async getDocument(url) {
        try {
            const options = {
                method: 'GET',
                url,
                headers: {
                    Authorization: `Bearer ${process.env.NPR_CDS_API_KEY}`
                },
            };
            const data = await axios(options);
            console.log('data = ', data.data);
            return data;
        } catch (e) {
            console.error('getDocument error = ', e);
        }
    }
}