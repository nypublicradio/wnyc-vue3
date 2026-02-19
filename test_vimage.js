const regex = /(\/i\/)[^\/]+\/[^\/]+\/[^\/]+\/[^\/]+/;

console.log("https://media.wnyc.org/i/500/500/c/80/1/wqxr_1_1.png".replace(regex, "$1%s/%s/%s/%s"))
console.log("https://media.wnyc.org/i/100/100/c/80/wqxr_1_1.png".replace(regex, "$1100/100/c/80"))
