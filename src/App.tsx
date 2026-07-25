import { useState, useMemo } from "react";
import CoinpaprikaAPI from "@coinpaprika/api-nodejs-client";

import TextArea from "./components/TextArea";

import "./App.css";

function App() {
  const [state, setState] = useState({
    input: "",
    output: "",
    error: "",
  });

  const { input, output, error } = state;

  const cp = useMemo(() => new CoinpaprikaAPI(), []);

  async function getCoinData(methodName, symbol) {
    switch (methodName) {
      case "Name":
        return await name(symbol);
      case "Price":
        return await price(symbol);
    }
  }

  async function getCoinBySymbol(symbol) {
    const { currencies } = await cp.search({
      q: symbol,
      c: "currencies",
      modifier: "symbol_search",
    });

    return currencies.find((currency) => currency.symbol === symbol);
  }

  async function name(symbol) {
    const { name } = await getCoinBySymbol(symbol);

    return name;
  }

  async function price(symbol) {
    const { id } = await getCoinBySymbol(symbol);
    const { price } = await cp.priceConverter({
      base_currency_id: id,
      quote_currency_id: "usd-us-dollars",
      amount: 1,
    });

    return `$${price}`;
  }

  async function parseText(text) {
    const regex = /{{ (Name|Price)\/\S+ }}/g;
    const methodNameRegex = /(Name|Price)\/\S+/g;
    // const methodNameRegex = /(?<={{ )(Name|Price)\/\S{3}(?= }})/g;

    //auxillary lines of code to await fetches and call string.replace synchronously
    const detectedMarkups = Array.from(new Set(text.match(regex)));
    const fetchedData = {};
    let temp, element;
    const detectedMarkupsLength = detectedMarkups ? detectedMarkups.length : 0;
    for (let i = 0; i < detectedMarkupsLength; i++) {
      element = detectedMarkups[i];
      //TODO fix error handling
      try {
        temp = await getCoinData(
          ...element.match(methodNameRegex)[0].split("/"),
        );
      } catch (error) {
        return {
          error,
        };
      }
      fetchedData[element] = temp;
    }

    //synchronously replace markups in text with previously fetched data
    const replacer = (match) => fetchedData[match];

    return {
      output: text.replace(regex, replacer),
    };
  }

  async function handleChange({ target: { value } }) {
    //TODO add debounce
    const { output, error } = await parseText(value);

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
