const express = require('express');
const axios = require('axios');
const { parseString } = require('xml2js');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('🔍 Google Trends API is running!');
});

app.get('/trends', async (req, res) => {
  try {
    const response = await axios.get('https://trends.google.com.tw/trends/trendingsearches/daily/rss?geo=TW');
    const xml = response.data;

    parseString(xml, (err, result) => {
      if (err) return res.status(500).send('❌ XML 解析失敗');

      const items = result.rss.channel[0].item.map(i => ({
        title: i.title[0],
        traffic: i['ht:approx_traffic']?.[0] || '',
        pubDate: i.pubDate[0],
        link: i.link[0]
      }));
      res.json(items);
    });
  } catch (err) {
    console.error('❌ Error:', err.message);
    res.status(500).send('❌ 熱搜抓取失敗');
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
