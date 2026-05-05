const mergeArticles = (articles1, articles2) => {
	const mergedArticles = [...articles1, ...articles2]
	const sortedArticles = mergedArticles.sort((a, b) => {
		const aDate = new Date(a.sortDate)
		const bDate = new Date(b.sortDate)
		return bDate.getTime() - aDate.getTime()
	})
	// remove duplicates
	return sortedArticles.filter((obj, index) => {
		return index === sortedArticles.findIndex((o) => obj.title === o.title)
	})
}
console.log(mergeArticles([{title: "A", sortDate: "2026-05-01"}], []));
