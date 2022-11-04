const token = localStorage.getItem("token");
const sendMessage = document.getElementById("sendMessage");
const contactHtml = document.querySelectorAll(".contact");
const addnewgroup = document.getElementById("addnewgroup");
var myInterval;
var newInterval;
var oldmsgs;
var oldGrpMsgs;

window.addEventListener("DOMContentLoaded", () => {
  if (!token) {
    window.location.href = "http://43.205.120.101:3000/login.html";
  }

  getAllChats();
  getAllGroups();

  sendMessage.addEventListener("click", sendNewText);
  addnewgroup.addEventListener("click", () => {
    const groupformhtml = document.getElementsByClassName("addGroupForm")[0];
    if (groupformhtml.classList.contains("active")) {
      groupformhtml.classList.remove("active");
    } else {
      groupformhtml.classList.add("active");
    }
  });
  document.getElementById("newgroup").addEventListener("click", AddNewGroup);
});

async function getAllGroups() {
  const response = await axios.get(
    "http://43.205.120.101:3000/group-chat/all-groups",
    {
      headers: { Authorization: token },
    }
  );
  // console.log(response);
  const groups = response.data.groups;
  groups.forEach((group) => {
    const chat = {
      id: group.id,
      username: group.name,
    };
    contactListNew(chat, true);
  });
  const contactListHtml = document.getElementsByClassName("contact-list")[0];
  for (let i = 0; i < contactListHtml.children.length; i++) {
    const gp = contactListHtml.children[i];
    if (gp.classList.contains("group")) {
      gp.addEventListener("click", specificGroup);
    }
  }
}

async function AddNewGroup(e) {
  e.preventDefault();
  const groupName = document.getElementById("groupName").value;
  if (!groupName) {
    console.log("group name required");
    return;
  }
  const response = await axios.post(
    "http://43.205.120.101:3000/group-chat/new-group",
    {
      groupName: groupName,
    },
    {
      headers: { Authorization: token },
    }
  );
  // console.log(response);
  const chat = {
    id: response.data.groupId,
    username: response.data.groupName,
  };
  contactListNew(chat, true);
}

async function sendNewText() {
  const newText = document.getElementById("newtext").value;
  document.getElementById("newtext").value = "";
  const profileUsername =
    document.getElementsByClassName("profile-username")[0];
  if (!profileUsername.id) {
    console.log("select chat");
    return;
  }
  let apiCall;
  let obj;
  if (profileUsername.classList.contains("group")) {
    const groudId = profileUsername.id;
    apiCall = "http://43.205.120.101:3000/group-chat/new-chat";
    obj = {
      id: groudId,
      content: newText,
    };
    console.log("am i here");
  } else {
    const OtherUserId = profileUsername.id;
    apiCall = "http://43.205.120.101:3000/chat/new-chat";
    obj = {
      id: OtherUserId,
      content: newText,
    };
  }
  const response = await axios.post(`${apiCall}`, obj, {
    headers: { Authorization: token },
  });
  console.log(response);
  addToChatList(response.data.result.content || newText, true);
}

function addToChatList(newText, isSent, username) {
  if (!username) {
    var username = "";
  }
  const texts = document.getElementsByClassName("texts")[0];
  // console.log(texts);
  const text = document.createElement("div");
  text.className = "text";
  if (isSent) {
    text.className = "text sent";
    username = "You";
  }
  text.innerHTML = `<p><span class="text-username">${username}  </span>${newText}</p>`;
  texts.appendChild(text);
}

async function getAllChats() {
  const response = await axios.get(
    "http://43.205.120.101:3000/chat/all-chats",
    {
      headers: { Authorization: token },
    }
  );
  //   console.log(response);
  const chatList = response.data.allUser;
  addToContactList(chatList, false);
}

function addToContactList(chatList, isGroup) {
  //   console.log(chatList);
  const contactListHtml = document.getElementsByClassName("contact-list")[0];
  contactListHtml.innerHTML = "";
  chatList.forEach((chat) => {
    contactListNew(chat, isGroup);
  });
  for (let i = 0; i < contactListHtml.children.length; i++) {
    contactListHtml.children[i].addEventListener("click", specificUser);
  }
}

function contactListNew(chat, isGroup) {
  const contactListHtml = document.getElementsByClassName("contact-list")[0];
  const contact = document.createElement("div");
  contact.id = chat.id;
  // console.log(isGroup, contact.classList);
  contact.className = "contact";
  const newclass = isGroup ? "group" : "notGroup";
  contact.classList.add(newclass);
  contact.innerHTML = `<div class="contact-info">
      <img class="profileImg" src="../images/images.jpg" />
      <div class="text-info">
        <h3 id=${chat.username}>${chat.username}</h3>
        <p>joined Chat</p>
      </div>
    </div>
    <p class="date">12:04am</p>`;
  contactListHtml.append(contact);
}

