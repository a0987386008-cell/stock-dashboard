'use client';

import { useState, useEffect, useRef } from 'react';

const DEFAULT_US_STOCKS = ['KLAC', 'LRCX', 'MRVL', 'NVDA', 'MU'];
const DEFAULT_TW_STOCKS = ['2330', '5483', '3711', '4958', '2327', '2383', '2308', '2344'];
const DEFAULT_ETF_STOCKS = ['0050.TW', '0052.TW', '0056.TW', '00631L.TW', '00910.TW'];

const STATIC_TW_NAMES: Record<string, string> = {
  '5483': '中美晶', '2330': '台積電', '2317': '鴻海', '2454': '聯發科', '2308': '台達電',
  '2382': '廣達', '3711': '日月光投控', '2303': '聯電', '2383': '台光電', '4958': '臻鼎-KY',
  '3665': '貿聯-KY', '2327': '國巨', '3017': '奇鋐', '2344': '華邦電', '2891': '中信金', '2882': '國泰金', '2881': '富邦金'
};

const OTC_STOCKS = ['5483', '3293', '3105', '5347', '6182', '8299', '6274', '5340', '3163', '4979', '8069', '3529', '5274'];

const formatTwSymbolForApi = (sym: string) => {
  const clean = sym.replace('.TW', '').replace('.TWO', '');
  if (clean.includes('.')) return sym;
  if (OTC_STOCKS.includes(clean)) {
    return `${clean}.TWO`;
  }
  return `${clean}.TW`;
};

const SECTOR_MAP: Record<string, string> = {
  '台積電 (2330)': '半導體製造/代工', '日月光投控 (3711)': '半導體封測', '聯發科 (2454)': 'IC設計', '聯電 (2303)': '半導體代工',
  '中美晶 (5483)': '半導體矽晶圓', '華邦電 (2344)': '記憶體/IC', '南亞科 (2408)': '記憶體', '瑞昱': 'IC設計', '聯詠': 'IC設計', '世芯-KY': 'IP/ASIC設計', '創意': 'IP/ASIC設計',
  'NVIDIA (輝達)': '半導體/AI晶片', 'Micron (美光科技)': '記憶體', 'Applied Materials': '半導體設備', 'Lam Research Corporation': '半導體設備',
  'KLA Corp': '半導體設備', 'KLA Corporation': '半導體設備', 'KLAC': '半導體設備', 'Broadcom (博通)': '網通晶片/半導體', 'AMD': 'CPU/GPU/半導體', 'ASML Holding': '半導體設備/微影',
  'Qualcomm': '通訊晶片', 'Intel': 'CPU/半導體', '英特爾': 'CPU/半導體', '英特爾 (Intel)': 'CPU/半導體', 'Texas Instruments': '模擬晶片', 'Analog Devices': '模擬晶片', 'TSMC ADR': '半導體代工',
  
  '鴻海 (2317)': '電子代工/伺服器', '廣達 (2382)': 'AI伺服器/代工', '台達電 (2308)': '電源與散熱', '台光電 (2383)': 'CCL銅箔基板',
  '臻鼎-KY (4958)': 'PCB載板', '貿聯-KY (3665)': '連接器/線材', '國巨 (2327)': '被動元件', '奇鋐 (3017)': '散熱模組', '欣興 (3037)': 'ABF載板/PCB',
  '致茂 (2360)': '自動化/測試設備', '智邦 (2345)': '網通設備', '健策 (3653)': '散熱/均熱片', '華碩 (2357)': '電腦/伺服器', '緯創 (3231)': 'AI伺服器代工',
  'Marvell Technology, Inc.': '網通/ASIC晶片', 'Lumentum Holdings': '光通訊/雷射', 'Cisco Systems, Inc.': '網通設備', 'Amphenol': '連接器',
  
  '富邦金 (2881)': '金融保險', '中信金 (2891)': '金融保險', '國泰金 (2882)': '金融保險', '兆豐金 (2886)': '金融保險',
  '玉山金 (2884)': '金融保險', '永豐金 (2890)': '金融保險', '第一金 (2892)': '金融保險', '元大金 (2885)': '金融保險', '凱基金 (2883)': '金融保險',
  
  'Bloom Energy': '新能源/燃料電池', 'Chevron': '石油/能源', 'Chevron Corporation': '石油/能源', '雪佛龍': '石油/能源',
  'Occidental Petroleum Corporation': '石油/能源', 'Occidental Petroleum': '石油/能源', '西方石油': '石油/能源',
  'SpaceX': '低軌衛星/航太', '長榮': '貨櫃航運', '陽明': '貨櫃航運', '萬海': '貨櫃航運',
  '馬士基': '國際航運', '商船三井': '國際航運', '日本郵船': '國際航運', 
  
  'CrowdStrike': '資訊安全', 'Palo Alto Networks': '資訊安全', 'Palo Alto Networks, Inc.': '資訊安全', 
  'Cloudflare': '資訊安全', 'Rubrik': '資訊安全', 'Netskope': '資訊安全', 'Fortinet': '資訊安全', 'SentinelOne': '資訊安全',
  
  'Apple (蘋果)': '消費電子', 'Microsoft (微軟)': '雲端/軟體', 'Amazon': '雲端/電商', 'Alphabet': '網路/AI'
};

const getSectorByName = (name: string): string | null => {
  const upperName = name.toUpperCase();
  if (upperName.includes('期貨') || upperName.includes('FUTURE')) {
    return null;
  }

  if (SECTOR_MAP[name]) return SECTOR_MAP[name];
  
  if (name.includes('台積電') || name.includes('聯電') || name.includes('半導體') || name.includes('晶圓') || upperName.includes('KLA')) return '半導體與設備';
  if (name.includes('Intel') || name.includes('英特爾')) return 'CPU/半導體';
  if (name.includes('金') || name.includes('銀行') || name.includes('保險')) return '金融保險';
  if (name.includes('伺服器') || name.includes('廣達') || name.includes('鴻海') || name.includes('緯創')) return 'AI伺服器/組裝';
  if (name.includes('散熱') || name.includes('奇鋐') || name.includes('健策')) return '電子零組件/散熱';
  if (name.includes('記憶體') || name.includes('Micron') || name.includes('美光') || name.includes('華邦電')) return '記憶體產業';
  if (name.includes('航運') || name.includes('長榮') || name.includes('馬士基')) return '航運與物流';
  if (name.includes('資安') || name.includes('Security') || name.includes('Networks') || name.includes('CrowdStrike') || name.includes('Palo Alto')) return '資訊安全';
  if (name.includes('光') || name.includes('Lumentum')) return '光通訊/網通';
  if (name.includes('Chevron') || name.includes('雪佛龍') || name.includes('Occidental') || name.includes('西方石油') || name.includes('石油') || name.includes('能源')) return '石油/能源';

  return null;
};

