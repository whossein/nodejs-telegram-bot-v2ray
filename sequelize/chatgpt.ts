import { Sequelize, Model, DataTypes, Optional } from "sequelize";

export type TMessageType = {
  role: "assistant" | "user" | "system";
  content: string;
};

// Connect to the database
export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./chat.db",
});

interface UserAttributes {
  id: number;
  firstName?: string;
  lastName?: string;
  userName?: string;
  allowTokens?: number;
  usedTokens: number;
}

interface UserCreationAttributes extends Optional<UserAttributes, "id"> {}

interface MessageAttributes {
  id: number;
  content: TMessageType[];
  isFinished?: boolean;
  userId: number;
}

interface MessageCreationAttributes extends Optional<MessageAttributes, "id"> {}

// define models
class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public firstName!: string;
  public lastName!: string;
  public userName!: string;
  public allowTokens!: number;
  public usedTokens!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    allowTokens: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    usedTokens: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "users",
  }
);

class Message
  extends Model<MessageAttributes, MessageCreationAttributes>
  implements MessageAttributes
{
  public id!: number;
  public content!: object[];
  public isFinished!: boolean;
  public userId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Message.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    content: {
      type: DataTypes.ARRAY(DataTypes.JSON),
      allowNull: false,
      defaultValue: [],
    },
    isFinished: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    sequelize,
    tableName: "messages",
  }
);

// associations
User.hasMany(Message, { as: "messages", foreignKey: "user_id" });
Message.belongsTo(User, { as: "user", foreignKey: "user_id" });

// sync models with database
sequelize.sync();

export { User, Message };
