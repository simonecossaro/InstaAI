import * as SQLite from 'expo-sqlite';

// Opening the database
const db = SQLite.openDatabase('InstaAIDatabase.db');

// USERS DATABASE

const initUsersDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS Users (username TEXT PRIMARY KEY, password TEXT, name TEXT, surname TEXT, email TEXT, date_of_birth DATE)',
      [],
      () => console.log('Users database initialized correctly'),
      error => console.error('Error initializing users database', error)
    );
  });
};

export const addUserToDatabase = (username, password, name, surname, email, date_of_birth) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO Users (username, password, name, surname, email, date_of_birth) VALUES (?, ?, ?, ?, ?, ?)',
      [username, password, name, surname, email, date_of_birth],
      () => console.log('User added to the database'),
      error => console.error('Error saving user to the database', error)
    );
  });
};

export const getUsersFromDatabase = () => {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
              'SELECT * FROM Users',
              [],
              (_, { rows }) => resolve(rows._array),
              error => reject('Error fetching users from database', error)
            );
        });
    });
};

export const getUserInfo = (username) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM Users WHERE username = ?',
          [username],
          (_, { rows }) => resolve(rows._array),
          error => reject('Error fetching user info from database', error)
        );
    });
  });
};

export const checkCredentials = (username, password) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Users WHERE username = ? AND password = ?',
        [username, password],
        (_, { rows }) => {
          if (rows.length > 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        },
        error => {
          console.error('Error login:', error);
          resolve(false); 
        }
      );
    });
  });
};

export const isUsernameAvailable = (username) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Users WHERE username = ?',
        [username],
        (_, { rows }) => {
          if (rows.length > 0) {
            resolve(false);
          } else {
            resolve(true);
          }
        },
        error => {
          console.error('Error searching username availability:', error);
          resolve(false); 
        }
      );
    });
  });
};


// IMAGES DATABASE

const initImagesDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS Images (id INTEGER PRIMARY KEY AUTOINCREMENT, url TEXT, owner TEXT, description TEXT, creation_date TEXT)',
      [],
      () => console.log('Images database initialized correctly'),
      error => console.error('Error initializing images database', error)
    );
  });
};

export const addImageToDatabase = (url, owner, description, creation_date) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO Images (url, owner, description, creation_date) VALUES (?, ?, ?, ?)',
      [url, owner, description, creation_date],
      () => console.log('Image saved to the database'),
      error => console.error('Error saving image to the database', error)
    );
  });
};

