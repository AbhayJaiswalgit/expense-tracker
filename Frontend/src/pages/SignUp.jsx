import React from "react";
import "./Auth.css";
import { Form } from "react-router-dom";
import { handleError, handleSuccess } from "../utils";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Header from "../components/Header";

function SignUp() {
  const navigate = useNavigate();

  const handleSignup = async (event) => {
    event.preventDefault();
    const name = event.target[0].value;
    const email = event.target[1].value;
    const password = event.target[2].value;
    const formdata = { name, email, password };

    const url = "http://localhost:8080/auth/signup";
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formdata),
      });

      const data = await res.json();
      if (data.success === true) {
        handleSuccess(data.message);
        event.target[0].value = "";
        event.target[1].value = "";
        event.target[2].value = "";
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } else {
        handleError(data.error || data.message);
      }
    } catch (err) {
      handleError("try again later");
    }
  };

  return (
    <>
      <Header />
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-heading">Create Account</h1>
          <Form onSubmit={handleSignup}>
            <div>
              <label className="auth-label">Name</label>
              <input type="text" name="name" className="auth-input" />
            </div>
            <div>
              <label className="auth-label">Email address</label>
              <input type="email" name="email" className="auth-input" />
            </div>
            <div>
              <label className="auth-label">Password</label>
              <input type="password" name="password" className="auth-input" />
            </div>
            <div className="auth-label">
              Already have an account?{" "}
              <Link to="/login" className="auth-link">
                Login
              </Link>
            </div>
            <button type="submit" className="auth-button">
              Submit
            </button>
          </Form>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export default SignUp;
