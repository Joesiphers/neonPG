const express = require("express");
const bodyParser = require("body-parser");
const { dbquery } = require("./dbquery");
const tableRouter = express.Router();
module.exports = tableRouter;

const selectAll = async (req, res) => {
  console.log("select all");
  const query = `
    TABLE title
  `;
  const result = await dbquery(query);
  res.status(200).json({ result: result });
};
tableRouter.use((req, res, next) => {
  console.log(req.path, "table");
  next();
});
tableRouter.get("/all", selectAll);

const tableCreator = async (req, res) => {
  try {
    const tableName = req.query.tableName;
    const query = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id SERIAL PRIMARY KEY,
      ${tableName} varchar
     )
  `;
    /*if (!tableName) {
      throw new Error("lack of table name, table create fail");
    }*/
    const result = await dbquery(query);

    res.status(200).json({ result: result });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err });
  }
};
tableRouter.get("/createtable", tableCreator);

//insert_column?tableName=title&column=name:m11,type:text;name:m22,type:text
const insertColumn = async (req, res) => {
  const { tableName, column } = req.query; // extract the query
  // column: "column_names=xxx,yyy&types=qqq,bbb",
  const columns = column.split(";").map((i) => i.trim());
  let columnQuery = "";
  //create a [] with [[name,type],[name,type]]
  for (i in columns) {
    const columnPair = columns[i].split(",").map((j) => j.trim().split(":")[1]); //only take the [ 'xxx', 'yyy' ]
    console.log(columnPair);
    let comma = "";
    //neon or mayb SQL strick on this ","
    if (i > 0) {
      comma = ",";
    }
    columnQuery += `${comma} ADD COLUMN ${columnPair[0]} ${columnPair[1]}`;
    //without IF NOT EXISTS can read routine : check name collision.
    //,"routine":"check_for_column_name_collision"}}
  }
  query = ` ALTER TABLE ${tableName} ${columnQuery}`;
  console.log("column", req.query, columns, query);
  const result = await dbquery(query);
  res.status(200).json({ result: result });
};
tableRouter.get("/insert_column", insertColumn);
/* req: /table/insert_column?tableName=pipe_know&column=address&keywords

const check_table = async (req, res) => {
  const { tableName } = req.query;

  console.log("tablename", tableName.replace(/"/g, "'"));
  const table_query = `SELECT EXISTS(
  SELECT *
  FROM pg_tables
  WHERE tablename = 'title')`;
  const schemaquery = `SELECT EXISTS(
  SELECT *
  FROM information_schema.tables
  WHERE table_name = '${tableName}')`;

  console.log(schemaquery);
  const result1 = await dbquery(table_query);
  const result2 = await dbquery(schemaquery);
  console.log(result1.rows[0]);
  res.status(200).json(result2);
};
tableRouter.get("/check_table", check_table);

/*
app.get("/ic", async (req, res) => {
  const query = `
    ALTER TABLE title
    ADD COLUMN username varchar(12) ;
  `;
  const result = await dbq(pool, query);
  res.status(200).json({ result: result });
});
*/

//*****insert record *******/
const insertRecord = async (req, res) => {
  const fields = Object.keys(req.query);
  const values = Object.values(req.query);
  console.log("insertRecord", req.query, fields, values[0]);
  const query = `
  INSERT INTO pipe_know (${fields})
  VALUES ($1,$2) 
  RETURNING *;`;
  console.log("query", query);
  const result = await dbquery(query, values);
  res.status(200).json({ result: result });
};

tableRouter.get("/insert_record", insertRecord);
/** replace, following use string then split to array. silly
 * req: /table/insert_column?tableName=pipe_know&column=address&keywords
** const columns = column.split(";").map((i) => i.trim());
  let columnQuery = "";
  //create a [] with [[name,type],[name,type]]
  for (i in columns) {
    const columnPair = columns[i].split(",").map((j) => j.trim().split(":")[1]); //only take the [ 'xxx', 'yyy' ]
    console.log(columnPair);
    let comma = "";
    //neon or mayb SQL strick on this ","
    if (i > 0) {
      comma = ",";
    }
    columnQuery += `${comma} ADD COLUMN ${columnPair[0]} ${columnPair[1]}`;
    //without IF NOT EXISTS can read routine : check name collision.
    //,"routine":"check_for_column_name_collision"}}
  }
  query = ` ALTER TABLE ${tableName} ${columnQuery}`;
  console.log("column", req.query, columns, query);
  const result = await dbquery(query);
  res.status(200).json({ result: result });
}; */

/**
 * const query = {
  text: 'SELECT * FROM your_table WHERE id = $1',//DELETE FROM tablename WHERE xxx=$1
  values: [recordIdToSelect],
};
 */
const select = async (req, res) => {
  console.log("select ", req.query);

  const fields = Object.keys(req.query);
  const values = Object.values(req.query);
  let condition;
  for (i in fields) {
    if (i == "0") {
      condition = fields[i] + "= $" + (+i + 1);
    } else {
      condition += " AND " + fields[i] + "= $" + (+i + 1);
    }
    console.log(i, fields[i], condition);
  }
  const query =
    `
    SELECT * FROM pipe_know WHERE ` + condition;
  const result = await dbquery(query, values);
  res.status(200).json({ result: result.rows });
};

tableRouter.get("/select", select);

const add_record = async (req, res) => {
  /*const fields = Object.keys(req.query);
  const values = Object.values(req.query);
  */
  const fields = Object.keys(req.body);
  const values = Object.values(req.body);
  console.log("add Record", req.query, fields.length, values, req.body);
  let valueNumber = "";
  /*  for (let i = 1; i <= fields.length; i++) {
    valueNumber += `$${i},`;
    console.log("n", valueNumber);
  }*/
  for (i in fields) {
    if (i !== "0") {
      valueNumber += ", $" + (+i + 1);
    } else {
      valueNumber += "$" + (+i + 1);
    }
  }
  const query = `
  INSERT INTO pipe_know (${fields})
  VALUES (${valueNumber}) 
  RETURNING *;`;

  const result = await dbquery(query, values);
  const resultrows = { query: req, method: req.method, body: req.body };
  console.log("query", resultrows);
  res.status(200).json(result);
};
// create application/json parser
var jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: true });
//tableRouter.use("/add_record", urlencodedParser, add_record);
tableRouter.use("/add_record", jsonParser, add_record);