export const getImagesFromDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM Images ORDER BY creation_date DESC`,
        [],
        (_, { rows }) => resolve(rows._array),
        error => reject(error)
      );
    });
  });
};

// fetch all the images of the users followed
export const getImagesForSessionUser = (sessionUser) => {
  const sqlQuery = `
    SELECT * FROM Images 
    WHERE EXISTS (
      SELECT 1 
      FROM Follow 
      WHERE follower = ? 
      AND followed = Images.owner
    ) ORDER BY creation_date DESC
  `;
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        sqlQuery,
        [sessionUser],
        (_, { rows }) => resolve(rows._array),
        error => reject(error)
      );
    });
  });
};

export const fetchUserProfileImagesFromDatabase = (user) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Images WHERE owner = ? ORDER BY creation_date DESC',
        [user],
        (_, { rows }) => resolve(rows._array),
        error => reject(error)
      );
    });
  });
};

// count the number of posts of a user
export const getPostNumber = (username) => {
  return new Promise((resolve, reject) => {
      db.transaction(tx => {
          tx.executeSql(
            'SELECT COUNT(*) AS count FROM Images WHERE owner = ?',
            [username],
            (_, { rows }) => {
              const count = rows.item(0).count;
              resolve(count);
            },
            error => reject('Error fetching number of posts from database', error)
          );
      });
  });
};

// FOLLOW DATABASE

const initFollowDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS Follow (id INTEGER PRIMARY KEY AUTOINCREMENT, follower TEXT, followed TEXT, FOREIGN KEY (follower) REFERENCES Users(username), FOREIGN KEY (followed) REFERENCES Users(username))',
      [],
      () => console.log('Follow database initialized correctly'),
      error => console.error('Error initializing follow database', error)
    );
  });
};

export const addFollowToDatabase = (follower, followed) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO Follow (follower, followed) VALUES (?, ?)',
      [follower, followed],
      () => console.log('Follow saved to the database'),
      error => console.error('Error saving follow to the database', error)
    );
  });
};

export const removeFollowFromDatabase = (follower, followed) => {
  console.log('In remove follow, the parameters are:');
  console.log('rFFD follower: ',follower);
  console.log('rFFD followed: ',followed);
  db.transaction(tx => {
    tx.executeSql(
      'DELETE FROM Follow WHERE follower = ? AND followed = ?',
      [follower, followed],
      () => console.log('Follow removed from the database'),
      error => console.error('Error removing follow from the database', error)
    );
  });
};

export const getNumberFollower = (followedUser) => {
  return new Promise((resolve, reject) => {
      db.transaction(tx => {
          tx.executeSql(
            'SELECT COUNT(*) AS count FROM Follow WHERE followed = ?',
            [followedUser],
            (_, { rows }) => {
              const count = rows.item(0).count;
              resolve(count);
            },
            error => reject('Error fetching followers from database', error)
          );
      });
  });
};

export const getNumberFollowed = (followerUser) => {
  return new Promise((resolve, reject) => {
      db.transaction(tx => {
          tx.executeSql(
            'SELECT COUNT(*) AS count FROM Follow WHERE follower = ?',
            [followerUser],
            (_, { rows }) => {
              const count = rows.item(0).count;
              resolve(count);
            },
            error => reject('Error fetching followed from database', error)
          );
      });
  });
};

// check if a user follow another
export const checkFollow = (follower, followed) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Follow WHERE follower = ? AND followed = ?',
        [follower, followed],
        (_, { rows }) => {
          if (rows.length > 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        },
        error => {
          console.error('Error checking follow:', error);
          resolve(false); 
        }
      );
    });
  });
};

// LIKES DATABASE

const initLikesDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS Likes (id INTEGER PRIMARY KEY AUTOINCREMENT, follower TEXT, image_id INTEGER, FOREIGN KEY (follower) REFERENCES Users(username))',
      [],
      () => console.log('Likes database initialized correctly'),
      error => console.error('Error initializing likes database', error)
    );
  });
};

export const addLikeToDatabase = (follower, image_id) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO Likes (follower, image_id) VALUES (?, ?)',
      [follower, image_id],
      () => console.log('Like saved to the database'),
      error => console.error('Error saving like to the database', error)
    );
  });
};

export const removeLikeFromDatabase = (follower, image_id) => {
  db.transaction(tx => {
    tx.executeSql(
      'DELETE FROM Likes WHERE follower = ? AND image_id = ?',
      [follower, image_id],
      () => console.log('Like removed from the database'),
      error => console.error('Error removing like from the database', error)
    );
  });
};

// check if a user liked the post
export const userLikedThisPost = (user, image_id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Likes WHERE follower = ? AND image_id = ?',
        [user, image_id],
        (_, { rows }) => {
          if (rows.length > 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        },
        error => {
          console.error('Error checking if users liked the post:', error);
          resolve(false); 
        }
      );
    });
  });
};

// returns the number of like of a post
export const getNumberLikes = (image_id) => {
  return new Promise((resolve, reject) => {
      db.transaction(tx => {
          tx.executeSql(
            'SELECT COUNT(*) AS count FROM Likes WHERE image_id = ?',
            [image_id],
            (_, { rows }) => {
              const count = rows.item(0).count;
              resolve(count);
            },
            error => reject('Error fetching number of likes from database', error)
          );
      });
  });
};

// CHAT DATABASE

const initMessagesDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS Messages (id INTEGER PRIMARY KEY AUTOINCREMENT, sender TEXT, recipient TEXT, message TEXT, datetime DATETIME DEFAULT (datetime(\'now\',\'localtime\')), FOREIGN KEY (sender) REFERENCES Users(username), FOREIGN KEY (recipient) REFERENCES Users(username))',
      [],
      () => console.log('Messages database initialized correctly'),
      error => console.error('Error initializing messages database', error)
    );
  });
};

export const addMessageToDatabase = (sender, recipient, message) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO Messages (sender, recipient, message) VALUES (?, ?, ?)',
      [sender, recipient, message],
      () => console.log('Message saved to the database'),
      error => console.error('Error saving message to the database', error)
    )
  })
};

// get all the messages of a user
export const getChats = async(sessionUser) => {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `
                SELECT sender, recipient, message, datetime 
                FROM Messages 
                WHERE sender = ? OR recipient = ? 
                ORDER BY datetime DESC
                `,
                [sessionUser, sessionUser],
                (tx, result) => {
                    const messageGroups = {};

                    for (let i = 0; i < result.rows.length; i++) {
                        const row = result.rows.item(i);
                        const otherUser = row.sender === sessionUser ? row.recipient : row.sender;
                        const key = [sessionUser, otherUser].sort().join("_");

                        if (!messageGroups[key]) {
                            messageGroups[key] = [];
                        }

                        messageGroups[key].push({
                            sender: row.sender,
                            recipient: row.recipient,
                            message: row.message,
                            datetime: row.datetime
                        });
                    }
                    const messagesArray = Object.values(messageGroups);
                    messagesArray.forEach(messages => {
                        messages.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
                    });
                    resolve(messagesArray);
                },
                error => {
                    reject(error);
                }
            );
        });
    });
}

// get all the messages between two users
export const getMessagesUserToUser = (sessionUser, otherUser) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM Messages WHERE (sender = ? AND recipient = ?) OR (sender = ? AND recipient = ?) ORDER BY datetime DESC',
        [sessionUser, otherUser, otherUser, sessionUser],
        (_, { rows }) => {
          resolve(rows._array);
        },
        error => reject('Error get messages user to user info from database', error)
      );
    });
  });
};

initUsersDatabase();
initImagesDatabase();
initFollowDatabase();
initLikesDatabase();
initMessagesDatabase();
