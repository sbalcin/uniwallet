import {AssetTicker} from "@tetherto/wdk-react-native-provider";
import getDisplaySymbol from "@/utils/get-display-symbol";

export const formatAmount = (
    amount: number,
    {
        minimumFractionDigits = 2,
        maximumFractionDigits = 2,
    }: { minimumFractionDigits?: number; maximumFractionDigits?: number } = {}
) =>
    amount.toLocaleString('en-US', {
        minimumFractionDigits,
        maximumFractionDigits,
    });


export const formatTokenAmount = (amount: number, token: AssetTicker, includeSymbol: boolean = true) => {
    const symbol = getDisplaySymbol(token);

    if (amount === 0) return `0.00${includeSymbol ? ` ${symbol}` : ''}`;

    let decimals = Math.max(Math.ceil(Math.abs(Math.log10(amount))), 2);

    const formattedAmount = formatAmount(amount, {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
    });

    return `${formattedAmount}${includeSymbol ? ` ${symbol}` : ''}`;
};

export const formatUSDValue = (usdValue: number, includeSymbol: boolean = true): string => {
    if (usdValue === 0) return `0.00${includeSymbol ? ' USD' : ''}`;
    if (usdValue < 0.01) return `< 0.01${includeSymbol ? ' USD' : ''}`;
    return `${formatAmount(usdValue)}${includeSymbol ? ' USD' : ''}`;
};
