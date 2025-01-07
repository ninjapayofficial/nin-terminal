// app/api/chart/route.ts
import { NextResponse } from "next/server";
import yahooFinance from "yahoo-finance2";

interface Candle {
  time: string;  // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// We can handle optional search params from the request URL
export async function GET(request: Request) {
  // 1) Parse the URL to get the search params (?symbol=TSLA)
  const { searchParams } = new URL(request.url);
  const symbolParam = searchParams.get("symbol");

  // 2) Default symbol if none provided:
  const symbol = symbolParam || "PAYTM.NS";

  try {
    // 3) We'll fetch ~180 days of daily data for an example
    const period1 = new Date();
    period1.setDate(period1.getDate() - 180);
    const period2 = new Date();

    // 4) Query Yahoo Finance for chart data
    // See docs: https://github.com/gadicc/node-yahoo-finance2/tree/main/docs
    const result = await yahooFinance.chart(symbol, {
      period1: period1.toISOString(),
      period2: period2.toISOString(),
      interval: "1d",
    });

    // 5) If no data came back, return an empty array
    if (!result || !result.quotes || result.quotes.length === 0) {
      return NextResponse.json([]);
    }

    // 6) Convert Yahoo Finance data to your Candle format
    const data: Candle[] = result.quotes
      .map((quote) => ({
        time: quote.date.toISOString().split("T")[0],
        open: quote.open ?? null,
        high: quote.high ?? null,
        low: quote.low ?? null,
        close: quote.close ?? null,
        volume: quote.volume ?? 0, // Volume can be 0 if unavailable
      }))
      .filter((candle) => candle.open !== null && candle.high !== null && candle.low !== null && candle.close !== null) // Remove incomplete data
      .map((candle) => ({
        ...candle,
        open: candle.open!, // Cast after filtering ensures safety
        high: candle.high!,
        low: candle.low!,
        close: candle.close!,
      }));

    return NextResponse.json(data);
  } catch (err) {
    console.error("Error fetching Yahoo Finance data:", err);
    // Return an error response
    return NextResponse.json(
      { error: "Failed to fetch data from Yahoo Finance", details: String(err) },
      { status: 500 }
    );
  }
}
