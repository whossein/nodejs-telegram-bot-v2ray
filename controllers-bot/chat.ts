import { Message, sequelize, User } from "../sequelize/chatgpt";

export async function createUser(
  userName: string,
  firstName?: string,
  lastName?: string
) {
  try {
    await sequelize.authenticate();
    await User.sync();
    const [user, created] = await User.findOrCreate({
      where: {
        userName: userName,
      },
      defaults: {
        firstName,
        lastName,
      },
    });

    // console.log("created", created);
    // console.log("user created: \n\r", user.dataValues);

    return user.dataValues;
  } catch (error) {
    console.error(error);

    return null;
  } finally {
    // await sequelize.close();
  }
}

export async function createNewContent(
  chatId: number,
  userMsg: string,
  userName: string
) {
  try {
    await sequelize.authenticate();
    await Message.sync();
    await Message.update(
      { isFinished: true },
      {
        where: {
          chatId,
        },
      }
    );

    const user = await createUser(userName);

    const msg = await Message.create({
      chatId,
      content: [
        {
          content: userMsg,
          role: "user",
        },
        {
          content: userMsg,
          role: "user",
        },
      ],
      userId: user?.id,
    });

    // console.log("msg created: \n\r", msg.dataValues);

    return msg.dataValues;
  } catch (error) {
    console.error(error);

    return null;
  } finally {
    // await sequelize.close();
  }
}

export async function appendContent(
  chatId: number,
  content: string,
  role: "system" | "user" | "assistant" = "user"
) {
  try {
    await sequelize.authenticate();
    await Message.sync();

    let msg = await getNotFinishContent(chatId);

    if (msg && msg.content) {
      msg.content.push({
        content: content,
        role: role,
      });

      const updateMsg = await Message.update(
        {
          content: msg.content,
        },
        {
          where: {
            chatId,
            isFinished: false,
          },
        }
      );

      return updateMsg;
    }

    return null;
  } catch (error) {
    console.error(error);

    return null;
  } finally {
    // await sequelize.close();
  }
}

export async function getNotFinishContent(chatId: number) {
  try {
    await sequelize.authenticate();
    await Message.sync();

    let msg = await Message.findOne({
      where: {
        chatId,
        isFinished: false,
      },
    });

    if (msg) {
      msg.dataValues.content = JSON.parse(`[${msg.dataValues.content}]`);
    }

    return msg?.dataValues;
  } catch (error) {
    console.error(error);

    return null;
  } finally {
    // await sequelize.close();
  }
}

async function example() {
  try {
    await User.sync({ force: true });
    await Message.sync({ force: true });

    // Create a user
    const user = await User.create({
      firstName: "",
      lastName: "",
      userName: "",
      usedTokens: 10,
      allowTokens: 5000,
    });

    // Create a post belonging to the user
    // const message = await Message.create({
    //   content: [
    //     {
    //       role: "user",
    //       content: "This is my first post",
    //     },
    //   ],
    //   userId: user.id,
    //   isFinished: false,
    //   chatId: 1234567,
    // });

    // Find all posts with their author
    // const postsWithAuthor = await Message.findAll({
    //   include: [{ model: User, as: "author", attributes: ["name"] }],
    //   raw: true,
    // });

    // console.log(postsWithAuthor);
  } catch (error) {
    console.error(error);
  } finally {
    await sequelize.close();
  }
}
