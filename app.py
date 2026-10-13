import streamlit as st
import pandas as pd

# 設定網頁標題與排版
st.set_page_config(
    page_title="個人 ETF 前十大成分股儀表板",
    page_icon="📊",
    layout="wide"
)

# 定義你目前持有的 20 檔 ETF 清單（名稱與代號）
my_etfs = {
    "0050": "元大台灣50",
    "0052": "富邦科技",
    "0055": "元大MSCI金融",
    "0056": "元大高股息",
    "00631L": "元大臺灣50正2",
    "00690": "兆豐臺灣藍籌30",
    "00728": "第一金工業30",
    "00830": "國泰費城半導體",
    "00861": "元大全球未來通訊",
    "00875": "國泰網路資安",
    "00876": "元大全球5G",
    "00911": "兆豐洲際半導體",
    "00913": "兆豐台灣晶圓製造",
    "00927": "群益半導體收益",
    "00935": "野村臺灣新科技50",
    "00941": "中信上游半導體",
    "00947": "台新臺灣IC設計",
    "00960": "野村全球航運龍頭",
    "00981A": "主動統一台股增長",
    "00988A": "主動統一全球創新"
}

# 內建模擬/真實的前十大成分股對應資料庫
# 實務上可在此處串接投信 PDF 爬蟲、Goodinfo 爬蟲或證券 API
etf_top10_database = {
    "0050": ["台積電 (2330)", "鴻海 (2317)", "聯發科 (2454)", "台達電 (2308)", "廣達 (2382)", "日月光投控 (3711)", "聯電 (2303)", "中信金 (2891)", "富邦金 (2881)", "國泰金 (2882)"],
    "0052": ["台積電 (2330)", "聯發科 (2454)", "鴻海 (2317)", "聯電 (2303)", "廣達 (2382)", "日月光投控 (3711)", "台光電 (2383)", "國巨 (2327)", "欣興 (3037)", "奇鋐 (3017)"],
    "0055": ["中信金 (2891)", "國泰金 (2882)", "富邦金 (2881)", "兆豐金 (2886)", "元大金 (2885)", "玉山金 (2884)", "第一金 (2892)", "合庫金 (2880)", "永豐金 (2890)", "新光金 (2888)"],
    "0056": ["華碩 (2357)", "鴻海 (2317)", "廣達 (2382)", "緯創 (3231)", "中信金 (2891)", "光寶科 (2301)", "日月光投控 (3711)", "聯發科 (2454)", "元大金 (2885)", "華南金 (2880)"],
    "00631L": ["台積電 (2330)", "鴻海 (2317)", "聯發科 (2454)", "台達電 (2308)", "廣達 (2382)", "日月光投控 (3711)", "聯電 (2303)", "中信金 (2891)", "富邦金 (2881)", "國泰金 (2882)"], # 追蹤台灣50指數
    "00690": ["台積電 (2330)", "鴻海 (2317)", "聯發科 (2454)", "台達電 (2308)", "廣達 (2382)", "中華電 (2412)", "富邦金 (2881)", "國泰金 (2882)", "中信金 (2891)", "聯電 (2303)"],
    "00728": ["台積電 (2330)", "鴻海 (2317)", "聯發科 (2454)", "台達電 (2308)", "日月光投控 (3711)", "聯電 (2303)", "統一 (1216)", "台塑 (1301)", "南亞 (1303)", "台化 (1326)"],
    "00830": ["NVIDIA (NVDA)", "Broadcom (AVGO)", "AMD (AMD)", "Qualcomm (QCOM)", "Texas Instruments (TXN)", "Intel (INTC)", "Applied Materials (AMAT)", "Lam Research (LRCX)", "KLA Corp (KLAC)", "Analog Devices (ADI)"],
    "00861": ["Apple (AAPL)", "Microsoft (MSFT)", "NVIDIA (NVDA)", "Alphabet (GOOGL)", "Amazon (AMZN)", "Meta (META)", "Broadcom (AVGO)", "Cisco (CSCO)", "Qualcomm (QCOM)", "T-Mobile (TMUS)"],
    "00875": ["Palo Alto Networks (PANW)", "CrowdStrike (CRWD)", "Cloudflare (NET)", "Fortinet (FTNT)", "Zscaler (ZS)", "Check Point (CHKP)", "Cisco (CSCO)", "CyberArk (CYBR)", "Akamai (AKAM)", "Tenable (TENB)"],
    "00876": ["NVIDIA (NVDA)", "Apple (AAPL)", "Microsoft (MSFT)", "Broadcom (AVGO)", "Qualcomm (QCOM)", "Cisco (CSCO)", "Verizon (VZ)", "AT&T (T)", " Ericsson", "Nokia"],
    "00911": ["NVIDIA (NVDA)", "Broadcom (AVGO)", "TSMC ADR (TSM)", "AMD (AMD)", "Applied Materials (AMAT)", "Lam Research (LRCX)", "Qualcomm (QCOM)", "KLA Corp (KLAC)", "Texas Instruments (TXN)", "Analog Devices (ADI)"],
    "00913": ["台積電 (2330)", "聯發科 (2454)", "聯電 (2303)", "日月光投控 (3711)", "瑞昱 (2379)", "聯詠 (3034)", "世芯-KY (3661)", "創意 (3443)", "緯創 (3231)", "奇鋐 (3017)"],
    "00927": ["台積電 (2330)", "聯發科 (2454)", "聯電 (2303)", "日月光投控 (3711)", "瑞昱 (2379)", "聯詠 (3034)", "世界 (5347)", "力成 (6239)", "頎邦 (6147)", "京元電子 (2449)"],
    "00935": ["台積電 (2330)", "聯發科 (2454)", "鴻海 (2317)", "廣達 (2382)", "台達電 (2308)", "日月光投控 (3711)", "奇鋐 (3017)", "緯創 (3231)", "世芯-KY (3661)", "創意 (3443)"],
    "00941": ["ASML Holding", "Applied Materials (AMAT)", "Lam Research (LRCX)", "KLA Corp (KLAC)", "Tokyo Electron", "Synopsys (SNPS)", "Cadence (CDNS)", "Disco Corp", "Screen Holdings", "Lasertec"],
    "00947": ["聯發科 (2454)", "世芯-KY (3661)", "創意 (3443)", "力旺 (3529)", "祥碩 (5269)", " M31 (6643)", "智原 (3035)", "信驊 (5274)", "瑞昱 (2379)", "聯詠 (3034)"],
    "00960": ["Mitsui O.S.K. Lines", "Nippon Yusen Kabushiki Kaisha", "Kawasaki Kisen Kaisha", "Hapag-Lloyd", "Evergreen (2603)", "Yang Ming (2609)", "HMM Co", "Wan Hai (2615)", "Maersk", "CMA CGM"],
    "00981A": ["台積電 (2330)", "鴻海 (2317)", "聯發科 (2454)", "廣達 (2382)", "台達電 (2308)", "奇鋐 (3017)", "雙鴻 (3324)", "富世達 (6805)", "貿聯-KY (3665)", "川湖 (2059)"], # 主動型配置範例
    "00988A": ["NVIDIA (NVDA)", "Microsoft (MSFT)", "Apple (AAPL)", "Alphabet (GOOGL)", "Amazon (AMZN)", "Meta (META)", "Broadcom (AVGO)", "TSMC ADR (TSM)", "ASML", "Tesla (TSLA)"] # 主動型配置範例
}

