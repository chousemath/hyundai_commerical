# Hyundai Commercial Scraper

### Installation and Setup

```bash
$ npm install
```

### Usage Instructions

> Run the main scraping script and wait (for a long time...)

```bash
$ node app.js
```

> Convert the NeDB data to a csv file (should be fast)

```bash
$ node toCSV.js
# should output to "db.csv"
```

> Upload hyundai_parser.ipynb to Google Colab and use "db.csv" as the input file
