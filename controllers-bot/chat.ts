import { Message, sequelize, User } from "../sequelize/chatgpt";

function createNewContent() {
  // close perviwes content
  // create new content
}

function appendContent() {
  // fetch previews content
  // append
  // update db
}

function getContent() {
  // fetch previews content
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
    const message = await Message.create({
      content: [
        {
          role: "user",
          content: "This is my first post",
        },
      ],
      userId: user.id,
      isFinished: false,
    });

    // Find all posts with their author
    const postsWithAuthor = await Message.findAll({
      include: [{ model: User, as: "author", attributes: ["name"] }],
      raw: true,
    });

    console.log(postsWithAuthor);
  } catch (error) {
    console.error(error);
  } finally {
    await sequelize.close();
  }
}
