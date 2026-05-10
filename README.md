# TravelSense — Weather & Destination Guide

**Nume Prenume:** Vîrcan Mara Ștefania \
**Grupa:** 1147

## Link video prezentare



## Link aplicație publicată

https://maravircann.github.io/TravelSense/

---

## 1. Introducere

TravelSense este o aplicație web care oferă informații complete despre orice destinație de călătorie din lume. Utilizatorul introduce numele unui oraș și primește instantaneu: condițiile meteo actuale, prognoza pe 7 zile și date detaliate despre țara respectivă (capitală, populație, suprafață, monedă, limbi oficiale, steag).

Aplicația folosește exclusiv API-uri publice, fără cheie de autentificare, și rulează complet în browser fără backend.

---

## 2. Descriere problemă

Când planifici o călătorie ai nevoie de informații din surse multiple: un site de vreme, Wikipedia pentru date despre țară, un alt site pentru monedă și limbi. Procesul este fragmentat și consumă timp.

TravelSense rezolvă această problemă agregând datele din două API-uri cloud într-o singură interfață: introduci un oraș și obții tot ce ai nevoie într-un singur ecran.

---

## 3. Descriere API

### Open-Meteo API

- Serviciu cloud gratuit pentru date meteorologice și geocodare
- Nu necesită autentificare (fără API key)
- Documentație: https://open-meteo.com/en/docs

**Endpoint geocodare** — transformă numele orașului în coordonate geografice:

```
GET https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1&language=en
```

**Endpoint vreme** — returnează vremea curentă și prognoza pe 7 zile:

```
GET https://api.open-meteo.com/v1/forecast
    ?latitude={lat}
    &longitude={lon}
    &current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code
    &daily=weather_code,temperature_2m_max,temperature_2m_min
    &wind_speed_unit=kmh
    &timezone=auto
    &forecast_days=7
```

Date utilizate din răspuns:
- `temperature_2m` — temperatura curentă (°C)
- `apparent_temperature` — temperatura resimțită (°C)
- `relative_humidity_2m` — umiditate relativă (%)
- `wind_speed_10m` — viteza vântului (km/h)
- `weather_code` — cod WMO pentru condiția meteo (mapat la emoji + descriere)
- `temperature_2m_max` / `temperature_2m_min` — temperaturi zilnice pentru prognoză

---

### REST Countries API

- Serviciu cloud cu date despre toate țările lumii
- Nu necesită autentificare (fără API key)
- Documentație: https://restcountries.com/

**Endpoint utilizat** — căutare după codul alpha-2 al țării (ex: `ro`, `fr`, `jp`):

```
GET https://restcountries.com/v3.1/alpha/{country_code}
```

Date utilizate din răspuns:
- `name.common` — numele țării
- `capital` — capitala
- `region` — regiunea geografică
- `population` — numărul de locuitori
- `area` — suprafața în km²
- `currencies` — moneda națională și simbolul
- `languages` — limbile oficiale
- `flags.png` — URL-ul steagului

---

## 4. Flux de date

Fiecare căutare declanșează 3 requesturi HTTP consecutive:

```
Utilizator introduce oraș
        │
        ▼
[1] GET geocoding-api.open-meteo.com  →  latitudine, longitudine, country_code
        │
        ▼
[2] GET api.open-meteo.com/v1/forecast  →  vreme curentă + prognoză 7 zile
        │
        ▼
[3] GET restcountries.com/v3.1/alpha/{code}  →  date țară, steag, monedă, limbi
        │
        ▼
    Afișare rezultate în interfață
```

### Exemple de request / response

#### [1] Geocodare — request

```
GET https://geocoding-api.open-meteo.com/v1/search?name=Paris&count=1&language=en
```

#### [1] Geocodare — response (simplificat)

```json
{
  "results": [
    {
      "name": "Paris",
      "latitude": 48.85341,
      "longitude": 2.3488,
      "country": "France",
      "country_code": "FR"
    }
  ]
}
```

---

#### [2] Vreme — request

```
GET https://api.open-meteo.com/v1/forecast?latitude=48.85&longitude=2.35
    &current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code
    &daily=weather_code,temperature_2m_max,temperature_2m_min
    &wind_speed_unit=kmh&timezone=auto&forecast_days=7
```

#### [2] Vreme — response (simplificat)

```json
{
  "current": {
    "temperature_2m": 17.4,
    "apparent_temperature": 15.1,
    "relative_humidity_2m": 72,
    "wind_speed_10m": 14.2,
    "weather_code": 2
  },
  "daily": {
    "time": ["2026-05-10", "2026-05-11", "..."],
    "weather_code": [2, 61, 3, 0, 1, 80, 3],
    "temperature_2m_max": [19.2, 14.8, 16.1, 21.0, 22.3, 18.7, 17.5],
    "temperature_2m_min": [11.3, 10.1, 9.8, 12.4, 13.0, 11.9, 10.6]
  },
  "timezone": "Europe/Paris"
}
```

---

#### [3] Țară — request

```
GET https://restcountries.com/v3.1/alpha/fr
```

#### [3] Țară — response (simplificat)

```json
[
  {
    "name": { "common": "France" },
    "capital": ["Paris"],
    "region": "Europe",
    "population": 67391582,
    "area": 551695.0,
    "currencies": {
      "EUR": { "name": "Euro", "symbol": "€" }
    },
    "languages": { "fra": "French" },
    "flags": { "png": "https://flagcdn.com/w320/fr.png" }
  }
]
```

---

### Metode HTTP utilizate

| Request | Metodă | Scop |
|---------|--------|------|
| Geocodare oraș | GET | Obținere coordonate geografice |
| Date meteo | GET | Obținere vreme curentă și prognoză |
| Date țară | GET | Obținere informații despre țară |

### Autentificare și autorizare

Ambele API-uri sunt publice și gratuite — nu necesită cheie de autentificare (API key) sau cont. Requesturile se fac direct din browser prin `fetch()`.


---
## 5. Capturi de ecran
<img width="1919" height="603" alt="image" src="https://github.com/user-attachments/assets/fcf2aadc-6f25-418d-a079-4cc8af9f2e93" /> 
<br/>
<img width="1899" height="915" alt="image" src="https://github.com/user-attachments/assets/978ba830-970e-4cf4-a663-7a28efc1b2ab" />


---

## 6. Referințe

- Open-Meteo Weather API: https://open-meteo.com/en/docs
- Open-Meteo Geocoding API: https://open-meteo.com/en/docs/geocoding-api
- REST Countries API: https://restcountries.com/
- WMO Weather Interpretation Codes: https://open-meteo.com/en/docs#weathervariables
- MDN Web Docs — Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
