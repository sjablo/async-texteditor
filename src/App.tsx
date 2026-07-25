import { useState, useMemo } from "react";
import CoinpaprikaAPI from "@coinpaprika/api-nodejs-client";

import TextArea from "./components/TextArea";

import "./App.css";

type SearchCurrency = {
  id: string;
  name: string;
  symbol: string;
  rank: number;
  is_new: boolean;
  is_active: boolean;
  type: string;
};

type SearchResponse = {
  currencies: SearchCurrency[];
};

type CoinDataMethod = "Name" | "Price";

function App() {
  const [state, setState] = useState({
    input: "",
    output: "",
    error: "",
  });

  const { input, output, error } = state;

  const cp = useMemo(() => new CoinpaprikaAPI(), []);

  async function getCoinData(methodName: CoinDataMethod, symbol: string) {
    switch (methodName) {
      case "Name":
        return await name(symbol);
      case "Price":
        return await price(symbol);
    }
  }

  async function getCoinBySymbol(symbol: string) {
    const { currencies }: SearchResponse = await cp.search({
      q: symbol,
      c: "currencies",
      modifier: "symbol_search",
    });

    return currencies.find(
      (currency: SearchCurrency) => currency.symbol === symbol,
    );
  }

  async function name(symbol: string) {
    const coin = await getCoinBySymbol(symbol);

    if (!coin) {
      throw new Error(`Currency with symbol ${symbol} not found`);
    }

    return coin.name;
  }

  async function price(symbol: string) {
    const coin = await getCoinBySymbol(symbol);

    if (!coin) {
      throw new Error(`Currency with symbol ${symbol} not found`);
    }

    const { price } = await cp.priceConverter({
      base_currency_id: coin.id,
      quote_currency_id: "usd-us-dollars",
      amount: 1,
    });

    return `$${price}`;
  }

  async function parseText(text: string) {
    const regex = /{{ (Name|Price)\/\S+ }}/g;
    const methodNameRegex = /(Name|Price)\/\S+/g;
    // const methodNameRegex = /(?<={{ )(Name|Price)\/\S{3}(?= }})/g;

    //auxillary lines of code to await fetches and call string.replace synchronously
    const detectedMarkups = Array.from(new Set(text.match(regex)));
    const fetchedData: Record<string, string> = {};
    let temp, element;
    const detectedMarkupsLength = detectedMarkups ? detectedMarkups.length : 0;

    for (let i = 0; i < detectedMarkupsLength; i++) {
      element = detectedMarkups[i];
      const [methodName, symbol] = element
        .match(methodNameRegex)![0]
        .split("/");
      //TODO fix error handling
      try {
        temp = await getCoinData(methodName as CoinDataMethod, symbol);
      } catch (error) {
        return {
          error,
        };
      }
      fetchedData[element] = temp;
    }

    //synchronously replace markups in text with previously fetched data
    const replacer = (match: string): string => fetchedData[match];

    return {
      output: text.replace(regex, replacer),
    };
  }

  async function handleChange({
    target: { value },
  }: React.ChangeEvent<HTMLTextAreaElement>) {
    //TODO add debounce
    const result = await parseText(value);

    const output = result.output ?? "";
    const error = (result as { error?: Error }).error?.message ?? "";

    setState({
      input: value,
      output,
      error,
    });
  }

  return (
    <div>
      <div className="flexbox">
        <TextArea value={input} handleChange={handleChange} />
        <article>{output}</article>
      </div>
      <div>{error}</div>
    </div>
  );
}

export default App;
