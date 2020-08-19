import React, { Component } from 'react';
import { render } from 'react-dom';
import cp from 'coinpaprika-js';

import TextArea from './TextArea';

import './style.css';


class App extends Component {
  constructor() {
    super();
    this.state = {
      input: '',
      output: '',
      error: ''
    };

    this.handleChange = this.handleChange.bind(this);
  }

  async getCoinData(methodName, symbol) {
    switch(methodName){
      case 'Name': return await this.name(symbol);
      case 'Price': return await this.price(symbol);
    }
  }

  async getCoinBySymbol(symbol) {
    const { currencies } = await cp.search(symbol, { c: 'currencies', modifier: 'symbol_search' });

    return currencies.find(currency => currency.symbol === symbol);
  }

  async name(symbol) {
    const { name } = await this.getCoinBySymbol(symbol);

    return name;
  }

  async price(symbol) {
    const { id } = await this.getCoinBySymbol(symbol);
    const { price } = await cp.convert(1, id, 'usd-us-dollars');

    return `$${price}`;
  }

  async parseText(text) {
    const regex = /{{ (Name|Price)\/\S+ }}/g;
    const methodNameRegex = /(Name|Price)\/\S+/g;
    // const methodNameRegex = /(?<={{ )(Name|Price)\/\S{3}(?= }})/g;

    //auxillary lines of code to await fetches and call string.replace synchronously
    const detectedMarkups = Array.from(new Set(text.match(regex)));
    const fetchedData = {};
    let temp, element;
    const detectedMarkupsLength = detectedMarkups ? detectedMarkups.length : 0;
    for(let i = 0; i < detectedMarkupsLength; i++) {
      element = detectedMarkups[i];
      //TODO fix error handling
      try {
        temp = await this.getCoinData(...element.match(methodNameRegex)[0].split('/'));
      } catch(error) {
        return {
          error
        };
      }
      fetchedData[element] = temp;
    }

    //synchronously replace markups in text with previously fetched data
    const replacer = (match) => fetchedData[match];

    return {
      output: text.replace(regex, replacer)
      };
  }

  // getCoinBySymbol(symbol) {
  //   return cp.search('BTC', { c: 'currencies', modifier: 'symbol_search' })
  //   .then(({ currencies }) => currencies.find(currency => currency.symbol === symbol));
  // }

  // name(symbol) {
  //   return this.getCoinBySymbol(symbol)
  //   .then(({ name }) => name);
  // }

  // price(symbol) {
  //   return this.getCoinBySymbol(symbol)
  //   .then(({ id }) => cp.convert(1, id, 'usd-us-dollars'))
  //   .then(({ price }) => `$${price}`)
  // }

  // parseText(text) {
  //   const regex = /(?<={{ )(Name|Price)\/\S{3}(?= }})/g;
  //   const replacer = (match) => {
  //     const [ methodName, symbol ] = match.split('/');

  //     return this.getCoinData(methodName, symbol);
  //   };

  //   return text.replace(regex, replacer);
  // }

  async handleChange({ target: { value } }) {
    //TODO add debounce
    const { output, error } = await this.parseText(value);

    this.setState({
      input: value,
      output,
      error
    })
  }

  render() {
    const { input, output, error } = this.state;

    return (
      <div>
        <div className="flexbox">
          <TextArea value={input} handleChange={this.handleChange} />
          <article>{output}</article>
        </div>
        <div>{error}</div>
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));
