// FX Utilities — Live SOL/NGN conversion via CoinGecko
// Fallback to cached rate if API is unreachable

const FALLBACK_SOL_PRICE_NGN = 180_000;
let cachedRate: number | null = null;
let lastFetch = 0;
const CACHE_TTL = 60_000; // 1 minute

async function fetchSolPriceNgn(): Promise<number> {
    const now = Date.now();
    if (cachedRate && now - lastFetch < CACHE_TTL) {
        return cachedRate;
    }

    try {
        const response = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=ngn",
            { signal: AbortSignal.timeout(5000) }
        );

        if (!response.ok) throw new Error("API error");

        const data = await response.json();
        const price = data?.solana?.ngn;

        if (typeof price === "number" && price > 0) {
            cachedRate = price;
            lastFetch = now;
            return price;
        }

        throw new Error("Invalid price data");
    } catch (error) {
        console.warn("FX fetch failed, using fallback:", error);
        return cachedRate || FALLBACK_SOL_PRICE_NGN;
    }
}

export async function getNgnToSol(ngnAmount: number): Promise<number> {
    const rate = await fetchSolPriceNgn();
    return ngnAmount / rate;
}

export async function getSolToNgn(solAmount: number): Promise<number> {
    const rate = await fetchSolPriceNgn();
    return solAmount * rate;
}

export function formatSol(lamports: number): string {
    return (lamports / 1e9).toFixed(4) + " SOL";
}

export function formatNgn(amount: number): string {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        maximumFractionDigits: 0,
    }).format(amount);
}