async function specificGroup(e) {
  if (myInterval) {
    clearInterval(myInterval);
  }
  let groupId = e.target.id;
  const texts = document.getElementsByClassName("texts")[0];
  texts.innerHTML = "";
  myInterval = setInterval(async () => {
    let key = `g${groupId}`;
    let lastmsg = 0;
    // console.log(localStorage.getItem(key));
    if (localStorage.getItem(key)) {
      oldGrpMsgs = JSON.parse(localStorage.getItem(key));
      lastmsg = oldGrpMsgs.length;
      // console.log("oldmsgs", oldGrpMsgs);
      addOldMsgs(oldGrpMsgs);
    }
    const response = await axios.get(
      `http://43.205.120.101:3000/group-chat/get-chat/${groupId}?lastmsg=${lastmsg}`,
      {
        headers: { Authorization: token },
      }
    );
    // console.log("group chat of this ", response);
    groupId = response.data.group.id;
    let loggedUserId = response.data.loggedUserId;
    let groupName = response.data.group.name;
    const messages = response.data.groupMessages;
    // console.log(messages);
    const profileUsername =
      document.getElementsByClassName("profile-username")[0];
    profileUsername.id = groupId;
    profileUsername.innerText = groupName;
    profileUsername.classList.add("group");

    const newmsg = [];
    messages.forEach((message) => {
      let isSent = true;
      if (message.userId != loggedUserId) {
        isSent = false;
      }
      const content = message.content;
      newmsg.push([content, isSent, message.user.username]);
      addToChatList(content, isSent, message.user.username);
    });
    if (!oldGrpMsgs) {
      oldGrpMsgs = [...newmsg];
    } else {
      oldGrpMsgs = [...oldGrpMsgs, ...newmsg];
    }
    localStorage.setItem(key, JSON.stringify(oldGrpMsgs));
    const addmemberhtml = document.getElementsByClassName("add-user")[0];
    const getGroupUsers = document.getElementsByClassName("get-group")[0];
    if (!addmemberhtml.classList.contains("active")) {
      addmemberhtml.classList.add("active");
      addmemberhtml.addEventListener("click", addmemberjs);
    }
    if (!getGroupUsers.classList.contains("active")) {
      getGroupUsers.classList.add("active");
      getGroupUsers.addEventListener("click", getGroupMembers);
    }
  }, 1000);
}

async function getGroupMembers(e) {
  const groupId = document.getElementsByClassName("profile-username")[0].id;
  const groupmembershtml = document.getElementsByClassName("group-members")[0];
  if (groupmembershtml.classList.contains("active")) {
    groupmembershtml.classList.remove("active");
  } else {
    groupmembershtml.classList.add("active");
  }
  const response = await axios.get(
    `http://43.205.120.101:3000/group-chat/get-all-users/${groupId}`,
    {
      headers: { Authorization: token },
    }
  );
  // console.log(response);
  groupmembershtml.innerHTML = `<h2>All users</h2>`;
  const allmembers = response.data.allmembers;
  allmembers.forEach((member) => {
    const div = document.createElement("div");
    div.className = "group-member";
    div.name = member.id;
    const h3 = document.createElement("h3");
    h3.innerText = member.username;
    div.appendChild(h3);
    const adminbtn = document.createElement("button");
    const removebtn = document.createElement("button");
    removebtn.innerText = "remove";
    // console.log(member);
    if (member.usergroup.superadmin) {
      const p = document.createElement("p");
      p.classList = "group-p";
      p.innerText = "super admin";
      div.appendChild(p);
    } else if (member.usergroup.admin) {
      const p = document.createElement("p");
      p.innerText = "admin";
      removebtn.name = member.id;
      div.appendChild(p);
      div.appendChild(removebtn);
    } else {
      adminbtn.innerText = "admin";
      adminbtn.name = member.id;
      removebtn.name = member.id;
      adminbtn.classList = "make-group-admin";
      div.appendChild(adminbtn);
      div.appendChild(removebtn);
    }
    groupmembershtml.appendChild(div);
    adminbtn.addEventListener("click", makeUserAdmin);
    removebtn.addEventListener("click", removeUserGroup);
  });
}

