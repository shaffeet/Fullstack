import { useState, useEffect } from 'react';
import axios from 'axios';

const Filter = ({ filter, onChange }) => {
  return (
    <div>
      <form>
        <div>
          find countries: <input value={filter} onChange={onChange} />
        </div>
      </form>
    </div>
  );
};

const Country = ({ country }) => {
  const languages = Object.values(country.languages);
  console.log(country);
  return (
    <div>
      <h1>{country.name.common}</h1>
      <p>Capital: {country.capital}</p>
      <p>Area: {country.area}</p>
      <h3>Languages:</h3>
      <ul>
        {languages.map((language) => (
          <li key={language}>{language}</li>
        ))}
      </ul>
      <img
        src={country.flags.png}
        alt={country.flags.alt}
        style={{ border: '1px solid black' }}
      />
      <h2>Weather in {country.capital}</h2>
    </div>
  );
};

const CountryList = ({ countries, filter }) => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const filtered = countries.filter((country) =>
    country.name.common.toLowerCase().includes(filter.toLowerCase())
  );

  useEffect(() => {
    setSelectedCountry(null);
  }, [filter]);

  if (filtered.length > 10) {
    return <div>Too many matches, specify another filter</div>;
  }

  if (filtered.length === 1) {
    return <Country country={filtered[0]} />;
  }

  const handleClick = (country) => {
    setSelectedCountry(country);
  };

  return (
    <div>
      {filtered.map((country) => (
        <div key={country.name.common}>
          {country.name.common}
          <button onClick={() => handleClick(country)}>show</button>
        </div>
      ))}
      {selectedCountry && <Country country={selectedCountry} />}
    </div>
  );
};

const App = () => {
  const [countries, setCountries] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    axios.get(`https://restcountries.com/v3.1/all`).then((response) => {
      setCountries(response.data);
    });
  }, []);

  return (
    <div>
      <Filter
        filter={filter}
        onChange={({ target: { value } }) => setFilter(value)}
      />
      <CountryList countries={countries} filter={filter} />
    </div>
  );
};

export default App;
