import React, { useState } from "react";
import { TextField } from "@mui/material";
import Button from "@mui/material/Button";

const loginStyle = {
  position: "absolute",
  width: "300px",
  height: "200px",
  zIndex: "15",
  top: "50%",
  left: "50%",
  margin: "-100px 0 0 -150px",
};
const textspacingStyle = {
  marginTop: "20px",
  width: "300px",
};
const loginButtonStyle = {
  marginTop: "20px",
  width: "200px",
};

export function Login() {
  const [username, setUserName] = useState("");
  const [password, setPassWord] = useState("");
  const handleLogin = () => {
    debugger;
    return fetch("http://localhost:3000/api/v1/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    }).then((data) => data.json());
  };
  return (
    <div style={loginStyle}>
      <TextField
        id="username"
        label="UserName"
        variant="outlined"
        style={textspacingStyle}
        value={username}
        onChange={(e) => setUserName(e.target.value)}
      />{" "}
      <br />
      <TextField
        id="password"
        label="Password"
        variant="outlined"
        style={textspacingStyle}
        value={password}
        onChange={(e) => setPassWord(e.target.value)}
      />
      <br />
      <Button
        variant="contained"
        style={loginButtonStyle}
        onClick={handleLogin}
      >
        Login
      </Button>
    </div>
  );
}
