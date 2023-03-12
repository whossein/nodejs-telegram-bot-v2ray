import { Sequelize, Model, DataTypes } from "sequelize";

// Connect to the database
export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "chat.db",
});

// Define a model
class MyModel extends Model {
  public myArray!: Array<object>;
}

MyModel.init(
  {
    myArray: {
      type: DataTypes.ARRAY(DataTypes.JSON),
      allowNull: false,
      defaultValue: [],
    },
  },
  {
    sequelize,
    modelName: "MyModel",
  }
);

// Create an array of objects
const myArray = [
  { name: "John", age: 30, email: "john@example.com" },
  { name: "Jane", age: 25, email: "jane@example.com" },
  { name: "Bob", age: 40, email: "bob@example.com" },
];

// Create a new instance of the model and save it to the database
MyModel.create({ myArray })
  .then(() => {
    console.log("Object saved to database");
  })
  .catch((err: Error) => {
    console.error(err);
  });
