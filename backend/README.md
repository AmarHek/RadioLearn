Backend Working Structure

- server.ts sets up Server on Port 3000 and is the file that has to be executed
- app.ts connects to MongoDB, sets CORSE Headers and defines basic API Path

Folder models:

- templateSchema.ts defines how a template looks like in the database (a template and its name), 
have in mind that an id is automatically added as well
- template.ts defines how a dict and its substructures look like when an excel file is converted

Folder Routes:
- Defines Routes for API, the options are "get all dicts", "modify one dict", "delete one dict", 
  "upload an ui generated dict" and "upload an excel generated dict"
- call the functions from ../controllers/templateController.ts

Folder controllers:
- createDict, changeDict, deleteDict and getDicts all operate fairly simple. 
  Just one call to the database and either fetch, update or change data. Afterwards return the result
- createExcelDict saves the Excel in the ../excels folder. Afterwards it is converted to json by an external library function. The function from ../excels/excelParser.ts is called on that json and converts the plain json to a nested json
- Before returning success, the excel and json are deleted from server storage, the name is checked for duplicates in the db (if so, add _cpy to its name) and finally the new dict is added
to the db

Folder excels:
- excelParser.ts takes a plain json that was made from an excel. It iterates through all elements of that json and looks for toplevel elements. Everything else is nested into those toplevel elements


