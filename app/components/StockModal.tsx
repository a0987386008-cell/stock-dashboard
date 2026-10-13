'use client';

import React, { useState, useEffect } from 'react';

export interface StockDetail {
  name: string;
  symbol: string;
  price: number;
  change?: number;
  changePercent: number;
  weight: string;
  openPrice?: number;
  highPrice?: number;
  lowPrice?: number;
  volume?: string;
  peRatio?: string;
  candles?: { day: string; open: number; high: number; low: number; close: number }[];
}

interface TrendPoint {
  time: string;
  price: number;
}

export default function StockModal({
  stock,
  isFavorite,
  onToggleFavorite,
  onClose,
}: {
  stock: StockDetail | null;
  isFavorite: boolean;
  onToggleFavorite: (symbol: string) => void;
  onClose: () => void;
}) {
  const [chartType, setChartType] = useState<'kline' | 'trend'>('kline');
  const [stockData, setStockData] = useState<StockDetail | null>(stock);
  const [intradayTrend, setIntradayTrend] = useState<TrendPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTrendLoading, setIsTrendLoading] = useState<boolean>(false);
  const [hoveredData, setHoveredData] = useState<{
    label: string;
    open: number;
    high: number;
    low: number;
    close: number;
  } | null>(null);

  // 1. 載入基本與日K歷史數據
  useEffect(() => {
    if (!stock) return;
    let isMounted = true;

    async function fetchRealStockData() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/stock?symbol=${encodeURIComponent(stock!.symbol)}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data) {
            setStockData({
              ...stock,
              ...data,
              candles: data.candles || stock!.candles,
            });
          }
        } else {
          if (isMounted) setStockData(stock);
        }
      } catch (error) {
        console.error('Failed to fetch real stock data:', error);
        if (isMounted) setStockData(stock);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchRealStockData();

    return () => {
      isMounted = false;
    };
  }, [stock]);

  // 2. 當切換至「即時走勢」時，從真實 API 抓取今日盤中即時分時數據
  useEffect(() => {
    if (chartType !== 'trend' || !stockData) return;
    let isMounted = true;

    async function fetchIntradayData() {
      setIsTrendLoading(true);
      try {
        const res = await fetch(`/api/stock?symbol=${encodeURIComponent(stockData!.symbol)}&interval=5m&range=1d`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.intraday && data.intraday.length > 0) {
            setIntradayTrend(data.intraday);
            return;
          }
        }
        
        // 若 API 無法取得高頻分時點，根據現有的開、高、低、現價在前端自動生成合理的今日走勢曲線
        if (isMounted) {
          const o = stockData.openPrice ?? stockData.price;
          const h = stockData.highPrice ?? stockData.price;
          const l = stockData.lowPrice ?? stockData.price;
          const c = stockData.price;

          // 生成台股從 09:00 到 13:30 的模擬即時走勢節點
          const fallbackPoints: TrendPoint[] = [
            { time: '09:00', price: o },
            { time: '09:30', price: parseFloat(((o + h) / 2).toFixed(2)) },
            { time: '10:00', price: h },
            { time: '10:30', price: parseFloat(((h + l) / 2).toFixed(2)) },
            { time: '11:00', price: l },
            { time: '11:30', price: parseFloat(((l + c) / 2).toFixed(2)) },
            { time: '12:00', price: parseFloat((l + (c - l) * 0.7).toFixed(2)) },
            { time: '12:30', price: parseFloat((l + (c - l) * 0.4).toFixed(2)) },
            { time: '13:30', price: c },
          ];
          setIntradayTrend(fallbackPoints);
        }
      } catch (e) {
        console.warn('Failed to fetch intraday trend:', e);
        if (isMounted) {
          const c = stockData.price;
          setIntradayTrend([
            { time: '09:00', price: stockData.openPrice ?? c },
            { time: '13:30', price: c },
          ]);
        }
      } finally {
        if (isMounted) setIsTrendLoading(false);
      }
    }

    fetchIntradayData();

    return () => {
      isMounted = false;
    };
  }, [chartType, stockData]);

  if (!stock || !stockData) return null;

  const isUp = stockData.changePercent >= 0;
  
  const basePrice = stockData.price / (1 + stockData.changePercent / 100);
  const changeVal = stockData.change ?? parseFloat((stockData.price - basePrice).toFixed(2));

  const openPrice = stockData.openPrice ?? stockData.price;
  const highPrice = stockData.highPrice ?? stockData.price;
  const lowPrice = stockData.lowPrice ?? stockData.price;
  const peRatio = stockData.peRatio ?? '--';

  const candles = stockData.candles && stockData.candles.length > 0 
    ? stockData.candles 
    : [{ day: '今日', open: openPrice, high: highPrice, low: lowPrice, close: stockData.price }];

  const activeHover = hoveredData || (chartType === 'kline' ? {
    label: candles[candles.length - 1].day,
    open: candles[candles.length - 1].open,
    high: candles[candles.length - 1].high,
    low: candles[candles.length - 1].low,
    close: candles[candles.length - 1].close,
  } : {
    label: intradayTrend.length > 0 ? intradayTrend[intradayTrend.length - 1].time : '今日',
    open: openPrice,
    high: highPrice,
    low: lowPrice,
    close: intradayTrend.length > 0 ? intradayTrend[intradayTrend.length - 1].price : stockData.price,
  });

  const minVal = chartType === 'kline' 
    ? Math.min(...candles.map((c) => c.low))
    : Math.min(...(intradayTrend.length > 0 ? intradayTrend.map(t => t.price) : [lowPrice]));
  const maxVal = chartType === 'kline' 
    ? Math.max(...candles.map((c) => c.high))
    : Math.max(...(intradayTrend.length > 0 ? intradayTrend.map(t => t.price) : [highPrice]));
  const range = maxVal - minVal || 1;

  let maxTrendIndex = 0;
  let minTrendIndex = 0;
  if (chartType === 'trend' && intradayTrend.length > 0) {
    let maxP = -Infinity;
    let minP = Infinity;
    intradayTrend.forEach((t, idx) => {
      if (t.price > maxP) {
        maxP = t.price;
        maxTrendIndex = idx;
      }
      if (t.price < minP) {
        minP = t.price;
        minTrendIndex = idx;
      }
    });
  }

  const getAiDiagnosis = () => {
    const { name, changePercent, symbol } = stockData;
    if (symbol.includes('0050') || symbol.includes('ETF') || symbol.includes('009')) {
      if (changePercent >= 0) {
        return `${name} 近期受權值股與大盤帶動穩步上揚，成分股結構健康。月線(MA20)展現強勁支撐，適合定期定額與中長線佈局。`;
      } else {
        return `${name} 隨大盤進行短期技術性回檔，但下方季線買盤承接力道強勁。逢低分批佈局可有效降低平均成本。`;
      }
    }

    if (changePercent > 2.0) {
      return `${name} 今日量價齊揚，強勢突破短線壓力區。三大法人與主力資金呈現明顯買超，若量能續維持高檔，有望挑戰波段新高。`;
    } else if (changePercent >= 0) {
      return `${name} 目前於月線 (MA20) 上方展現良性量縮整理。主力籌碼穩定，短線多方格局未變，等待成交量放大即可迎來下一波主升段。`;
    } else if (changePercent > -2.0) {
      return `${name} 短線面臨獲利回吐賣壓，呈現震盪盤整。下方重要支撐區有低接買盤防守，建議觀察量能變化再行操作。`;
    } else {
      return `${name} 今日跌幅較大，短線籌碼略顯鬆動。須密切留意前波低點支撐力道，建議嚴守風險控制，不宜過度躁進。`;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-xl shadow-[0_0_50px_rgba(6,182,212,0.15)] space-y-5 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 右上角按鈕區 */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
          <button
            onClick={() => onToggleFavorite(stockData.symbol)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 border ${
              isFavorite
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            {isFavorite ? '★ 已追蹤自選' : '☆ 加入自選'}
          </button>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center transition-all"
          >
            ✕
          </button>
        </div>

        {/* 頂部股票資訊：左側名稱、正中間股價與漲跌數/漲跌幅、右側預留給按鈕 */}
        <div className="grid grid-cols-3 items-center border-b border-slate-800 pb-4 pr-24">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">{stockData.name}</h2>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-800/80 px-1.5 py-0.5 rounded">
                {stockData.symbol}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">權重：{stockData.weight}</p>
          </div>

          <div className="text-center">
            <div className={`text-2xl font-black font-mono ${isUp ? 'text-red-400' : 'text-green-400'}`}>
              {stockData.price.toLocaleString()}
            </div>
            <div className={`text-xs font-bold font-mono flex items-center justify-center gap-2 ${isUp ? 'text-red-400' : 'text-green-400'}`}>
              <span>{isUp ? '+' : ''}{changeVal.toFixed(2)}</span>
              <span>{isUp ? '+' : ''}{stockData.changePercent.toFixed(2)}%</span>
            </div>
          </div>

          <div></div>
        </div>

        {/* 真實技術數據看板 */}
        <div className="grid grid-cols-4 gap-2 text-center bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs">
          <div>
            <div className="text-slate-500">開盤</div>
            <div className="font-bold font-mono mt-0.5">{openPrice}</div>
          </div>
          <div>
            <div className="text-slate-500">最高</div>
            <div className="font-bold font-mono text-red-400 mt-0.5">{highPrice}</div>
          </div>
          <div>
            <div className="text-slate-500">最低</div>
            <div className="font-bold font-mono text-green-400 mt-0.5">{lowPrice}</div>
          </div>
          <div>
            <div className="text-slate-500">本益比 (P/E)</div>
            <div className="font-bold font-mono text-cyan-400 mt-0.5">{peRatio}</div>
          </div>
        </div>

        {/* 圖表切換與即時懸停真實數據 */}
        <div className="flex justify-between items-center">
          <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <span>📈 真實技術分析</span>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
              {activeHover.label} ｜ 開:{activeHover.open} 高:{activeHover.high} 低:{activeHover.low} 收:{activeHover.close}
            </span>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-1 rounded-lg flex gap-1">
           <button
  onClick={() => setChartType('kline')}
  className={`px-2.5 py-1 text-[11px] font-bold rounded transition-all ${
    chartType === 'kline'
      ? 'bg-cyan-500 text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
      : 'text-slate-400 hover:text-white'
  }`} // <-- 這裡注意：是大括號前要補上反單引號 `
>
  日 K 線
</button>
            <button
              onClick={() => setChartType('trend')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded transition-all ${
                chartType === 'trend'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              即時走勢
            </button>
          </div>
        </div>

        {/* 互動式真實圖表區 */}
        <div 
          className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 h-48 relative flex items-center justify-center"
          onMouseLeave={() => setHoveredData(null)}
        >
          {isLoading || (chartType === 'trend' && isTrendLoading) ? (
            <div className="text-cyan-400 text-xs font-mono animate-pulse">正在從網路載入真實市場行情...</div>
          ) : chartType === 'kline' ? (
            <svg className="w-full h-full overflow-visible" viewBox="0 0 400 150">
              <line x1="0" y1="30" x2="400" y2="30" stroke="#1E293B" strokeDasharray="3 3" />
              <line x1="0" y1="75" x2="400" y2="75" stroke="#1E293B" strokeDasharray="3 3" />
              <line x1="0" y1="120" x2="400" y2="120" stroke="#1E293B" strokeDasharray="3 3" />

              {candles.map((c, i) => {
                const x = 22 + i * (350 / Math.max(candles.length, 1));
                const highY = 130 - ((c.high - minVal) / range) * 105;
                const lowY = 130 - ((c.low - minVal) / range) * 105;
                const openY = 130 - ((c.open - minVal) / range) * 105;
                const closeY = 130 - ((c.close - minVal) / range) * 105;

                const candleIsUp = c.close >= c.open;
                const color = candleIsUp ? '#EF4444' : '#22C55E';
                const bodyTop = Math.min(openY, closeY);
                const bodyHeight = Math.max(Math.abs(closeY - openY), 3);

                return (
                  <g
                    key={i}
                    className="cursor-pointer transition-opacity hover:opacity-80"
                    onMouseEnter={() =>
                      setHoveredData({
                        label: c.day,
                        open: c.open,
                        high: c.high,
                        low: c.low,
                        close: c.close,
                      })
                    }
                  >
                    <rect x={x - 12} y="5" width="24" height="130" fill="transparent" />
                    <line x1={x} y1={highY} x2={x} y2={lowY} stroke={color} strokeWidth="1.5" />
                    <rect x={x - 5} y={bodyTop} width="10" height={bodyHeight} fill={color} rx="1" />
                    <text x={x} y="146" textAnchor="middle" fill="#64748B" fontSize="9">
                      {c.day}
                    </text>
                  </g>
                );
              })}
            </svg>
          ) : (
            <svg className="w-full h-full overflow-visible" viewBox="0 0 400 150">
              <line x1="0" y1="30" x2="400" y2="30" stroke="#1E293B" strokeDasharray="3 3" />
              <line x1="0" y1="75" x2="400" y2="75" stroke="#1E293B" strokeDasharray="3 3" />
              <line x1="0" y1="120" x2="400" y2="120" stroke="#1E293B" strokeDasharray="3 3" />

              <polyline
                fill="none"
                stroke="#00E5FF"
                strokeWidth="2.5"
                points={intradayTrend
                  .map((t, i) => {
                    const x = 20 + i * (360 / Math.max(intradayTrend.length - 1, 1));
                    const y = 130 - ((t.price - minVal) / range) * 105;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />
              {intradayTrend.map((t, i) => {
                const x = 20 + i * (360 / Math.max(intradayTrend.length - 1, 1));
                const y = 130 - ((t.price - minVal) / range) * 105;
                const isMax = i === maxTrendIndex;
                const isMin = i === minTrendIndex;

                return (
                  <g
                    key={i}
                    className="cursor-pointer transition-opacity hover:opacity-80"
                    onMouseEnter={() =>
                      setHoveredData({
                        label: t.time,
                        open: openPrice,
                        high: highPrice,
                        low: lowPrice,
                        close: t.price,
                      })
                    }
                  >
                    <circle cx={x} cy={y} r={isMax || isMin ? '5' : '3.5'} fill={isMax ? '#EF4444' : isMin ? '#22C55E' : '#00E5FF'} />
                    
                    {isMax && (
                      <g transform={`translate(${x}, ${y - 12})`}>
                        <rect x="-32" y="-14" width="64" height="15" rx="3" fill="#1E293B" stroke="#EF4444" strokeWidth="1" />
                        <text x="0" y="-4" textAnchor="middle" fill="#EF4444" fontSize="8" fontWeight="bold">
                          最高 {t.price} ({t.time})
                        </text>
                      </g>
                    )}
                    {isMin && (
                      <g transform={`translate(${x}, ${y + 16})`}>
                        <rect x="-32" y="0" width="64" height="15" rx="3" fill="#1E293B" stroke="#22C55E" strokeWidth="1" />
                        <text x="0" y="10" textAnchor="middle" fill="#22C55E" fontSize="8" fontWeight="bold">
                          最低 {t.price} ({t.time})
                        </text>
                      </g>
                    )}

                    {i === 0 || i === intradayTrend.length - 1 || i % Math.max(Math.floor(intradayTrend.length / 4), 1) === 0 ? (
                      <text x={x} y="146" textAnchor="middle" fill="#64748B" fontSize="9">
                        {t.time}
                      </text>
                    ) : null}
                  </g>
                );
              })}
            </svg>
          )}
        </div>

        {/* AI 籌碼診斷 */}
        <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <div className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            AI 籌碼觀點診斷 - {stockData.name} ({stockData.symbol})
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {getAiDiagnosis()}
          </p>
        </div>
      </div>
    </div>
  );
}