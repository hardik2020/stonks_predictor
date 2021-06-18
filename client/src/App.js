import logo from './logo.svg';
import './App.css';
import Index from './components/Index'
import SignUp from './components/SignUp'
import SignIn from './components/SignIn'
import Profile from './components/Profile'
import SignOut from './components/SignOut'
import Error from './components/Error'
import Welcome from './components/Welcome'
import ForgotUser from './components/ForgotUser'
import ForgotPass from './components/ForgotPass'
import {BrowserRouter as Router,Route,Switch} from 'react-router-dom'

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path = "/" component = {Index} />
          <Route exact path = "/signup" component = {SignUp} />
          <Route exact path = "/profile" component = {Profile} />
          <Route exact path = "/login" component = {SignIn} />
          <Route exact path = "/logout" component = {SignOut} />
          <Route path="/confirm/:confirmationCode" component={Welcome} />
          <Route exact path = "/forgotuser" component = {ForgotUser} />
          <Route exact path = "/forgotpass" component = {ForgotPass} />
          <Route path = "*" component = {Error} />
        </Switch>
          
      </Router>
    </div>
  );
}

export default App;
