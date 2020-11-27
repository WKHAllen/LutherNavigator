import mainDB from "./services/util";

async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// Initialize the database
export default async function initDB() {
  // Create tables
  const imageTable = `
    CREATE TABLE IF NOT EXISTS Image (
      id           CHAR(4)           NOT NULL,
      data         VARBINARY(262144) NOT NULL,
      registerTime INT UNSIGNED      NOT NULL,

      PRIMARY KEY (id)
    );
  `;
  const userTable = `
    CREATE TABLE IF NOT EXISTS User (
      id            CHAR(4)      NOT NULL,
      firstname     VARCHAR(63)  NOT NULL,
      lastname      VARCHAR(63)  NOT NULL,
      email         VARCHAR(63)  NOT NULL,
      password      VARCHAR(255) NOT NULL,
      verified      BOOL         NOT NULL DEFAULT FALSE,
      admin         BOOL         NOT NULL,
      imageID       CHAR(4),
      joinTime      INT UNSIGNED NOT NULL,
      lastLoginTime INT UNSIGNED,
      lastPostTime  INT UNSIGNED,

      PRIMARY KEY (id),

      FOREIGN KEY (imageID)
        REFERENCES Image (id)
    );
  `;
  const postTable = `
    CREATE TABLE IF NOT EXISTS Post (
      id           CHAR(4)       NOT NULL,
      userID       CHAR(4)       NOT NULL,
      content      VARCHAR(1024) NOT NULL,
      imageID      CHAR(4)       NOT NULL,
      location     VARCHAR(255)  NOT NULL,
      program      VARCHAR(255)  NOT NULL,
      rating       TINYINT       NOT NULL,
      bestPlaceFor VARCHAR(255)  NOT NULL,
      threeWords   VARCHAR(63)   NOT NULL,
      createTime   INT UNSIGNED  NOT NULL,
      editTime     INT UNSIGNED,

      PRIMARY KEY (id),

      FOREIGN KEY (userID)
        REFERENCES User (id),

      FOREIGN KEY (imageID)
        REFERENCES Image (id)
    );
  `;
  await mainDB.executeMany([imageTable, userTable, postTable]);

  // Create triggers
  // ClearDB does not support triggers :/
  // const userDeleteTrigger = `
  //   CREATE TRIGGER AfterUserDelete
  //     AFTER DELETE
  //     ON User FOR EACH ROW
  //   BEGIN
  //     DELETE FROM Image WHERE id = OLD.imageID;
  //     DELETE FROM Post WHERE userID = OLD.id;
  //   END;
  // `;
  // const postDeleteTrigger = `
  //   CREATE TRIGGER AfterPostDelete
  //     AFTER DELETE
  //     ON Post FOR EACH ROW
  //   DELETE FROM Image WHERE id = OLD.imageID;
  // `;
  // await mainDB.executeMany([userDeleteTrigger, postDeleteTrigger]);

  await wait(1000);
  const rows = await mainDB.execute("SELECT id FROM Main;");
  const message = "Hello, world!";
  if (rows.length === 0) {
    await mainDB.execute("INSERT INTO Main (message) VALUES (?);", [message]);
  }
}
