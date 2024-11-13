document.addEventListener("DOMContentLoaded", () => {
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const loginButton = document.getElementById("login");
  const errorText = document.getElementById("error");

  loginButton.addEventListener("click", async () => {
    const username = usernameInput.value;
    const password = passwordInput.value;
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (data?.username) {
      localStorage.setItem("user", JSON.stringify(data));

      const keysResponse = await fetch("/api/keys");
      const keys = await keysResponse.json();
      localStorage.setItem("publicKey", keys.publicKey);
      localStorage.setItem("privateKey", keys.privateKey);

      window.location.href = "/";
    } else {
      errorText.innerText = "Credenciales incorrectas";
    }
  });
});
