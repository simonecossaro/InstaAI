# app

**index.js** : the starting point.

**Login.js** : login screen.

**SignUp.js** : here you can enter your details and join InstaAI.

**Home.js** : the screen immediately after successful login.

The home screen has a tab associated with 5 screens:

**Principal.js** : the main screen where the posts published by the followed appear.

**SearchStack.js** : stack composed by 2 screens:  
* **SearchUser.js** : here you can search for other users;
* **SearchProfileScreen.js** : here you can see the profile of the selected user.

**ImageGenerator.js** : here you can generate images via a command and if you like them you can post.

**ChatStack.js** : stack composed by 2 screens:  
* **ChatSearchScreen.js** : here you can search for a user and open a chat with him or you can directly open one of the chats already started;  
* **ChatScreen.js** : chat with another user.

**Profile.js** : profile screen of the session user.

<br>
<br>

In this directory there are also two additional files:

**database.js** : set of functions that allow you to manage and access a sqlite database.

**session.js** : set of functions necessary to manage sessions, to allow adding the session user and to log out. 
