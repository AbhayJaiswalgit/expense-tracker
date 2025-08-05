import "./Auth.css";
import { Form } from "react-router-dom";
import { handleError, handleSuccess } from "../utils";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Header from "../components/Header";
import { BASE_URL } from "../config";

function Login() {
  const navigate = useNavigate();
  const handleLogin = async (event) => {
    event.preventDefault();
    const email = event.target[0].value;
    const password = event.target[1].value;
    const formdata = { email, password };

    console.log(email, password);

    const url = `${BASE_URL}/auth/login`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formdata),
      });

      const data = await res.json();
      if (data.success == true) {
        handleSuccess(data.message);
        localStorage.setItem("token", data.jwttoken);
        localStorage.setItem(
          "user",
          JSON.stringify({ name: data.name, email: data.email, id: data.id })
        );
        console.log(data);
        event.target[0].value = "";
        event.target[1].value = "";
        setTimeout(() => {
          navigate("/dashboard");
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
          <h1 className="auth-heading">Login</h1>
          <Form onSubmit={handleLogin}>
            <div>
              <label className="auth-label">Email address</label>
              <input type="email" name="email" className="auth-input" />
            </div>
            <div>
              <label className="auth-label">Password</label>
              <input type="password" name="password" className="auth-input" />
            </div>
            <div className="auth-label">
              Don’t have an account?{" "}
              <Link to="/signup" className="auth-link">
                Sign Up
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

export default Login;
