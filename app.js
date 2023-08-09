
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = 5000;





// http://localhost:5000/current
app.get('/current', async (req, res) => {
  try {
    const url = 'https://www.chittorgarh.com/report/ipo-subscription-status-live-bidding-from-bse-nse/21/';
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const scrapedData = {
      data: {
        thead: ['company link'],
        tbody: []
      }
    };

    // Extract table header
    $('table.table-bordered thead th').each((index, th) => {
      const headerText = $(th).find('a').text().trim();
      scrapedData.data.thead.push(headerText);
    });

    const rows = $('table.table-bordered tbody tr');

    rows.each((index, row) => {
      const rowData = [];
      const columns = $(row).find('td');

      const companyLink = $(columns[0]).find('a').attr('href');
      rowData.push(companyLink);
      rowData.push($(columns[0]).find('a').text().trim());

      for (let i = 1; i < columns.length; i++) {
        rowData.push($(columns[i]).text().trim());
      }

      scrapedData.data.tbody.push(rowData);
    });

    res.json(scrapedData);
  } catch (error) {
    console.error('Error scraping data:', error);
    res.status(500).json({ error: 'An error occurred while scraping data.' });
  }
})


// http://localhost:5000/yearfilter?year=2020

app.get('/yearfilter', async (req, res) => {
  const year = req.query.year || new Date().getFullYear().toString();
  console.log(year);
  try {
    const url = `https://www.chittorgarh.com/report/ipo-subscription-status-live-bidding-data-bse-nse/21/?year=${year}`;

    // Send an HTTP GET request to the URL
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Find the table element with the desired class
    const table = $('.table.table-bordered.table-striped.table-hover.w-auto');

    // Extract table header
    const thead = table.find('thead th').map((_, th) => $(th).text().trim()).get();

    // Extract table body rows
    const rows = table.find('tbody tr');

    // Initialize an empty array to store filtered rows
    const filteredRows = [];

    // Define patterns to remove
    const patternsToRemove = [
      /^<< Year \d{4}/,
      /^\d{4}$/,
      /^Year \d{4} > >$/,
    ];

    // Iterate through each row and filter out unwanted patterns
    rows.each((_, row) => {
      const rowCells = $(row).find('td');
      const rowData = rowCells.map((_, cell) => $(cell).text().trim()).get();

      const hasUnwantedPattern = rowData.some(item =>
        patternsToRemove.some(pattern => pattern.test(item))
      );

      if (!hasUnwantedPattern) {
        filteredRows.push(rowData);
      }
    });

    const result = {
      data: {
        thead: thead,
        tbody: filteredRows,
      },
    };

    // res.json(result);
    // console.log(result);
    return res.status(200).json(result)
  } catch (error) {
    console.error('Error scraping data:', error);
    res.status(500).json({ error: 'An error occurred while scraping data.' });
  }
})
app.get('/', (req, res) => {
  res.status(200).json('api working good')
})
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});




// const ff = async () => {
//   const url = 'https://www.chittorgarh.com/report/ipo-subscription-status-live-bidding-data-bse-nse/21/?year=2022';

//     // Send an HTTP GET request to the URL
//     const response = await axios.get(url);
//     const $ = cheerio.load(response.data);

//     // Find the table element with the desired class
//     const table = $('.table.table-bordered.table-striped.table-hover.w-auto');

//     // Extract table header
//     const thead = table.find('thead th').map((_, th) => $(th).text().trim()).get();

//     // Extract table body rows
//     const rows = table.find('tbody tr');

//     // Initialize an empty array to store filtered rows
//     const filteredRows = [];

//     // Define patterns to remove
//     const patternsToRemove = [
//       /^<< Year \d{4}/,
//       /^\d{4}$/,
//       /^Year \d{4} > >$/,
//     ];

//     // Iterate through each row and filter out unwanted patterns
//     rows.each((_, row) => {
//       const rowCells = $(row).find('td');
//       const rowData = rowCells.map((_, cell) => $(cell).text().trim()).get();

//       const hasUnwantedPattern = rowData.some(item =>
//         patternsToRemove.some(pattern => pattern.test(item))
//       );

//       if (!hasUnwantedPattern) {
//         filteredRows.push(rowData);
//       }
//     });

//     const result = {
//       data: {
//         thead: thead,
//         tbody: filteredRows,
//       },
//     };

//     // res.json(result);
//     console.log(result);
// }
// ff()