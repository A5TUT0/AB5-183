document.addEventListener("DOMContentLoaded", () => {
  const postTitleInput = document.getElementById("post-title");
  const postContentInput = document.getElementById("post-content");
  const createPostButton = document.getElementById("create-post");
  const logoutButton = document.getElementById("logout");

  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    window.location.href = "/login.html";
  }

  const generatePostHTML = (post) => {
    return `
      <div class="post">
        <h3>${post.title}</h3>
        <p>${post.content}</p>
      </div>
    `;
  };

  const getPosts = async () => {
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

    const postsHTML = decryptedPosts.map(generatePostHTML).join("");
    document.getElementById("posts").innerHTML = postsHTML;
  };

  createPostButton.addEventListener("click", async () => {
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

    getPosts();
  });

  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("user");
    localStorage.removeItem("publicKey");
    localStorage.removeItem("privateKey");
    window.location.href = "/login.html";
  });

  getPosts();
});
