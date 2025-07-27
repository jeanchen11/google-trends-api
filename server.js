const express = require("express");
const axios = require("axios");
const xml2js = require("xml2js");

const app = express();
const PORT = process.env.PORT || 3000;

// 首頁訊息
app.get("/", (req, res) => {
  res.send("✅ Google Trends API is running.");
});

// API 路由：取得即時熱搜
app.get("/api/trends", async (req, res) => {
  try {
    const response = await axios.get("https://trends.google.com/trends/trendingsearches/daily/rss?geo=TW");
    const xml = response.data;

    xml2js.parseString(xml, (err, result) => {
      if (err) {
        return res.status(500).json({ error: "解析 XML 失敗" });
      }

      const items = result.rss.channel[0].item.slice(0, 25).map((item, index) => ({
        index: index + 1,
        title: item.title[0],
        approxTraffic: item["ht:approx_traffic"] ? item["ht:approx_traffic"][0] : "無資料",
        description: item.description[0],
        link: item.link[0],
      }));

      res.json(items);
    });
  } catch (error) {
    console.error("❌ Error fetching trends:", error.message);
    res.status(500).json({ error: "無法取得熱搜資料" });
  }
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
