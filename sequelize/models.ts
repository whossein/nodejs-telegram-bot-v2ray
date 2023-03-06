import {
  Sequelize,
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { storagePath } from "../config/constant";

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: storagePath,
});

interface UserModel
  extends Model<
    InferAttributes<UserModel>,
    InferCreationAttributes<UserModel>
  > {
  // Some fields are optional when calling UserModel.create() or UserModel.build()
  id: CreationOptional<number>;
  user_id: number;
  up: number;
  down: number;
  total: number;
  remark: string;
  enable: boolean;
  expiry_time: number;
  listen: string;
  port: number;
  protocol: string;
  settings:
    | string
    | {
        client: {
          password: string;
          email: string;
          flow: string;
          total: number;
        }[];
        fallbacks: [];
      };
  stream_settings: any;
  tag: string; // uniquie
  sniffing: any;
}

export const Inblounds = sequelize.define<UserModel>(
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
