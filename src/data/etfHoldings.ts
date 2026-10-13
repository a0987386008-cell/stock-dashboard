// src/data/etfHoldings.ts

export const STATIC_ETF_HOLDINGS: Record<string, { name: string; weight: string }[]> = {
  '0050.TW': [
    { name: '台積電 (2330)', weight: '56.56%' }, { name: '聯發科 (2454)', weight: '6.37%' }, { name: '台達電 (2308)', weight: '3.44%' }, 
    { name: '鴻海 (2317)', weight: '2.75%' }, { name: '日月光投控 (3711)', weight: '2.17%' }, { name: '聯電 (2303)', weight: '1.55%' }, 
    { name: '台光電 (2383)', weight: '1.55%' }, { name: '欣興 (3037)', weight: '1.54%' }, { name: '南亞 (1303)', weight: '1.39%' }, { name: '富邦金 (2881)', weight: '1.16%' }
  ],
  '0052.TW': [
    { name: '台積電 (2330)', weight: '63.33%' }, { name: '聯發科 (2454)', weight: '7.15%' }, { name: '鴻海 (2317)', weight: '3.09%' }, 
    { name: '日月光投控 (3711)', weight: '2.44%' }, { name: '聯電 (2303)', weight: '1.74%' }, { name: '台光電 (2383)', weight: '1.74%' }, 
    { name: '欣興 (3037)', weight: '1.73%' }, { name: '奇鋐 (3017)', weight: '1.14%' }, { name: '國巨 (2327)', weight: '1.02%' }, { name: '廣達 (2382)', weight: '0.89%' }
  ],
  '0055.TW': [
    { name: '富邦金 (2881)', weight: '13.66%' }, { name: '中信金 (2891)', weight: '12.01%' }, { name: '國泰金 (2882)', weight: '11.25%' }, 
    { name: '台新新光金 (2887)', weight: '9.93%' }, { name: '元大金 (2885)', weight: '7.85%' }, { name: '玉山金 (2884)', weight: '7.19%' }, 
    { name: '凱基金 (2883)', weight: '6.14%' }, { name: '兆豐金 (2886)', weight: '5.96%' }, { name: '永豐金 (2890)', weight: '5.68%' }, { name: '第一金 (2892)', weight: '4.52%' }
  ],
  '0056.TW': [
    { name: '南亞 (1303)', weight: '9.95%' }, { name: '南亞科 (2408)', weight: '4.19%' }, { name: '華碩 (2357)', weight: '4.18%' }, 
    { name: '華南金 (2880)', weight: '3.96%' }, { name: '永豐金 (2890)', weight: '3.94%' }, { name: '華邦電 (2344)', weight: '3.72%' }, 
    { name: '中信金 (2891)', weight: '3.64%' }, { name: '緯創 (3231)', weight: '3.50%' }, { name: '廣達 (2382)', weight: '3.43%' }, { name: '兆豐金 (2886)', weight: '3.27%' }
  ],
  '00631L.TW': [
    { name: '臺股期貨20261001', weight: '155.12%' }, { name: '台積電 (2330)', weight: '41.76%' }, { name: '臺灣50ETF股票期貨20261001', weight: '3.22%' }
  ],
  '00690.TW': [
    { name: '台積電 (2330)', weight: '25.11%' }, { name: '聯發科 (2454)', weight: '16.40%' }, { name: '台達電 (2308)', weight: '9.40%' }, 
    { name: '聯電 (2303)', weight: '4.81%' }, { name: '台光電 (2383)', weight: '4.36%' }, { name: '富邦金 (2881)', weight: '4.04%' }, 
    { name: '國巨 (2327)', weight: '3.42%' }, { name: '奇鋐 (3017)', weight: '3.25%' }, { name: '致茂 (2360)', weight: '2.56%' }, { name: '智邦 (2345)', weight: '2.25%' }
  ],
  '00728.TW': [
    { name: '台積電 (2330)', weight: '25.43%' }, { name: '聯電 (2303)', weight: '15.06%' }, { name: '川湖 (2059)', weight: '9.05%' }, 
    { name: '致茂 (2360)', weight: '8.05%' }, { name: '大立光 (3008)', weight: '6.42%' }, { name: '健策 (3653)', weight: '6.32%' }, 
    { name: '研華 (2395)', weight: '4.22%' }, { name: '聯詠 (3034)', weight: '3.40%' }, { name: '亞德客-KY (1590)', weight: '1.95%' }, { name: '嘉澤 (3533)', weight: '1.76%' }
  ],
  '00830.TW': [
    { name: 'NVIDIA', weight: '18.5%' }, { name: 'Broadcom', weight: '12.1%' }, { name: 'AMD', weight: '8.5%' }, 
    { name: 'Qualcomm', weight: '6.2%' }, { name: 'Texas Instruments', weight: '5.8%' }, { name: 'Intel', weight: '5.1%' }, 
    { name: 'Applied Materials', weight: '4.8%' }, { name: 'Lam Research', weight: '4.5%' }, { name: 'KLA Corp', weight: '4.1%' }, { name: 'Analog Devices', weight: '3.8%' }
  ],
  '00861.TW': [
    { name: '台積電 (2330)', weight: '7.97%' }, { name: 'Samsung Electronics', weight: '7.90%' }, { name: 'Broadcom', weight: '7.57%' }, 
    { name: 'Apple', weight: '7.32%' }, { name: 'Cisco Systems', weight: '7.22%' }, { name: 'Applied Materials', weight: '6.83%' }, 
    { name: 'Lam Research', weight: '6.79%' }, { name: 'Marvell Technology', weight: '3.90%' }, { name: '聯發科 (2454)', weight: '3.46%' }, { name: 'Amphenol', weight: '3.38%' }
  ],
  '00875.TW': [
    { name: 'Rubrik', weight: '4.61%' }, { name: 'Netskope', weight: '4.38%' }, { name: 'CrowdStrike', weight: '4.12%' }, 
    { name: 'BlackBerry', weight: '3.99%' }, { name: 'SentinelOne', weight: '3.98%' }, { name: 'Cloudflare', weight: '3.97%' }, 
    { name: 'Trend Micro', weight: '3.94%' }, { name: 'Fastly', weight: '3.82%' }, { name: 'Fortinet', weight: '3.82%' }, { name: 'Palo Alto Networks', weight: '3.75%' }
  ],
  '00876.TW': [
    { name: 'Applied Materials', weight: '6.13%' }, { name: 'Lam Research', weight: '5.88%' }, { name: 'Marvell Technology', weight: '5.67%' }, 
    { name: 'ASML Holding', weight: '5.63%' }, { name: '台積電 (2330)', weight: '5.48%' }, { name: 'Broadcom', weight: '5.46%' }, 
    { name: '聯發科 (2454)', weight: '5.44%' }, { name: 'Amphenol', weight: '4.93%' }, { name: 'Qualcomm', weight: '4.29%' }, { name: 'Tokyo Electron', weight: '4.28%' }
  ],
  '00911.TW': [
    { name: '超微 (AMD)', weight: '9.38%' }, { name: '英特爾 (Intel)', weight: '8.55%' }, { name: '美光科技 (Micron)', weight: '7.44%' }, 
    { name: '輝達 (NVIDIA)', weight: '7.39%' }, { name: '博通 (Broadcom)', weight: '6.91%' }, { name: '邁威爾科技', weight: '4.64%' }, 
    { name: '亞德諾', weight: '3.96%' }, { name: '應用材料', weight: '3.94%' }, { name: '德州儀器', weight: '3.89%' }, { name: '科磊', weight: '3.84%' }
  ],
  '00913.TW': [
    { name: '台積電 (2330)', weight: '20.25%' }, { name: '聯電 (2303)', weight: '15.66%' }, { name: '華邦電 (2344)', weight: '12.47%' }, 
    { name: '聯發科 (2454)', weight: '11.26%' }, { name: '日月光投控 (3711)', weight: '9.15%' }, { name: '穩懋', weight: '6.84%' }, 
    { name: '致茂', weight: '6.75%' }, { name: '環球晶', weight: '4.62%' }, { name: '世界', weight: '3.75%' }, { name: '中美晶', weight: '1.77%' }
  ],
  '00927.TW': [
    { name: '聯發科 (2454)', weight: '14.38%' }, { name: '台積電 (2330)', weight: '14.22%' }, { name: '聯電 (2303)', weight: '8.24%' }, 
    { name: '日月光投控 (3711)', weight: '7.75%' }, { name: '瑞昱', weight: '5.30%' }, { name: '聯詠', weight: '4.53%' }, 
    { name: '環球晶', weight: '3.51%' }, { name: '世界', weight: '3.33%' }, { name: '鴻勁', weight: '3.08%' }, { name: '中美晶', weight: '2.55%' }
  ],
  '00935.TW': [
    { name: '台積電 (2330)', weight: '23.80%' }, { name: '聯發科 (2454)', weight: '16.69%' }, { name: '台達電 (2308)', weight: '9.59%' }, 
    { name: '日月光投控 (3711)', weight: '5.52%' }, { name: '聯電', weight: '3.98%' }, { name: '欣興', weight: '3.96%' }, 
    { name: '國巨*', weight: '2.81%' }, { name: '奇鋐', weight: '2.70%' }, { name: '智邦', weight: '2.30%' }, { name: '致茂', weight: '2.13%' }
  ],
  '00941.TW': [
    { name: '科林研發', weight: '7.08%' }, { name: '艾司摩爾', weight: '6.96%' }, { name: '應用材料', weight: '6.67%' }, 
    { name: 'Linde PLC', weight: '6.34%' }, { name: '氣體產品與化學', weight: '6.32%' }, { name: '愛德萬測試', weight: '6.27%' }, 
    { name: '液化空氣集團', weight: '6.24%' }, { name: '科磊公司', weight: '6.19%' }, { name: '信越化學工業', weight: '6.01%' }, { name: '東京威力科創', weight: '5.94%' }
  ],
  '00947.TW': [
    { name: '創意', weight: '10.93%' }, { name: '南亞科', weight: '9.72%' }, { name: '聯發科', weight: '9.22%' }, 
    { name: '華邦電', weight: '8.92%' }, { name: '台達電', weight: '8.28%' }, { name: '群聯', weight: '6.23%' }, 
    { name: '世芯-KY', weight: '6.03%' }, { name: '信驊', weight: '5.00%' }, { name: '旺宏', weight: '3.71%' }, { name: '瑞昱', weight: '3.53%' }
  ],
  '00960.TW': [
    { name: '馬士基', weight: '8.88%' }, { name: '商船三井', weight: '8.02%' }, { name: '長榮', weight: '7.75%' }, 
    { name: '日本郵船', weight: '7.73%' }, { name: '川崎汽船', weight: '5.46%' }, { name: '前線公開', weight: '5.41%' }, 
    { name: '美森公司', weight: '4.75%' }, { name: '萬海', weight: '3.76%' }, { name: '國際海道公司', weight: '3.46%' }, { name: 'HMM', weight: '3.19%' }
  ],
  '00981A.TW': [
    { name: '台積電 (2330)', weight: '10.13%' }, { name: '台光電', weight: '9.46%' }, { name: '欣興', weight: '8.61%' }, 
    { name: '聯發科', weight: '8.41%' }, { name: '奇鋐', weight: '7.35%' }, { name: '健策', weight: '5.82%' }, 
    { name: '國巨*', weight: '5.20%' }, { name: '台達電', weight: '5.03%' }, { name: '旺矽', weight: '4.73%' }, { name: '南電', weight: '4.52%' }
  ],
  '00988A.TW': [
    { name: 'Lumentum Holdings', weight: '7.72%' }, { name: 'Bloom Energy', weight: '6.72%' }, { name: '欣興', weight: '6.24%' }, 
    { name: 'SpaceX', weight: '5.51%' }, { name: 'Samsung Electro-Mechanics', weight: '5.08%' }, { name: 'Murata Manufacturing', weight: '4.39%' }, 
    { name: 'Palo Alto Networks', weight: '3.67%' }, { name: 'NVIDIA', weight: '3.48%' }, { name: '奇鋐', weight: '3.44%' }, { name: '聯發科', weight: '3.42%' }
  ]
};