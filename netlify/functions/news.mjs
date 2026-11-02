export default async () => {
  const queries = [
    "Kannada cinema movie news",
    "Telugu cinema movie news",
    "Tamil cinema movie news",
    "Hindi Bollywood movie news",
    "OTT movie releases India"
  ];

  const results = await Promise.all(
    queries.map(async (query) => {
      const url =
        "https://news.google.com/rss/search?q=" +
        encodeURIComponent(query) +
        "&hl=kn&gl=IN&ceid=IN:kn";

      try {
        const response = await fetch(url);
        const xml = await response.text();

        const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

        return items.slice(0, 10).map((item) => {
          const get = (tag) => {
            const match = item[1].match(
              new RegExp("<" + tag + ">([\\s\\S]*?)</" + tag + ">")
            );
            return match
              ? match[1]
                  .replace(/<!\[CDATA\[|\]\]>/g, "")
                  .replace(/&amp;/g, "&")
                  .replace(/&quot;/g, '"')
                  .replace(/&lt;/g, "<")
                  .replace(/&gt;/g, ">")
                  .replace(/&apos;/g, "'")
              : "";
          };

          return {
            title: get("title"),
            link: get("link"),
            pubDate: get("pubDate"),
            category: query
          };
        });
      } catch (error) {
        return [];
      }
    })
  );

  return new Response(JSON.stringify({
    articles: results.flat()
  }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
};