const STATIC_ETF_HOLDINGS: Record<string, { name: string; weight: string }[]> = {
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

const isTaiwanStock = (name: string) => {
  const upper = name.toUpperCase();
  if (upper.includes('NVIDIA') || upper.includes('APPLE') || upper.includes('MICROSOFT') || 
      upper.includes('BROADCOM') || upper.includes('AMAZON') || upper.includes('ALPHABET') || 
      upper.includes('META') || upper.includes('ASML') || upper.includes('TESLA') || 
      upper.includes('INTEL') || upper.includes('英特爾') || upper.includes('AMD') || upper.includes('QUALCOMM') || 
      upper.includes('APPLIED MATERIALS') || upper.includes('LAM RESEARCH') || upper.includes('KLA') ||
      upper.includes('CROWDSTRIKE') || upper.includes('PALO ALTO') || upper.includes('CLOUDFLARE') ||
      upper.includes('MAERSK') || upper.includes('MITSUI') || upper.includes('NIPPON') || upper.includes('HAPAG') ||
      upper.includes('MICRON') || upper.includes('美光') || upper.includes('MARVELL') || upper.includes('CISCO') || 
      upper.includes('CHEVRON') || upper.includes('OCCIDENTAL') || upper.includes('TSMC ADR')) {
    return false;
  }
  return /\(\d{4}\)/.test(name) || name.includes('台積電') || name.includes('鴻海') || name.includes('聯發科') || 
         name.includes('台達電') || name.includes('廣達') || name.includes('日月光') || name.includes('聯電') || 
         name.includes('中信金') || name.includes('富邦金') || name.includes('國泰金') || name.includes('長榮') || 
         name.includes('陽明') || name.includes('萬海') || name.includes('世芯') || name.includes('奇鋐') ||
         name.includes('國巨') || name.includes('台光電') || name.includes('臻鼎') || name.includes('貿聯') || name.includes('中美晶') || name.includes('華邦電');
};

const normalizeAssetName = (name: string, isTw: boolean) => {
  const upper = name.toUpperCase();
  if (isTw) {
    if (upper.includes('2330') || upper.includes('台積電')) return '台積電 (2330)';
    if (upper.includes('2317') || upper.includes('鴻海')) return '鴻海 (2317)';
    if (upper.includes('2454') || upper.includes('聯發科')) return '聯發科 (2454)';
    if (upper.includes('2308') || upper.includes('台達電')) return '台達電 (2308)';
    if (upper.includes('2382') || upper.includes('廣達')) return '廣達 (2382)';
    if (upper.includes('3711') || upper.includes('日月光')) return '日月光投控 (3711)';
    if (upper.includes('2303') || upper.includes('聯電')) return '聯電 (2303)';
    if (upper.includes('2383') || upper.includes('台光電')) return '台光電 (2383)';
    if (upper.includes('4958') || upper.includes('臻鼎')) return '臻鼎-KY (4958)';
    if (upper.includes('3665') || upper.includes('貿聯')) return '貿聯-KY (3665)';
    if (upper.includes('2327') || upper.includes('國巨')) return '國巨 (2327)';
    if (upper.includes('5483') || upper.includes('中美晶')) return '中美晶 (5483)';
    if (upper.includes('2344') || upper.includes('華邦電')) return '華邦電 (2344)';
    return name.trim();
  } else {
    if (upper.includes('NVIDIA') || upper.includes('輝達')) return 'NVIDIA (輝達)';
    if (upper.includes('APPLE') || upper.includes('蘋果')) return 'Apple (蘋果)';
    if (upper.includes('MICROSOFT') || upper.includes('微軟')) return 'Microsoft (微軟)';
    if (upper.includes('BROADCOM') || upper.includes('博通')) return 'Broadcom (博通)';
    if (upper.includes('MICRON') || upper.includes('美光')) return 'Micron (美光科技)';
    if (upper.includes('INTEL') || upper.includes('英特爾')) return '英特爾 (Intel)';
    if (upper.includes('AMD')) return 'AMD';
    if (upper.includes('ASML')) return 'ASML Holding';
    if (upper.includes('APPLIED MATERIALS') || upper.includes('AMAT')) return 'Applied Materials';
    if (upper.includes('LAM RESEARCH')) return 'Lam Research Corporation';
    if (upper.includes('MARVELL')) return 'Marvell Technology, Inc.';
    if (upper.includes('CISCO')) return 'Cisco Systems, Inc.';
    if (upper.includes('CHEVRON') || upper.includes('雪佛龍')) return 'Chevron';
    if (upper.includes('OCCIDENTAL') || upper.includes('西方石油')) return 'Occidental Petroleum Corporation';
    if (upper.includes('KLA')) return 'KLA Corporation';
    if (upper.includes('TSMC ADR') || upper.includes('台積電ADR')) return 'TSMC ADR';
    if (upper.includes('CROWDSTRIKE')) return 'CrowdStrike';
    if (upper.includes('PALO ALTO')) return 'Palo Alto Networks';
    return name.trim();
  }
};

export default function StockDashboardPage() {
  const [usSymbols, setUsSymbols] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('my_us_stocks');
        if (saved) {
          const p = JSON.parse(saved);
          if (Array.isArray(p) && p.length > 0) return Array.from(new Set(p));
        }
      } catch (e) {}
    }
    return DEFAULT_US_STOCKS;
  });

  const [twSymbols, setTwSymbols] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('my_tw_stocks');
        if (saved) {
          const p = JSON.parse(saved);
          if (Array.isArray(p) && p.length > 0) {
            return Array.from(new Set(p.map((s: string) => s.replace(/\s+/g, ''))));
          }
        }
      } catch (e) {}
    }
    return DEFAULT_TW_STOCKS;
  });

  const [etfSymbols, setEtfSymbols] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('my_etf_stocks');
      if (saved) { try { const p = JSON.parse(saved); if (Array.isArray(p)) return Array.from(new Set(p)); } catch(e){} }
    }
    return DEFAULT_ETF_STOCKS;
  });

  const [usShares, setUsShares] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('my_us_shares');
      if (saved) { try { return JSON.parse(saved); } catch(e){} }
    }
    return { 'NVDA': 100 };
  });

  const [twShares, setTwShares] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('my_tw_shares');
      if (saved) { try { return JSON.parse(saved); } catch(e){} }
    }
    return { '2330': 2000, '5483': 8 };
  });

  const [etfShares, setEtfShares] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('my_etf_shares');
      if (saved) { try { return JSON.parse(saved); } catch(e){} }
    }
    return { '0050.TW': 5000, '0052.TW': 2000 };
  });

  const [usdToTwdRate, setUsdToTwdRate] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('usd_twd_rate');
      if (saved) { const num = parseFloat(saved); if (!isNaN(num)) return num; }
    }
    return 32.5;
  });

  const [cash, setCash] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('my_cash');
        if (saved) {
          const num = parseFloat(saved);
          if (!isNaN(num)) return num;
        }
      } catch (e) {}
    }
    return 0;
  });

  const [stocks, setStocks] = useState<any[]>([]);
  const [twStocksData, setTwStocksData] = useState<any[]>([]);
  const [usStocksData, setUsStocksData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [inputSymbol, setInputSymbol] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'US' | 'TW' | 'ETF' | 'SUMMARY_TW' | 'SUMMARY_US' | 'SUMMARY_SECTOR'>('US');
  const [selectedDrilldownEtf, setSelectedDrilldownEtf] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => { localStorage.setItem('my_us_stocks', JSON.stringify(usSymbols)); }, [usSymbols]);
  useEffect(() => { localStorage.setItem('my_tw_stocks', JSON.stringify(twSymbols)); }, [twSymbols]);
  useEffect(() => { localStorage.setItem('my_etf_stocks', JSON.stringify(etfSymbols)); }, [etfSymbols]);
  useEffect(() => { localStorage.setItem('my_us_shares', JSON.stringify(usShares)); }, [usShares]);
  useEffect(() => { localStorage.setItem('my_tw_shares', JSON.stringify(twShares)); }, [twShares]);
  useEffect(() => { localStorage.setItem('my_etf_shares', JSON.stringify(etfShares)); }, [etfShares]);
  useEffect(() => { localStorage.setItem('usd_twd_rate', String(usdToTwdRate)); }, [usdToTwdRate]);
  useEffect(() => { localStorage.setItem('my_cash', cash.toString()); }, [cash]);

  const handleExportJson = () => {
    const backupData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      usSymbols,
      twSymbols,
      etfSymbols,
      usShares,
      twShares,
      etfShares,
      usdToTwdRate,
      cash
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().slice(0, 10);
    const link = document.createElement('a');
    link.href = url;
    link.download = `portfolio_backup_${dateStr}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);

        if (data.usSymbols && Array.isArray(data.usSymbols)) setUsSymbols(data.usSymbols);
        if (data.twSymbols && Array.isArray(data.twSymbols)) setTwSymbols(data.twSymbols);
        if (data.etfSymbols && Array.isArray(data.etfSymbols)) setEtfSymbols(data.etfSymbols);
        if (data.usShares && typeof data.usShares === 'object') setUsShares(data.usShares);
        if (data.twShares && typeof data.twShares === 'object') setTwShares(data.twShares);
        if (data.etfShares && typeof data.etfShares === 'object') setEtfShares(data.etfShares);
        if (typeof data.usdToTwdRate === 'number') setUsdToTwdRate(data.usdToTwdRate);
        if (typeof data.cash === 'number') setCash(data.cash);

        alert('✅ 備份資料已成功匯入！');
      } catch (err) {
        alert('❌ 匯入失敗，請確認是否為正確的 JSON 備份檔案。');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const getAllSymbols = () => {
    const formattedTw = twSymbols.map(s => formatTwSymbolForApi(s));
    return Array.from(new Set([...usSymbols, ...formattedTw, ...etfSymbols]));
  };

  const symbolsRef = useRef(getAllSymbols());
  symbolsRef.current = getAllSymbols();

  const fetchAllData = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const allSyms = symbolsRef.current;

      if (allSyms.length === 0) {
        setStocks([]); setTwStocksData([]); setUsStocksData([]); setLoading(false); return;
      }

      const res = await fetch(`/api/stock?symbols=${encodeURIComponent(allSyms.join(','))}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.results) {
        const results = data.results;

        const etfRes = results.filter((s: any) => etfSymbols.includes(s.symbol) || etfSymbols.includes(s.symbol.replace('.TW', '').replace('.TWO', ''))).map((stock: any) => {
          if (!stock.holdings || stock.holdings.length === 0) {
            const cleanSym = stock.symbol.includes('.') ? stock.symbol : `${stock.symbol}.TW`;
            stock.holdings = STATIC_ETF_HOLDINGS[cleanSym] || STATIC_ETF_HOLDINGS[stock.symbol] || [];
          }
          return stock;
        });

        const twRes = results.map((s: any) => {
          const clean = s.symbol.replace('.TW', '').replace('.TWO', '');
          if (!s.name || s.name === s.symbol) {
            s.name = STATIC_TW_NAMES[clean] || clean;
          }
          return s;
        });

        const usRes = results.filter((s: any) => usSymbols.includes(s.symbol));

        setStocks(etfRes);
        setTwStocksData(twRes);
        setUsStocksData(usRes);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error('Failed to fetch stock data:', err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData(false);
    const intervalId = setInterval(() => { fetchAllData(true); }, 8000);
    return () => clearInterval(intervalId);
  }, [usSymbols, twSymbols, etfSymbols]);

  if (!isMounted) {
    return null;
  }

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = inputSymbol.trim().toUpperCase();
    if (!cleanInput) return;

    if (activeTab === 'US') {
      if (usSymbols.includes(cleanInput)) { setErrorMsg(`美股代號 ${cleanInput} 已存在！`); setTimeout(() => setErrorMsg(''), 3000); return; }
      setUsSymbols([...usSymbols, cleanInput]);
      setUsShares(prev => ({ ...prev, [cleanInput]: prev[cleanInput] || 0 }));
    } else if (activeTab === 'TW') {
      const formattedTw = cleanInput.replace('.TW', '').replace('.TWO', '');
      if (twSymbols.includes(formattedTw)) { setErrorMsg(`台股代號 ${formattedTw} 已存在！`); setTimeout(() => setErrorMsg(''), 3000); return; }
      setTwSymbols([...twSymbols, formattedTw]);
      setTwShares(prev => ({ ...prev, [formattedTw]: prev[formattedTw] || 0 }));
    } else if (activeTab === 'ETF') {
      const formattedEtf = cleanInput.includes('.') ? cleanInput : `${cleanInput}.TW`;
      if (etfSymbols.includes(formattedEtf)) { setErrorMsg(`ETF 代號 ${formattedEtf} 已存在！`); setTimeout(() => setErrorMsg(''), 3000); return; }
      setEtfSymbols([...etfSymbols, formattedEtf]);
      setEtfShares(prev => ({ ...prev, [formattedEtf]: prev[formattedEtf] || 0 }));
    }
    setInputSymbol('');
    setErrorMsg('');
  };

  const handleRemoveStock = (targetSymbol: string, type: 'US' | 'TW' | 'ETF') => {
    if (type === 'US') {
      setUsSymbols(usSymbols.filter(s => s !== targetSymbol));
      setUsShares(prev => { const copy = { ...prev }; delete copy[targetSymbol]; return copy; });
    } else if (type === 'TW') {
      const raw = targetSymbol.replace('.TW', '').replace('.TWO', '');
      setTwSymbols(twSymbols.filter(s => s !== raw));
      setTwShares(prev => { const copy = { ...prev }; delete copy[raw]; return copy; });
    } else {
      const raw = targetSymbol.includes('.') ? targetSymbol : `${targetSymbol}.TW`;
      setEtfSymbols(etfSymbols.filter(s => s !== targetSymbol && s !== raw));
      setEtfShares(prev => { const copy = { ...prev }; delete copy[targetSymbol]; delete copy[raw]; return copy; });
    }
  };

  const calculateRiskAndHoldings = () => {
    let totalPortfolioValueTwd = 0;
    let totalTwStockValTwd = 0;
    let totalUsStockValUsd = 0;
    let totalUsStockValTwd = 0;
    let totalEtfValTwd = 0;

    const assetValues: Record<string, number> = {}; 
    const sectorValues: Record<string, number> = {}; 
    const sectorStockSources: Record<string, Record<string, { directAmt: number; etfDetails: Record<string, number> }>> = {};

    const assetEtfSources: Record<string, Set<string>> = {};

    const addAssetSource = (assetName: string, etfName?: string) => {
      if (!assetEtfSources[assetName]) assetEtfSources[assetName] = new Set();
      if (etfName) assetEtfSources[assetName].add(etfName);
    };

    twStocksData.forEach((stock) => {
      const rawSym = stock.symbol.replace('.TW', '').replace('.TWO', '');
      const shares = twShares[rawSym] || twShares[stock.symbol] || 0;
      const val = shares * (stock.price || 0);
      totalTwStockValTwd += val;
      totalPortfolioValueTwd += val;

      const cleanName = normalizeAssetName(stock.name, true);
      assetValues[cleanName] = (assetValues[cleanName] || 0) + val;
      addAssetSource(cleanName);

      const sector = getSectorByName(cleanName);
      if (sector) {
        sectorValues[sector] = (sectorValues[sector] || 0) + val;
        if (!sectorStockSources[sector]) sectorStockSources[sector] = {};
        if (!sectorStockSources[sector][cleanName]) sectorStockSources[sector][cleanName] = { directAmt: 0, etfDetails: {} };
        sectorStockSources[sector][cleanName].directAmt += val;
      }
    });

    usStocksData.forEach((stock) => {
      const shares = usShares[stock.symbol] || 0;
      const valUsd = shares * (stock.price || 0);
      const valTwd = valUsd * usdToTwdRate;
      totalUsStockValUsd += valUsd;
      totalUsStockValTwd += valTwd;
      totalPortfolioValueTwd += valTwd;
      
      const cleanName = normalizeAssetName(stock.name || stock.symbol, false);
      assetValues[cleanName] = (assetValues[cleanName] || 0) + valTwd;
      addAssetSource(cleanName);

      const sector = getSectorByName(cleanName);
      if (sector) {
        sectorValues[sector] = (sectorValues[sector] || 0) + valTwd;
        if (!sectorStockSources[sector]) sectorStockSources[sector] = {};
        if (!sectorStockSources[sector][cleanName]) sectorStockSources[sector][cleanName] = { directAmt: 0, etfDetails: {} };
        sectorStockSources[sector][cleanName].directAmt += valTwd;
      }
    });

    stocks.forEach((stock) => {
      const cleanSym = stock.symbol.includes('.') ? stock.symbol : `${stock.symbol}.TW`;
      const shares = etfShares[stock.symbol] || etfShares[cleanSym] || 0;
      const etfMarketValue = shares * (stock.price || 0);
      totalEtfValTwd += etfMarketValue;
      totalPortfolioValueTwd += etfMarketValue;

      const rawHoldings = stock.holdings && stock.holdings.length > 0 
        ? stock.holdings 
        : (STATIC_ETF_HOLDINGS[cleanSym] || STATIC_ETF_HOLDINGS[stock.symbol] || []);

      const etfDisplayName = cleanSym.replace('.TW', '').replace('.TWO', '');

      rawHoldings.forEach((h: any) => {
        const weightNum = parseFloat(String(h.weight).replace('%', '')) || 0;
        const effectiveVal = etfMarketValue * (weightNum / 100);
        const isTw = isTaiwanStock(h.name);
        const cleanName = normalizeAssetName(h.name, isTw);

        assetValues[cleanName] = (assetValues[cleanName] || 0) + effectiveVal;
        addAssetSource(cleanName, etfDisplayName);

        const sector = getSectorByName(cleanName);
        if (sector) {
          sectorValues[sector] = (sectorValues[sector] || 0) + effectiveVal;
          if (!sectorStockSources[sector]) sectorStockSources[sector] = {};
          if (!sectorStockSources[sector][cleanName]) sectorStockSources[sector][cleanName] = { directAmt: 0, etfDetails: {} };
          sectorStockSources[sector][cleanName].etfDetails[etfDisplayName] = (sectorStockSources[sector][cleanName].etfDetails[etfDisplayName] || 0) + effectiveVal;
        }
      });
    });

    totalPortfolioValueTwd += cash;

    if (totalPortfolioValueTwd === 0) {
      return { 
        totalPortfolioValueTwd: 0, totalTwStockValTwd: 0, totalUsStockValUsd: 0, 
        totalUsStockValTwd: 0, totalEtfValTwd: 0, twPct: 0, usPct: 0, etfPct: 0,
        twTop: [], usTop: [], sectorTop: []
      };
    }

    const twPct = (totalTwStockValTwd / totalPortfolioValueTwd) * 100;
    const usPct = (totalUsStockValTwd / totalPortfolioValueTwd) * 100;
    const etfPct = (totalEtfValTwd / totalPortfolioValueTwd) * 100;

    const twMap: Record<string, number> = {};
    const usMap: Record<string, number> = {};

    Object.entries(assetValues).forEach(([name, val]) => {
      if (selectedDrilldownEtf) {
        const sources = assetEtfSources[name];
        if (!sources || !sources.has(selectedDrilldownEtf)) {
          return;
        }
      }

      const percentage = (val / totalPortfolioValueTwd) * 100;
      if (isTaiwanStock(name)) {
        twMap[name] = (twMap[name] || 0) + percentage;
      } else {
        usMap[name] = (usMap[name] || 0) + percentage;
      }
    });

    let twTop = Object.entries(twMap).map(([name, weight]) => {
      const amount = (weight / 100) * totalPortfolioValueTwd;
      return { name, weight, amount };
    }).sort((a, b) => b.weight - a.weight);

    let usTop = Object.entries(usMap).map(([name, weight]) => {
      const amount = (weight / 100) * totalPortfolioValueTwd;
      return { name, weight, amount };
    }).sort((a, b) => b.weight - a.weight);

    const sectorTop = Object.entries(sectorValues)
      .filter(([sectorName, amount]) => amount > 0)
      .map(([sectorName, amount]) => {
        const weight = (amount / totalPortfolioValueTwd) * 100;
        const stockMap = sectorStockSources[sectorName] || {};
        
        const topStocks = Object.entries(stockMap)
          .map(([stockName, sourceData]) => {
            const totalStockAmt = sourceData.directAmt + Object.values(sourceData.etfDetails).reduce((a, b) => a + b, 0);
            
            const sourceList: string[] = [];
            if (sourceData.directAmt > 0) {
              sourceList.push('📍 個股');
            }
            Object.keys(sourceData.etfDetails).forEach(etfName => {
              sourceList.push(`📊 ${etfName}`);
            });

            return {
              name: stockName,
              amount: totalStockAmt,
              percentageInSector: amount > 0 ? (totalStockAmt / amount) * 100 : 0,
              sources: sourceList
            };
          })
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 3);

        return { sectorName, amount, weight, topStocks };
      }).sort((a, b) => b.amount - a.amount);

    return { 
      totalPortfolioValueTwd, totalTwStockValTwd, totalUsStockValUsd, 
      totalUsStockValTwd, totalEtfValTwd, twPct, usPct, etfPct, 
      twTop: twTop.slice(0, 10), 
      usTop: usTop.slice(0, 10),
      sectorTop
    };
  };

  const riskAnalysis = calculateRiskAndHoldings();

  const getTargetRiskStatus = (topList: { name: string; weight: number }[]) => {
    if (topList.length === 0) return { level: '尚無資料', desc: '目前無持倉數據可供評估。', color: 'text-slate-400', badge: 'low' as const };
    const maxItem = topList[0];
    const w = maxItem.weight;

    if (w > 35) {
      return { level: '🔴 高風險 (嚴重集中)', desc: `注意！最大集中標的【${maxItem.name}】實質佔比高達 ${w.toFixed(1)}% (>35%)，若該標的回檔將對資產造成劇烈衝擊。`, color: 'text-red-400', badge: 'high' as const };
    } else if (w > 20) {
      return { level: '🟠 中高風險 (集中度偏高)', desc: `最大集中標的【${maxItem.name}】佔比達 ${w.toFixed(1)}% (20%-35%)，建議留意連動波動風險。`, color: 'text-amber-400', badge: 'medium' as const };
    } else if (w > 10) {
      return { level: '🟡 中度風險 (合理集中)', desc: `最大集中標的【${maxItem.name}】佔比為 ${w.toFixed(1)}% (10%-20%)，符合一般成長型投資範圍。`, color: 'text-yellow-400', badge: 'medium' as const };
    } else {
      return { level: '🟢 低風險 (配置分散)', desc: `最高佔比標的【${maxItem.name}】僅佔 ${w.toFixed(1)}% (≤10%)，整體配置相當分散。`, color: 'text-green-400', badge: 'low' as const };
    }
  };

  const twRisk = getTargetRiskStatus(riskAnalysis.twTop);
  const usRisk = getTargetRiskStatus(riskAnalysis.usTop);

  const sortedUsSymbols = [...usSymbols].sort((a, b) => {
    const stockA = usStocksData.find(s => s.symbol === a);
    const stockB = usStocksData.find(s => s.symbol === b);
    const valA = (usShares[a] || 0) * (stockA?.price || 0) * usdToTwdRate;
    const valB = (usShares[b] || 0) * (stockB?.price || 0) * usdToTwdRate;
    return valB - valA;
  });

  const sortedTwSymbols = [...twSymbols].sort((a, b) => {
    const apiA = formatTwSymbolForApi(a);
    const apiB = formatTwSymbolForApi(b);
    const stockA = twStocksData.find(s => s.symbol === a || s.symbol === apiA || s.symbol.replace('.TW', '').replace('.TWO', '') === a);
    const stockB = twStocksData.find(s => s.symbol === b || s.symbol === apiB || s.symbol.replace('.TW', '').replace('.TWO', '') === b);
    const valA = (twShares[a] || 0) * (stockA?.price || 0);
    const valB = (twShares[b] || 0) * (stockB?.price || 0);
    return valB - valA;
  });

  const sortedEtfSymbols = [...etfSymbols].sort((a, b) => {
    const stockA = stocks.find(s => s.symbol === a || s.symbol === `${a}.TW` || s.symbol.replace('.TW', '') === a.replace('.TW', ''));
    const stockB = stocks.find(s => s.symbol === b || s.symbol === `${b}.TW` || s.symbol.replace('.TW', '') === b.replace('.TW', ''));
    const valA = (etfShares[a] || etfShares[a.replace('.TW', '')] || 0) * (stockA?.price || 0);
    const valB = (etfShares[b] || etfShares[b.replace('.TW', '')] || 0) * (stockB?.price || 0);
    return valB - valA;
  });

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 selection:bg-blue-500/30">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header 頂部導覽區 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-blue-500 animate-pulse"></span>
              <h1 className="text-2xl font-black tracking-tight text-white">資產風險儀表板</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">結合「個股持倉」與「ETF X光穿透」的全面風險控管系統</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {lastUpdated && (
              <span className="text-xs text-slate-400 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800 font-mono shadow-inner">
                ⚡ 更新: {lastUpdated}
              </span>
            )}
            
            <button
              onClick={handleExportJson}
              className="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 px-3 py-1.5 rounded-xl font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/50 flex items-center gap-1.5"
              title="匯出持倉設定成 JSON 備份檔"
            >
              📥 匯出
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 px-3 py-1.5 rounded-xl font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/50 flex items-center gap-1.5"
              title="匯入 JSON 備份檔"
            >
              📤 匯入
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportJson}
              accept=".json"
              className="hidden"
            />

            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl shadow-inner">
              <span className="text-xs text-slate-400 font-medium">USD/TWD</span>
              <input
                type="number"
                step="0.01"
                value={Number(usdToTwdRate).toFixed(2)}
                onChange={(e) => setUsdToTwdRate(parseFloat(e.target.value) || 32.5)}
                className="w-20 bg-slate-950 border border-slate-700/80 rounded-lg px-2 py-0.5 text-xs font-mono text-emerald-400 font-bold text-right focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* 總資產頂部摘要卡片區 (精緻排版與視覺階層優化) */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/80 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5">
            
            <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-xl flex flex-col justify-between transition-all hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-950/20">
              <div className="text-xs text-slate-400 font-semibold mb-1 flex items-center justify-between">
                <span>總資產估值</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-1.5 py-0.5 rounded font-mono">TWD</span>
              </div>
              <div className="text-xl font-black font-mono text-emerald-400 tracking-tight my-1">
                $ {riskAnalysis.totalPortfolioValueTwd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">全資產含現金總計</div>
            </div>
            
            <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-xl flex flex-col justify-between transition-all hover:border-teal-500/40 hover:shadow-lg hover:shadow-teal-950/20">
              <div className="text-xs text-slate-400 font-semibold mb-1 flex items-center justify-between">
                <span>💵 持有現金</span>
                <span className="text-[10px] text-teal-400 font-mono">
                  {riskAnalysis.totalPortfolioValueTwd > 0 ? ((cash / riskAnalysis.totalPortfolioValueTwd) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="flex items-center gap-1 my-1">
                <span className="text-sm font-bold text-teal-400">$</span>
                <input 
                  type="text" 
                  value={cash === 0 ? '' : cash.toLocaleString('en-US')}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/,/g, '');
                    const num = parseFloat(raw);
                    setCash(isNaN(num) ? 0 : num);
                  }}
                  placeholder="0"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-0.5 text-base font-bold text-teal-300 font-mono focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
              <div className="text-[10px] text-slate-500 font-medium">點擊上方數值即可修改</div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-xl flex flex-col justify-between transition-all hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-950/20">
              <div className="text-xs text-slate-400 font-semibold mb-1 flex items-center justify-between">
                <span>🇹🇼 台股個股</span>
                <span className="text-[10px] bg-blue-950/80 text-blue-400 border border-blue-800/60 px-1.5 py-0.5 rounded font-mono">{riskAnalysis.twPct.toFixed(1)}%</span>
              </div>
              <div className="text-lg font-bold font-mono text-blue-400 my-1">
                $ {riskAnalysis.totalTwStockValTwd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">台股獨立市值合計</div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-xl flex flex-col justify-between transition-all hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-950/20">
              <div className="text-xs text-slate-400 font-semibold mb-1 flex items-center justify-between">
                <span>🇺🇸 美股個股</span>
                <span className="text-[10px] bg-purple-950/80 text-purple-400 border border-purple-800/60 px-1.5 py-0.5 rounded font-mono">{riskAnalysis.usPct.toFixed(1)}%</span>
              </div>
              <div className="text-lg font-bold font-mono text-purple-400 my-1">
                $ {riskAnalysis.totalUsStockValUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-xs text-purple-300 font-sans">USD</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                ≈ $ {riskAnalysis.totalUsStockValTwd.toLocaleString(undefined, { maximumFractionDigits: 0 })} TWD
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-xl flex flex-col justify-between transition-all hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-950/20">
              <div className="text-xs text-slate-400 font-semibold mb-1 flex items-center justify-between">
                <span>📊 ETF 總市值</span>
                <span className="text-[10px] bg-amber-950/80 text-amber-400 border border-amber-800/60 px-1.5 py-0.5 rounded font-mono">{riskAnalysis.etfPct.toFixed(1)}%</span>
              </div>
              <div className="text-lg font-bold font-mono text-amber-400 my-1">
                $ {riskAnalysis.totalEtfValTwd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">包含穿透成分價值</div>
            </div>

          </div>
        </div>

        {/* Tab 頁籤組件 */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800/80 pb-4">
          <div className="text-xs font-bold text-slate-400 mr-2 uppercase tracking-wider">持倉觀測：</div>
          <button
            onClick={() => setActiveTab('US')}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-all duration-200 text-xs flex items-center gap-1.5 ${
              activeTab === 'US' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-[1.02]' : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
            }`}
          >
            🇺🇸 美股觀測 ({usSymbols.length})
          </button>
          <button
            onClick={() => setActiveTab('TW')}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-all duration-200 text-xs flex items-center gap-1.5 ${
              activeTab === 'TW' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-[1.02]' : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
            }`}
          >
            🇹🇼 台股觀測 ({twSymbols.length})
          </button>
          <button
            onClick={() => setActiveTab('ETF')}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-all duration-200 text-xs flex items-center gap-1.5 ${
              activeTab === 'ETF' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-[1.02]' : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
            }`}
          >
            📊 ETF 觀測 ({etfSymbols.length})
          </button>

          <div className="w-px h-5 bg-slate-800 mx-2 hidden sm:block"></div>

          <div className="text-xs font-bold text-slate-400 mr-2 uppercase tracking-wider">穿透透視：</div>
          <button
            onClick={() => { setActiveTab('SUMMARY_TW'); setSelectedDrilldownEtf(null); }}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-all duration-200 text-xs flex items-center gap-1.5 ${
              activeTab === 'SUMMARY_TW' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-[1.02]' : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
            }`}
          >
            📈 總合台股 TOP 10
          </button>
          <button
            onClick={() => { setActiveTab('SUMMARY_US'); setSelectedDrilldownEtf(null); }}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-all duration-200 text-xs flex items-center gap-1.5 ${
              activeTab === 'SUMMARY_US' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-[1.02]' : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
            }`}
          >
            📊 總合美股 TOP 10
          </button>
          
          <button
            onClick={() => { setActiveTab('SUMMARY_SECTOR'); setSelectedDrilldownEtf(null); }}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-all duration-200 text-xs flex items-center gap-1.5 ${
              activeTab === 'SUMMARY_SECTOR' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-[1.02]' : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
            }`}
          >
            🏭 產業資金分佈
          </button>
        </div>

        {/* 持倉新增與輸入介面 */}
        {activeTab !== 'SUMMARY_TW' && activeTab !== 'SUMMARY_US' && activeTab !== 'SUMMARY_SECTOR' && (
          <div className="space-y-6">
            <form onSubmit={handleAddStock} className="flex gap-2.5">
              <input
                type="text"
                value={inputSymbol}
                onChange={(e) => setInputSymbol(e.target.value)}
                placeholder={activeTab === 'US' ? "輸入美股代號 (例如: TSLA)..." : activeTab === 'TW' ? "輸入台股代號 (例如: 2454, 5483)..." : "輸入 ETF 代號 (例如: 0050, 00910)..."}
                className="flex-1 bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/80 font-mono text-xs transition-colors shadow-inner"
              />
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-blue-600/20 text-xs hover:-translate-y-0.5">新增標的</button>
            </form>

            {errorMsg && <div className="bg-red-950/40 border border-red-800/50 text-red-300 px-4 py-2.5 rounded-xl text-xs">{errorMsg}</div>}

            {/* 持有股數與對應金額調整區卡片 (Grid 與資訊密度再優化) */}
            {activeTab === 'US' && (
              <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-xl">
                <h2 className="text-xs font-bold text-slate-300 mb-3 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><span>⚙️</span> 美股持倉與估值設定</span>
                  <span className="text-[10px] text-slate-500 font-normal">依持有金額高至低排序</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {sortedUsSymbols.map((sym) => {
                    const stock = usStocksData.find(s => s.symbol === sym);
                    const price = stock?.price || 0;
                    const shares = usShares[sym] || 0;
                    const valUsd = shares * price;
                    const valTwd = valUsd * usdToTwdRate;

                    return (
                      <div key={sym} className="flex flex-col justify-between bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all duration-200">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-xs font-bold text-slate-200 font-mono">{sym}</label>
                          <button
                            onClick={() => handleRemoveStock(sym, 'US')}
                            className="text-slate-500 hover:text-red-400 text-xs p-1 rounded transition-colors"
                            title={`移除 ${sym}`}
                          >
                            🗑️
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-[11px] text-slate-400 whitespace-nowrap">股數:</span>
                          <input
                            type="number"
                            value={usShares[sym] || ''}
                            onChange={(e) => setUsShares({ ...usShares, [sym]: parseFloat(e.target.value) || 0 })}
                            placeholder="0"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-100 font-mono text-right focus:outline-none focus:border-purple-500/80 transition-colors"
                          />
                        </div>
                        <div className="pt-2 border-t border-slate-800/60 flex justify-between items-baseline">
                          <span className="text-[10px] text-slate-400">市值</span>
                          <div className="text-right">
                            <div className="text-xs font-mono font-bold text-purple-400">$ {valUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })} USD</div>
                            <div className="text-[10px] text-slate-400 font-mono">≈ ${valTwd.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'TW' && (
              <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-xl">
                <h2 className="text-xs font-bold text-slate-300 mb-3 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><span>⚙️</span> 台股持倉與估值設定</span>
                  <span className="text-[10px] text-slate-500 font-normal">依持有金額高至低排序</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {sortedTwSymbols.map((sym) => {
                    const displayName = STATIC_TW_NAMES[sym] || sym;
                    const apiSymFormat = formatTwSymbolForApi(sym);
                    const stock = twStocksData.find(s => s.symbol === sym || s.symbol === apiSymFormat || s.symbol.replace('.TW', '').replace('.TWO', '') === sym);
                    const price = stock?.price || 0;
                    const shares = twShares[sym] || 0;
                    const valTwd = shares * price;

                    return (
                      <div key={sym} className="flex flex-col justify-between bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all duration-200">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-xs font-bold text-slate-200 truncate" title={displayName}>{displayName} <span className="text-[10px] font-mono text-slate-400">({sym})</span></label>
                          <button
                            onClick={() => handleRemoveStock(sym, 'TW')}
                            className="text-slate-500 hover:text-red-400 text-xs p-1 rounded transition-colors"
                            title={`移除 ${sym}`}
                          >
                            🗑️
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-[11px] text-slate-400 whitespace-nowrap">股數:</span>
                          <input
                            type="number"
                            value={twShares[sym] || ''}
                            onChange={(e) => setTwShares({ ...twShares, [sym]: parseFloat(e.target.value) || 0 })}
                            placeholder="0"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-100 font-mono text-right focus:outline-none focus:border-blue-500/80 transition-colors"
                          />
                        </div>
                        <div className="pt-2 border-t border-slate-800/60 flex justify-between items-baseline">
                          <span className="text-[10px] text-slate-400">市值</span>
                          <span className="text-xs font-mono font-bold text-blue-400">$ {valTwd.toLocaleString(undefined, { maximumFractionDigits: 0 })} TWD</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'ETF' && (
              <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-xl">
                <h2 className="text-xs font-bold text-slate-300 mb-3 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><span>⚙️</span> ETF 持倉與估值設定</span>
                  <span className="text-[10px] text-slate-500 font-normal">依持有金額高至低排序</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {sortedEtfSymbols.map((sym) => {
                    const stock = stocks.find(s => s.symbol === sym || s.symbol === `${sym}.TW` || s.symbol.replace('.TW', '') === sym.replace('.TW', ''));
                    const price = stock?.price || 0;
                    const shares = etfShares[sym] || etfShares[sym.replace('.TW', '')] || 0;
                    const valTwd = shares * price;

                    return (
                      <div key={sym} className="flex flex-col justify-between bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all duration-200">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-xs font-bold text-slate-200 font-mono">{sym}</label>
                          <button
                            onClick={() => handleRemoveStock(sym, 'ETF')}
                            className="text-slate-500 hover:text-red-400 text-xs p-1 rounded transition-colors"
                            title={`移除 ${sym}`}
                          >
                            🗑️
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-[11px] text-slate-400 whitespace-nowrap">股數:</span>
                          <input
                            type="number"
                            value={etfShares[sym] || etfShares[sym.replace('.TW', '')] || ''}
                            onChange={(e) => setEtfShares({ ...etfShares, [sym]: parseFloat(e.target.value) || 0 })}
                            placeholder="0"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-100 font-mono text-right focus:outline-none focus:border-amber-500/80 transition-colors"
                          />
                        </div>
                        <div className="pt-2 border-t border-slate-800/60 flex justify-between items-baseline">
                          <span className="text-[10px] text-slate-400">市值</span>
                          <span className="text-xs font-mono font-bold text-amber-400">$ {valTwd.toLocaleString(undefined, { maximumFractionDigits: 0 })} TWD</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 觀測列表區卡片 (精細化排版) */}
            <div className="space-y-3">
              {activeTab === 'US' && sortedUsSymbols.map((sym) => {
                const stock = usStocksData.find(s => s.symbol === sym) || { symbol: sym, name: sym, price: 0, change: 0, changePercent: 0, isUp: true };
                return (
                  <div key={sym} className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 shadow-lg hover:border-slate-700/80 hover:-translate-y-0.5 transition-all duration-200 flex justify-between items-center">
                    <div>
                      <div className="text-sm font-bold text-slate-100">{stock.name || sym} <span className="text-xs font-mono text-slate-400">({sym})</span></div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">美股市場 (USD)</div>
                    </div>
                    <div className="flex items-center gap-5">
                      <div className="text-right">
                        <div className="text-base font-bold font-mono">$ {stock.price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        <div className={`text-xs font-semibold font-mono mt-0.5 ${stock.isUp ? 'text-red-400' : 'text-green-400'}`}>
                          {stock.isUp ? '+' : ''}{stock.change?.toFixed(2)} ({stock.isUp ? '+' : ''}{stock.changePercent?.toFixed(2)}%)
                        </div>
                      </div>
                      <button onClick={() => handleRemoveStock(sym, 'US')} className="text-slate-500 hover:text-red-400 p-2 rounded-lg transition-colors" title="刪除此觀測股">🗑️</button>
                    </div>
                  </div>
                );
              })}

              {activeTab === 'TW' && sortedTwSymbols.map((sym) => {
                const apiSymFormat = formatTwSymbolForApi(sym);
                const stock = twStocksData.find(s => s.symbol === sym || s.symbol === apiSymFormat || s.symbol.replace('.TW', '').replace('.TWO', '') === sym);
                const displayName = STATIC_TW_NAMES[sym] || (stock?.name && stock.name !== stock.symbol ? stock.name : sym);
                const price = stock?.price || 0;
                const change = stock?.change || 0;
                const changePercent = stock?.changePercent || 0;
                const isUp = stock?.isUp ?? true;

                return (
                  <div key={sym} className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 shadow-lg hover:border-slate-700/80 hover:-translate-y-0.5 transition-all duration-200 flex justify-between items-center">
                    <div>
                      <div className="text-sm font-bold text-slate-100">{displayName} <span className="text-xs font-mono text-slate-400">({sym})</span></div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">台股市場 (TWD) {apiSymFormat.endsWith('.TWO') ? '• 上櫃' : '• 上市'}</div>
                    </div>
                    <div className="flex items-center gap-5">
                      <div className="text-right">
                        <div className="text-base font-bold font-mono">$ {price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        <div className={`text-xs font-semibold font-mono mt-0.5 ${isUp ? 'text-red-400' : 'text-green-400'}`}>
                          {isUp ? '+' : ''}{change.toFixed(2)} ({isUp ? '+' : ''}{changePercent?.toFixed(2)}%)
                        </div>
                      </div>
                      <button onClick={() => handleRemoveStock(sym, 'TW')} className="text-slate-500 hover:text-red-400 p-2 rounded-lg transition-colors" title="刪除此觀測股">🗑️</button>
                    </div>
                  </div>
                );
              })}

              {activeTab === 'ETF' && sortedEtfSymbols.map((sym) => {
                const stock = stocks.find(s => s.symbol === sym || s.symbol === `${sym}.TW` || s.symbol.replace('.TW', '') === sym.replace('.TW', '')) || { symbol: sym, name: sym, price: 0, change: 0, changePercent: 0, isUp: true, holdings: [] };
                const cleanSym = sym.replace('.TW', '');
                return (
                  <div key={sym} className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 shadow-lg hover:border-slate-700/80 transition-all duration-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-bold text-slate-100">{stock.name || cleanSym} <span className="text-xs font-mono text-slate-400">({cleanSym})</span></div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">ETF 穿透觀測</div>
                      </div>
                      <div className="flex items-center gap-5">
                        <div className="text-right">
                          <div className="text-base font-bold font-mono">$ {stock.price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                          <div className={`text-xs font-semibold font-mono mt-0.5 ${stock.isUp ? 'text-red-400' : 'text-green-400'}`}>
                            {stock.isUp ? '+' : ''}{stock.change?.toFixed(2)} ({stock.isUp ? '+' : ''}{stock.changePercent?.toFixed(2)}%)
                          </div>
                        </div>
                        <button onClick={() => handleRemoveStock(sym, 'ETF')} className="text-slate-500 hover:text-red-400 p-2 rounded-lg transition-colors" title="刪除此觀測 ETF">🗑️</button>
                      </div>
                    </div>
                    {/* ETF 前十大成分股微卡片網格優化 */}
                    <div className="mt-3.5 pt-3 border-t border-slate-800/60">
                      <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center justify-between">
                        <span>📊 前十大成分股與權重佔比</span>
                        <span className="text-[10px] text-slate-500 font-normal">X光底層透視</span>
                      </div>
                      {stock.holdings && stock.holdings.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {stock.holdings.map((h: any, idx: number) => (
                            <div key={idx} className="bg-slate-950/70 border border-slate-800/60 rounded-xl p-2 text-center hover:border-slate-700 transition-all">
                              <div className="text-xs font-semibold text-slate-200 truncate" title={h.name}>{h.name}</div>
                              <div className="text-xs font-mono font-bold text-blue-400 mt-0.5">{h.weight}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500 italic py-1">無成分股明細</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 穿透分析頁籤 1: 總合台股 */}
        {activeTab === 'SUMMARY_TW' && (
          <div className="space-y-5">
            <RiskBanner 
              level={twRisk.badge} 
              title={`台股市場集中度診斷：${twRisk.level}`} 
              description={twRisk.desc} 
            />

            <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 mr-2 uppercase tracking-wider">🎯 ETF 快速反查篩選：</span>
              <button
                onClick={() => setSelectedDrilldownEtf(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                  selectedDrilldownEtf === null ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                全部顯示
              </button>
              {etfSymbols.map(sym => {
                const etfName = sym.replace('.TW', '').replace('.TWO', '');
                return (
                  <button
                    key={sym}
                    onClick={() => setSelectedDrilldownEtf(etfName)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                      selectedDrilldownEtf === etfName ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {etfName}
                  </button>
                );
              })}
            </div>

            <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
              <div className="flex justify-between items-center mb-1">
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <span>🇹🇼</span> 總合台股持倉前十大佔比與金額 (個股 + ETF 穿透)
                </h2>
                {selectedDrilldownEtf && (
                  <span className="text-xs bg-blue-950 text-blue-300 border border-blue-800 px-2.5 py-0.5 rounded-lg">
                    篩選 [{selectedDrilldownEtf}] 相關標的
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mb-5">即時統計你在台股市場（含直接持股與台股 ETF 內隱含成分）的實質佔比與對應台幣金額。</p>

              {riskAnalysis.twTop.length > 0 ? (
                <div className="space-y-2.5">
                  {riskAnalysis.twTop.map((item, index: number) => (
                    <div 
                      key={item.name} 
                      className="relative overflow-hidden flex items-center justify-between bg-slate-950/50 border border-slate-800/60 px-4 py-3 rounded-xl hover:border-slate-700/80 transition-all duration-200"
                    >
                      <div 
                        className="absolute inset-y-0 left-0 bg-blue-600/15 pointer-events-none transition-all duration-500" 
                        style={{ width: `${Math.min(item.weight, 100)}%` }}
                      />

                      <div className="relative z-10 flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-slate-500 w-5">#{index + 1}</span>
                        <span className="text-xs font-bold text-slate-200">{item.name}</span>
                      </div>
                      <div className="relative z-10 flex items-center gap-5">
                        <div className="text-right">
                          <div className="text-xs font-mono font-bold text-blue-400">{item.weight.toFixed(2)}%</div>
                          <div className="text-[11px] font-mono text-slate-300 font-bold">
                            $ {item.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })} TWD
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500 text-xs">目前無符合條件的台股總合持倉數據。</div>
              )}
            </div>
          </div>
        )}

        {/* 穿透分析頁籤 2: 總合美股 */}
        {activeTab === 'SUMMARY_US' && (
          <div className="space-y-5">
            <RiskBanner 
              level={usRisk.badge} 
              title={`美股市場集中度診斷：${usRisk.level}`} 
              description={usRisk.desc} 
            />

            <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 mr-2 uppercase tracking-wider">🎯 ETF 快速反查篩選：</span>
              <button
                onClick={() => setSelectedDrilldownEtf(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                  selectedDrilldownEtf === null ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                全部顯示
              </button>
              {etfSymbols.map(sym => {
                const etfName = sym.replace('.TW', '').replace('.TWO', '');
                return (
                  <button
                    key={sym}
                    onClick={() => setSelectedDrilldownEtf(etfName)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                      selectedDrilldownEtf === etfName ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {etfName}
                  </button>
                );
              })}
            </div>

            <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
              <div className="flex justify-between items-center mb-1">
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <span>🇺🇸</span> 總合美股/海外持倉前十大佔比與金額 (個股 + ETF 穿透)
                </h2>
                {selectedDrilldownEtf && (
                  <span className="text-xs bg-purple-950 text-purple-300 border border-purple-800 px-2.5 py-0.5 rounded-lg">
                    篩選 [{selectedDrilldownEtf}] 相關標的
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mb-5">即時統計你在美股與海外市場（含直接美股持股與海外/半導體/科技 ETF 內隱含成分）的實質佔比與對應台幣金額。</p>

              {riskAnalysis.usTop.length > 0 ? (
                <div className="space-y-2.5">
                  {riskAnalysis.usTop.map((item, index: number) => (
                    <div 
                      key={item.name} 
                      className="relative overflow-hidden flex items-center justify-between bg-slate-950/50 border border-slate-800/60 px-4 py-3 rounded-xl hover:border-slate-700/80 transition-all duration-200"
                    >
                      <div 
                        className="absolute inset-y-0 left-0 bg-purple-600/15 pointer-events-none transition-all duration-500" 
                        style={{ width: `${Math.min(item.weight, 100)}%` }}
                      />

                      <div className="relative z-10 flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-slate-500 w-5">#{index + 1}</span>
                        <span className="text-xs font-bold text-slate-200">{item.name}</span>
                      </div>
                      <div className="relative z-10 flex items-center gap-5">
                        <div className="text-right">
                          <div className="text-xs font-mono font-bold text-purple-400">{item.weight.toFixed(2)}%</div>
                          <div className="text-[11px] font-mono text-slate-300 font-bold">
                            $ {item.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })} TWD
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500 text-xs">目前無符合條件的美股總合持倉數據。</div>
              )}
            </div>
          </div>
        )}

        {/* 穿透分析頁籤 3: 產業資金分佈 */}
        {activeTab === 'SUMMARY_SECTOR' && (
          <div className="space-y-5">
            <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
              <div className="flex justify-between items-center mb-1">
                <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <span>🏭</span> 全資產產業集中度與資金配置分析
                </h2>
              </div>
              <p className="text-xs text-slate-400 mb-5">跨越台股、美股與 ETF X光穿透底層標的，自動將資金歸類至對應產業，並列出各產業中的前三大代表持股與持有來源。</p>

              {riskAnalysis.sectorTop.length > 0 ? (
                <div className="space-y-3.5">
                  {riskAnalysis.sectorTop.map((item, index: number) => (
                    <div 
                      key={item.sectorName} 
                      className="relative overflow-hidden flex flex-col bg-slate-950/50 border border-slate-800/60 p-4 rounded-xl gap-2.5 hover:border-slate-700/80 transition-all duration-200"
                    >
                      <div 
                        className="absolute inset-y-0 left-0 bg-emerald-600/10 pointer-events-none transition-all duration-500" 
                        style={{ width: `${Math.min(item.weight, 100)}%` }}
                      />

                      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-mono font-bold text-slate-500 w-5">#{index + 1}</span>
                          <div>
                            <span className="text-sm font-bold text-emerald-300">{item.sectorName}</span>
                            <span className="block text-[11px] text-slate-400 mt-0.5">
                              佔總投資組合 <strong className="text-slate-200">{item.weight.toFixed(2)}%</strong>
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-mono font-bold text-slate-100">
                            $ {Math.round(item.amount).toLocaleString()} TWD
                          </div>
                          <div className="w-full sm:w-44 bg-slate-900 border border-slate-800 rounded-full h-1.5 mt-1 overflow-hidden ml-auto">
                            <div 
                              className="bg-emerald-500 h-full rounded-full transition-all" 
                              style={{ width: `${Math.min(item.weight, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {item.topStocks && item.topStocks.length > 0 && (
                        <div className="relative z-10 pt-0.5">
                          <div className="text-[10px] font-bold text-slate-400 mb-1.5 flex items-center gap-1">
                            <span>🎯 該產業實質持值代表標的與來源：</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {item.topStocks.map((stk, sIdx) => (
                              <div key={sIdx} className="bg-slate-900/90 border border-slate-800/80 p-2.5 rounded-xl flex flex-col justify-between gap-1.5">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="text-xs font-bold text-slate-200 block truncate" title={stk.name}>{stk.name}</span>
                                    <span className="text-[10px] text-slate-400">佔產業 {stk.percentageInSector.toFixed(1)}%</span>
                                  </div>
                                  <span className="text-xs font-mono font-bold text-emerald-400 whitespace-nowrap">
                                    ${Math.round(stk.amount).toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-800/50">
                                  {stk.sources.map((src, srcIdx) => (
                                    <span key={srcIdx} className="text-[9px] bg-slate-950 border border-slate-800 px-1 py-0.2 rounded text-slate-300 font-mono">
                                      {src}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500 text-xs">目前無數據可進行產業分佈分析。</div>
              )}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

{/* 風險診斷 Banner 元件 */}
function RiskBanner({ level, title, description }: { level: 'high' | 'medium' | 'low'; title: string; description: string }) {
  const config = {
    high: { border: 'border-red-500/80', bg: 'bg-red-950/20', text: 'text-red-400', subText: 'text-red-300/80', badgeBg: 'bg-red-500', pingBg: 'bg-red-400', icon: '🔴' },
    medium: { border: 'border-amber-500/80', bg: 'bg-amber-950/20', text: 'text-amber-400', subText: 'text-amber-300/80', badgeBg: 'bg-amber-500', pingBg: 'bg-amber-400', icon: '🟠' },
    low: { border: 'border-emerald-500/80', bg: 'bg-emerald-950/20', text: 'text-emerald-400', subText: 'text-emerald-300/80', badgeBg: 'bg-emerald-500', pingBg: 'bg-emerald-400', icon: '🟢' },
  }[level];

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${config.border} ${config.bg} p-4 shadow-xl backdrop-blur-md transition-all duration-200`}>
      <div className="absolute top-4 right-4 flex h-2.5 w-2.5">
        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${config.pingBg} opacity-75`}></span>
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${config.badgeBg}`}></span>
      </div>
      <div className="flex items-center space-x-3">
        <span className="text-xl">{config.icon}</span>
        <div>
          <h3 className={`text-sm font-bold ${config.text}`}>{title}</h3>
          <p className={`text-xs mt-0.5 ${config.subText}`}>{description}</p>
        </div>
      </div>
    </div>
  );
}