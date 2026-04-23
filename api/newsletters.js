export default async function handler(req, res) {
  try {
    const response = await fetch('https://laninge.substack.com/feed', {
      headers: { 'User-Agent': 'laninge.com/1.0' },
    })
    if (!response.ok) throw new Error(`Substack returned ${response.status}`)
    const xml = await response.text()

    const items = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    const titleRegex = /<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title>([^<]+)<\/title>/
    const linkRegex = /<link>([^<]+)<\/link>/
    const pubDateRegex = /<pubDate>([^<]+)<\/pubDate>/

    let match
    while ((match = itemRegex.exec(xml)) && items.length < 5) {
      const block = match[1]
      const titleMatch = block.match(titleRegex)
      const linkMatch = block.match(linkRegex)
      const dateMatch = block.match(pubDateRegex)
      items.push({
        title: titleMatch ? (titleMatch[1] || titleMatch[2] || '').trim() : '',
        link: linkMatch ? linkMatch[1].trim() : '',
        date: dateMatch ? dateMatch[1].trim() : '',
      })
    }

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
    res.status(200).json({ items })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
