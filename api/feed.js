// Proxies the raw Substack RSS feed via our domain so the GitHub Actions
// sync job can fetch it (Substack blocks GitHub runner IP ranges even with
// a browser User-Agent). Vercel's egress IPs pass through fine.

export default async function handler(req, res) {
  try {
    const response = await fetch('https://laninge.substack.com/feed', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
        Accept: 'application/rss+xml, application/xml, text/xml',
      },
    })
    if (!response.ok) {
      res.status(502).json({ error: `Upstream ${response.status}` })
      return
    }
    const xml = await response.text()
    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    res.status(200).send(xml)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
