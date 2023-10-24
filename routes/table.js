const express = require("express");
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
const insertRecord = async (req, res) => {
  const field = Object.keys(req.query);
  const values = Object.values(req.query);
  console.log("insertRecord", req.query, field, values);
  const query = `
  INSERT INTO pipe_know (${field})
  VALUES ($1) 
  RETURNING *;`;
  console.log("query", query);
  //const result = await dbquery(query, values);
  res.status(200).json({ result: " result" });
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