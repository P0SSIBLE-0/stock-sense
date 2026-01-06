import TradingViewWidget from "@/components/trading-view-widget";
import { HEATMAP_WIDGET_CONFIG, MARKET_DATA_WIDGET_CONFIG, MARKET_OVERVIEW_WIDGET_CONFIG, TOP_STORIES_WIDGET_CONFIG } from "@/lib/constant";

const Home = () => {
    const scriptUrl = "https://s3.tradingview.com/external-embedding/embed-widget-";

    return (
        <div className="min-h-screen flex flex-col text-gray-400 gap-4 md:gap-10 items-center sm:items-start">
            <section className="grid w-full gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <div className="md:col-span-1 xl:col-span-1">
                    <TradingViewWidget
                        title="Market overview"
                        scriptUrl={scriptUrl + "market-overview.js"}
                        config={MARKET_OVERVIEW_WIDGET_CONFIG}
                        className="custom-chart"
                        height={600}

                    />
                </div>
                <div className="md-col-span lg:col-span-2 xl:col-span-2">
                    <TradingViewWidget
                        title="Stock Heatmap"
                        scriptUrl={scriptUrl + "stock-heatmap.js"}
                        config={HEATMAP_WIDGET_CONFIG}
                        className="rounded-lg p-2"
                        height={600}
                    />
                </div>
            </section>
            <section className="grid w-full gap-2 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                <div className="h-full md:col-span-1 xl:col-span-1">
                    <TradingViewWidget
                        scriptUrl={scriptUrl + "timeline.js"}
                        config={TOP_STORIES_WIDGET_CONFIG}
                        className="custom-chart"
                        height={600}

                    />
                </div>
                <div className="h-full md:col-span-1 xl:col-span-2">
                    <TradingViewWidget
                        scriptUrl={scriptUrl + "market-quotes.js"}
                        config={MARKET_DATA_WIDGET_CONFIG}
                        className="rounded-lg p-2"
                        height={600}
                    />
                </div>
            </section>

        </div>
    );
};

export default Home;