st.title("📊 個人 ETF 持倉與前十大成分股檢視器")
st.markdown("---")

# 側邊欄：搜尋或快速選擇
st.sidebar.header("🔍 篩選與檢視")
selected_code = st.sidebar.selectbox(
    "選擇單一 ETF 深入檢視",
    options=["全部顯示"] + list(my_etfs.keys()),
    format_func=lambda x: f"{x} - {my_etfs[x]}" if x != "全部顯示" else "✨ 顯示全部持倉"
)

# 主畫面呈現邏輯
if selected_code == "全部顯示":
    st.subheader("📌 全部持倉總覽（前十大成分股）")
    
    # 建立多欄位排版
    for code, name in my_etfs.items():
        with st.expander(f"【{code}】 {name}", expanded=False):
            top10 = etf_top10_database.get(code, ["資料建置中..."])
            # 轉成 DataFrame 美化呈現
            df_top10 = pd.DataFrame({
                "排名": [f"第 {i+1} 名" for i in range(len(top10))],
                "成分股 / 標的": top10
            })
            st.table(df_top10)
else:
    # 顯示單一選定的 ETF
    name = my_etfs[selected_code]
    st.subheader(f"🎯 【{selected_code}】 {name} 詳細資訊")
    
    top10 = etf_top10_database.get(selected_code, ["資料建置中..."])
    df_top10 = pd.DataFrame({
        "排名": [f"第 {i+1} 名" for i in range(len(top10))],
        "成分股 / 標的": top10
    })
    st.dataframe(df_top10, use_container_width=True)

# 底部提示
st.markdown("---")
st.caption("💡 提示：若需串接即時最新成分股，後續可擴充爬蟲模組（如透過 Goodinfo、各大投信公開資訊或 API）來動態覆蓋 `etf_top10_database`。")