async function removeUserGroup(e) {
  const groupId = document.getElementsByClassName("profile-username")[0].id;
  const userId = e.target.name;
  const response = await axios.delete(
    `http://43.205.120.101:3000/group-chat/remove-user/${groupId}?userId=${userId}`,
    {
      headers: { Authorization: token },
    }
  );
  // console.log(response);
  if (response.data.sucess) {
    getGroupMembers();
  }
  const msg = response.data.msg;
  alert(msg);
}

async function makeUserAdmin(e) {
  const groupId = document.getElementsByClassName("profile-username")[0].id;
  const userId = e.target.name;
  const response = await axios.post(
    `http://43.205.120.101:3000/group-chat/make-user-admin/${groupId}`,
    {
      userId: userId,
    },
    {
      headers: { Authorization: token },
    }
  );
  // console.log(response);
  if (response.data.sucess) {
    getGroupMembers();
  }
  const msg = response.data.msg;
  alert(msg);
}

function addmemberjs(e) {
  let parent = e.target.parentElement;
  const groupId = e.target.id;
  const addUser = document.getElementsByClassName("add-user-form")[0];
  if (!addUser.classList.contains("active")) {
    addUser.classList.add("active");
  }
  document.getElementById("exit-add-user").addEventListener("click", () => {
    addUser.classList.remove("active");
  });
  document.getElementById("search-user").addEventListener("input", (e) => {
    const userLike = e.target.value;
    const user = document.getElementById(userLike);
    let userId;
    // console.log(user);
    if (user) {
      // console.log(user);
      userId = user.parentElement.parentElement.parentElement.id;
      const searchUser = document.getElementsByClassName("searched-user")[0];
      searchUser.classList.add("active");
      searchUser.innerHTML = "";
      searchUser.innerHTML = `<h4>${user.id}</h4><button name=${userId} class="find-user">Add</button>`;
      searchUser.children[1].addEventListener("click", NewGroupMember);
    }
  });
}

async function NewGroupMember(e) {
  const groupId = document.getElementsByClassName("profile-username")[0].id;
  const userId = e.target.name;
  const response = await axios.post(
    `http://43.205.120.101:3000/group-chat/add-user`,
    {
      userId: userId,
      groupId,
    },
    {
      headers: { Authorization: token },
    }
  );
  // console.log(response);
  const msg = response.data.msg;
  alert(msg);
}

async function specificUser(e) {
  if (myInterval) {
    clearInterval(myInterval);
  }
  let parent = e.target;
  let rid;
  rid = parent.id;
  const texts = document.getElementsByClassName("texts")[0];
  texts.innerHTML = "";
  let lastmsg = 0;
  myInterval = setInterval(async () => {
    if (localStorage.getItem(rid)) {
      oldmsgs = JSON.parse(localStorage.getItem(rid));
      lastmsg = oldmsgs.length;
      addOldMsgs(oldmsgs);
    }
    let response;
    response = await axios.get(
      `http://43.205.120.101:3000/chat/user/${rid}?lastmsg=${lastmsg}`,
      {
        headers: { Authorization: token },
      }
    );
    // console.log(response);
    const userId = response.data.userId;
    const messages = response.data.allMessages;
    const OtherUser = response.data.otheruser;
    const profileUsername =
      document.getElementsByClassName("profile-username")[0];
    profileUsername.id = OtherUser.id;
    profileUsername.innerText = OtherUser.username;
    if (messages.length > 0) {
      display(messages, userId, rid);
    }
    if (
      document
        .getElementsByClassName("add-user")[0]
        .classList.contains("active")
    ) {
      document.getElementsByClassName("add-user")[0].classList.remove("active");
    }
  }, 1000);
}

function addOldMsgs(messages, isGroup) {
  const texts = document.getElementsByClassName("texts")[0];
  texts.innerHTML = "";
  messages.forEach((message) => {
    const content = message[0];
    addToChatList(content, message[1], message[2]);
  });
}

function display(messages, userId, rid) {
  const newmsg = [];
  // const texts = document.getElementsByClassName("texts")[0];
  // texts.innerHTML = "";
  messages.forEach((message) => {
    let isSent = true;
    if (message.userId != userId) {
      isSent = false;
    }
    const content = message.content;
    newmsg.push([message.content, isSent]);
    addToChatList(content, isSent);
  });
  // // console.log(newmsg);
  // newmsg.forEach((msgs) => {
  //   console.log(msgs);
  // });
  if (!oldmsgs) {
    oldmsgs = [...newmsg];
  } else {
    oldmsgs = [...oldmsgs, ...newmsg];
  }
  localStorage.setItem(rid, JSON.stringify(oldmsgs));
}
