document.addEventListener("DOMContentLoaded", () => {
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const loginButton = document.getElementById("login");
  const createPostButton = document.getElementById("createPost");
  const postTitleInput = document.getElementById("postTitle");
  const postContentInput = document.getElementById("postContent");
  const resultText = document.getElementById("result");

  const login = async (username, password) => {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    const result = await response.text();
    resultText.innerHTML = result;
  };

  const fetchKeys = async () => {
    const response = await fetch("/api/keys");
    const keys = await response.json();
    localStorage.setItem("publicKey", keys.publicKey);
    localStorage.setItem("privateKey", keys.privateKey);
  };

  const createPost = async () => {
    const title = postTitleInput.value;
    const content = postContentInput.value;
    const publicKey = localStorage.getItem("publicKey");

    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(publicKey);

    const encryptedTitle = encrypt.encrypt(title);
    const encryptedContent = encrypt.encrypt(content);

    await fetch("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: encryptedTitle,
        content: encryptedContent,
      }),
    });

    postTitleInput.value = "";
    postContentInput.value = "";
    fetchPosts();
  };

  const fetchPosts = async () => {
    const response = await fetch("/api/posts");
    const posts = await response.json();
    const privateKey = localStorage.getItem("privateKey");

    const decrypt = new JSEncrypt();
    decrypt.setPrivateKey(privateKey);

    const decryptedPosts = posts.map((post) => ({
      id: post.id,
      title: decrypt.decrypt(post.title),
      content: decrypt.decrypt(post.content),
    }));

    const feed = document.getElementById("feed");
    feed.innerHTML = "";
    decryptedPosts.forEach((post) => {
      const postElement = document.createElement("div");
      postElement.innerHTML = `
        <h3>${post.title}</h3>
        <p>${post.content}</p>
      `;
      feed.appendChild(postElement);
    });
  };

  loginButton.addEventListener("click", async () => {
    const username = usernameInput.value;
    const password = passwordInput.value;
    await login(username, password);
    await fetchKeys();
    await fetchPosts();
  });

  createPostButton.addEventListener("click", createPost);
});
