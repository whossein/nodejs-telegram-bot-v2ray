import { Sequelize, Model, DataTypes } from "sequelize";

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "C:/Users/Hossein/Desktop/x-ui.db",
});

export const Inblounds = sequelize.define(
  "inbounds",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    up: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    down: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    total: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    remark: DataTypes.STRING,
    enable: {
      type: DataTypes.BOOLEAN,
      defaultValue: 1,
    },
    expiry_time: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    listen: {
      type: DataTypes.TEXT,
    },
    port: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
    }, // uniquie
    protocol: DataTypes.STRING,
    settings: DataTypes.JSON,
    stream_settings: DataTypes.JSON,
    tag: {
      type: DataTypes.TEXT,
      unique: true,
    }, // uniquie
    sniffing: DataTypes.JSON,
  },
  { timestamps: false }
);

// try {
//   sequelize.authenticate();
//   console.log("Connection DB");
// } catch (error) {
//   console.error("Unable to connect to the database:", error);
// }
