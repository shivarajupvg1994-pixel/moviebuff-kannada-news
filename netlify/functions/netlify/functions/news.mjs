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

        const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
          .slice(0, 8)
          .map((match) => {
            const item = match[1];
            const get = (tag) =>
              (item.match(new RegExp("<" + tag + ">([\\s\\S]*?)</" + tag + ">")) || [])[1] || "";

            return {
              title: get("title")
                .replace(/<!\[CDATA\[|\]\]>/g, "")
                .replace(/&amp;/g, "&")
                .replace(/&quot;/g, '"')
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">"),
              link: get("link"),
              pubDate: get("pubDate"),
              source: query
            };
          });

        return items;
      } catch {
        return [];
      }
    })
  );

  return new Response(JSON.stringify(results.flat()), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=900"
    }
  });
};
