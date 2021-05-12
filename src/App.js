import React, { useState, useEffect } from 'react';
import './App.css';
import { Card, CardContent, FormControl, MenuItem, Select} from '@material-ui/core';
import InfoBox from './components/InfoBox/InfoBox';
import Map from './components/Map/Map';
import Table from './components/Table/Table';
import {sortData, prettyPrintStat } from './utils';
import LineGraph from "./components/LineGraph";
import "leaflet/dist/leaflet.css";
import numeral from "numeral";

function App() {

  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('worldwide');
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);

  useEffect(()=>{
    fetch('https://disease.sh/v3/covid-19/all')
      .then(res => res.json())
      .then(data =>{
        setCountryInfo(data)
      })
  }, [])

  useEffect(()=>{
    const getCountriesData = async ()=>{
      await fetch('https://disease.sh/v3/covid-19/countries')
      .then(res=> res.json())
      .then(data =>{
        const countries = data.map(country=>({
          name: country.country,
          info: country.countryInfo.iso2
        }))
        const sortedData = sortData(data);
        setTableData(sortedData);
        setMapCountries(data);
        setCountries(countries);
      })
    }
    getCountriesData();
  }, [countries])

  const selectHandler = async (event)=>{
    const countryCode = event.target.value;
    
    const url = countryCode === "worldwide" ? 'https://disease.sh/v3/covid-19/all' : `https://disease.sh/v3/covid-19/countries/${countryCode}`
      await fetch(url)
      .then(res => {return res.json()})
      .then(data =>{
        console.log(data);
        setCountry(countryCode)
        setCountryInfo(data)
        if(countryCode==="worldwide"){
          setMapCenter({ lat: 34.80746, lng: -40.4796 })
        }else{
          setMapCenter([data.countryInfo.lat, data.countryInfo.long])
        }
        setMapZoom(4);
      })
  }
  

  return (
    <div className="app">
      <div className="app__left">
      <div className="app__header">
        <h2>COVID TRACKER</h2>
        <FormControl className="app__form">
          <Select variant="outlined" value={country} onChange={selectHandler}>
            <MenuItem value="worldwide">Worldwide</MenuItem>
            {
              countries.map(country =>(
              <MenuItem value={country.info}>{country.name}</MenuItem>
              ))
            }
          </Select>
        </FormControl>
      </div>
      <div className="app__stats">
        <InfoBox 
        onClick={(e) => setCasesType("cases")} 
        title="Cases" 
        isRed
        active={casesType === "cases"}
        cases={prettyPrintStat(countryInfo.todayCases)} 
        total={numeral(countryInfo.cases).format("0.0a")}/>
        <InfoBox 
        onClick={(e) => setCasesType("recovered")} 
        active={casesType === "recovered"}
        title="Recovered" 
        cases={prettyPrintStat(countryInfo.todayRecovered)} 
        total={numeral(countryInfo.recovered).format("0.0a")}/>
        <InfoBox 
        onClick={(e) => setCasesType("deaths")}
        isRed
        active={casesType === "deaths"} 
        title="Deaths" cases={prettyPrintStat(countryInfo.todayDeaths)} 
        total={numeral(countryInfo.deaths).format("0.0a")}/>
      </div>
      <Map countries={mapCountries}
          casesType={casesType}
          center={mapCenter}
          zoom={mapZoom}/>
      </div>
      <Card className="app__right">
        <CardContent>
          <h3>Live Cases by Country</h3>
          <Table countries={tableData}/>
          <h3 className="app__graphTitle">Worldwide new {casesType}</h3>
          <LineGraph className="app__graph" casesType={casesType} />
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
