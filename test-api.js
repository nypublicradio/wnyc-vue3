import('axios').then(async (axios) => {
  try {
    const res = await axios.default.get('https://api.wnyc.org/api/v3/buckets/wnyc-home-top');
    console.log("WNYC data length:", res.data?.data?.attributes?.["bucket-items"]?.length);
  } catch (e) {
    console.error("WNYC err", e.message);
  }
  
  try {
    const res2 = await axios.default.get('https://api.gothamist.com/api/v2/pages/', {
      params: {
        type: 'news.ArticlePage',
        fields: 'id,title,lead_asset,related_authors,publication_date,ancestry,body,url',
        order: '-publication_date',
        show_on_index_listing: true,
        limit: 3,
        sponsored_content: false
      }
    });
    console.log("Gothamist data length:", res2.data?.items?.length);
  } catch (e) {
    console.error("Gothamist err", e.message);
  }
});
