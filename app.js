const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "transaction.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

//API for whole Data
app.get("/", async (request, response) => {
  const getTransactions = `
    SELECT
      *
    FROM
      mytable;`;
  const transactionArray = await database.all(getTransactions);
  response.send(transactionArray);
});

// API FOR STATISTICS
app.get("/statistics/:monthId", async (request, response) => {
  const { monthId } = request.params;
  const totalSaleAmpountQuery = `
    SELECT
  SUM(amount) AS total_sale_in_given_month,
  COUNT(sold) AS sold_count,
  (
    SELECT
      COUNT(*)
    FROM
      MYTABLE
    WHERE
      CAST(strftime('%m', dateOfSale) AS INTEGER) = 1
  ) - COUNT(sold) AS not_sold_count
FROM
  MYTABLE
WHERE
  CAST(strftime('%m', dateOfSale) AS INTEGER) = ${monthId}
GROUP BY
  sold
HAVING
  sold = "true"
    `;
  const statistics = await database.get(totalSaleAmpountQuery);
  response.send(statistics);
});

//API FOR BAR CHART
app.get("/bar-chart/:monthId", async (request, response) => {
  const { monthId } = request.params;
  const barChartQuery = `
  SELECT
  count(
    CASE
      WHEN amount >= 0
      AND amount <= 100 THEN 1
    END
  ) AS "0 -100",
  count(
    CASE
      WHEN amount >= 101
      AND amount <= 200 THEN 1
    END
  ) AS "101 -200",
  count(
    CASE
      WHEN amount >= 201
      AND amount <= 300 THEN 1
    END
  ) AS "201 -300",
  count(
    CASE
      WHEN amount >= 301
      AND amount <= 400 THEN 1
    END
  ) AS "301-400",
  count(
    CASE
      WHEN amount >= 401
      AND amount <= 500 THEN 1
    END
  ) AS "401-500",
  count(
    CASE
      WHEN amount >= 501
      AND amount <= 600 THEN 1
    END
  ) AS "501-600",
  count(
    CASE
      WHEN amount >= 601
      AND amount <= 700 THEN 1
    END
  ) AS "601-700",
  count(
    CASE
      WHEN amount >= 701
      AND amount <= 800 THEN 1
    END
  ) AS "701-800",
  count(
    CASE
      WHEN amount >= 801
      AND amount <= 900 THEN 1
    END
  ) AS "801-900",
  count(
    CASE
      WHEN amount >= 901 THEN 1
    END
  ) AS "901 - above"
FROM
  MYTABLE
WHERE
  CAST(strftime("%m", dateOfSale) AS INTEGER) = ${monthId}
    `;
  const barChartArray = await database.get(barChartQuery);
  response.send(barChartArray);
});

//API FOR PIE-CHART
app.get("/pie-chart/:monthId", async (request, response) => {
  const { monthId } = request.params;
  const pieChartQuery = `
  SELECT
  DISTINCT CATEGORY,
    COUNT(category) AS no_of_items
  FROM
    MYTABLE
  WHERE
    CAST(strftime("%m", dateOfSale) AS INTEGER) = ${monthId}
  GROUP BY
    category
    `;
  const pieChartArray = await database.all(pieChartQuery);
  response.send(pieChartArray);
});

module.exports = app;
