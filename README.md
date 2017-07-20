# Lil' Scrapy

This is a tool I built to scrape public Facebook events by city and keyword.

I put together North Carolina beer event previews, so I wanted to automate searching for listings. The tool can generate an in-browser report, or generate a CSV.

This code is based on my use-case – North Carolina beer events, but can be repurposed pretty easily.

## Installation

```
mkdir <dir> && cd <dir>
git clone https://github.com/ethanbutler/lil-scrapy
npm install
npm run start
```

## Environment Variables
```
FEBL_ACCESS_TOKEN=EAAZA4BZAcQ2TsBAHVefEvmswJrSx5wFnAFcdQOneVAD7nGgz8BUgn9BNIqYPAGuJuSWdqAGY4vmGaif3NZCqlKEQN3Jjev66bKNN5GD6rZCmlybYCBFBkpa0SeDXg5uxr6PP8u4fwvpTfbuCvoZCEevi3rNxKESdziRN9tobAjbv1dzE5abW8X77YEQD4G1MZD
DISTANCE=10000
PORT=3000
```

Set `FEBL_ACCESS_TOKEN` to your Facebook OpenGraph API key.
Set `DISTANCE` to the number of meters to limit individual city results to.
Set `PORT` to the port you'd like to run on.

## Endpoints

```
/
```

Index of regions.

```
/<region>/<search,terms>
```

Report of upcoming events based on comma-separated list of terms, broken up by city.

```
/<region>/<search,terms>/csv
```

CSV report containing some information not present in the above view.
