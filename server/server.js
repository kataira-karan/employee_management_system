const express = require("express");
const app = express();
var cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { graphqlHTTP } = require("express-graphql");

// buildSchema =>  it passes a string which will be use as a schema defination
const { buildSchema } = require("graphql");

// const Employee = require("../assignment1/models/employee");

app.use(cors());

const Employee = require("./models/employee");

app.use(bodyParser.json());

// connection string
mongoose.connect(
  "mongodb+srv://dbuser:dbuser@cluster0.fzasn.mongodb.net/?retryWrites=true&w=majority",
  { useNewUrlParser: true }
);

// only one endpoint of graphql  you can use whatever you want in place of "/graphql"

// graphHttp require endpoints,quries,mutations
// schema points to graphql schema
// rootvalue :  point at JS object where all the resolver function

//  RootQuery => RootQuery Has all the different types of queries. Qureies means retrieving data only like get request in REST API.
// RootMutation => It has all the mutation declaration. Mutation means methods like POST,DELETE,PUT etc. It update the database. Its like a controller in RST API
//rootValue => rootValue containes all the defination of mutations.

// FirstName, LastName, Age, DateOfJoining, Title, Department, EmployeeType
app.use(
  "/graphql",
  graphqlHTTP({
    schema: buildSchema(`

    scalar Date   

    type Employee {
      _id : ID!,
      firstName : String!,
      lastName : String!,
      age : Int!,
      dateOfJoining : String!,
      title  : String! , 
      department : String!,
      employeeType : String!,
      currentStatus : String!
    }

    input createEmployeeInput {
      firstName : String!,
      lastName : String!,
      age : String!,
      dateOfJoining : String!,
      title  : String! , 
      department : String!,
      employeeType : String!
        
    }

    type RootQuery {

      getEmployeesByType(employeeType : String! ) : [Employee!]!

      getEmployees : [Employee!]!
      
      employees: [Employee!]!

      getEmployeeById(employeeId : String!) : Employee!

    }

    type RootMutation{
      createEmployee( employeeInput :  createEmployeeInput   ) : Employee  

      deleteEmployeeById(employeeId : String!) : String

      editEmployee(employeeId : String! ,updatedTitle : String , updatedDepartment : String , updatedCurrentStatus : String ) : Employee!
    }
    schema  {
      query :  RootQuery
      mutation: RootMutation
    }
    `),

    // schema must have query(fetching data) and mutation(changing data). we can define everythig in schema
    //  but we will seperate queries and mutation in RootQuery and RootMutation ,
    rootValue: {
      employees: () => {
        return ["karan", "kataria"];
      },

      getEmployees: async () => {
        console.log("hello there");
        const employees = await Employee.find();
        console.log(employees);
        return employees;
      },

      getEmployeesByType: async (args) => {
        if (args.employeeType === "") {
          return Employee.find({});
        }
        console.log("args", args);
        const employees = await Employee.find({
          employeeType: args.employeeType,
        });
        // console.log(employees);
        return employees;
      },

      getEmployeeById: async (args) => {
        return Employee.findOne({ _id: args.employeeId });
      },

      // FirstName, LastName, Age, DateOfJoining, Title, Department, EmployeeType
      createEmployee: (args) => {
        const employeeName = args.firstName + args.lastName;

        const emp = new Employee({
          firstName: args.employeeInput.firstName,
          lastName: args.employeeInput.lastName,
          age: args.employeeInput.age,
          dateOfJoining: args.employeeInput.dateOfJoining,
          title: args.employeeInput.title,
          department: args.employeeInput.department,
          employeeType: args.employeeInput.employeeType,
        });

        // adding employee to the database
        return emp
          .save()
          .then((result) => {
            console.log(result);
          })
          .catch((err) => {
            console.log(err);
          });

        return emp;
      },

      deleteEmployeeById: async (args) => {
        try {
          await Employee.deleteOne({ _id: args.employeeId });
          return `${args.employeeId} is deleted Successfully`;
        } catch (error) {
          return `${error}`;
        }
      },

      editEmployee: async (args) => {
        console.log("editing emp");

        console.log(args);
        const filter = { _id: args.employeeId };
        const updatedFields = {
          title: args.updatedTitle,
          department: args.updatedDepartment,
          currentStatus: args.updatedCurrentStatus,
        };
        let updatedEmp = await Employee.findByIdAndUpdate(
          filter,
          updatedFields,
          {
            new: true,
          }
        );

        return updatedEmp;
      },
    },

    graphiql: true,
  })
);

const connection = mongoose.connection;

// database connection
connection.once("open", () => {
  console.log("Database is connected ");
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

// running server
app.listen(5005, () => {
  console.log(`Server is running on 5000`);
});
