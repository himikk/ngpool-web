import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect
} from 'react-router-dom'
import "../node_modules/jquery/dist/jquery.js";
import "../node_modules/bootstrap-sass/assets/javascripts/bootstrap.js";
import "../node_modules/bootstrap-sass/assets/stylesheets/_bootstrap.scss";
import axios from 'axios';
import './App.scss';
import Profile from './Profile.js'

const Credits = () => (
  <div>
    <h2>Credits</h2>
  </div>
)


class Blocks extends Component {
  constructor(props){
    super(props);
    this.state = {
      blocks: []
    }
  }
  componentDidMount() {
    this.props.axios.get("blocks")
			.then(res => {
        this.setState({blocks: res.data.data.blocks})
			}).catch(error => {
        console.log(error)
			});
  }
  render() {
    var blocks = this.state.blocks
		var rows = Object.keys(blocks).map((key) => (
			<tr>
				<td>{blocks[key].currency}</td>
				<td>{blocks[key].hash}</td>
				<td>{blocks[key].powalgo}</td>
				<td>{blocks[key].mined_at}</td>
			</tr>))
    return (
      <div className="container">    
        <h2>Recent Blocks</h2>
        <table className="table table-striped">
          <thead>
            <tr>
              <th scope="col">Currency</th>
              <th scope="col">Hash</th>
              <th scope="col">Algo</th>
              <th scope="col">Time</th>
            </tr>
          </thead>
          <tbody>
						{rows}
          </tbody>
        </table>
      </div>
    )}
}

export class Alert extends Component {
    render () {
      var className = "alert "
      switch (this.props.type) {
      case "error":
        className += "alert-danger"
        break
      case "warn":
        className += "alert-warning"
        break
      case "success":
        className += "alert-success"
        break
      case "info":
        className += "alert-info"
        break
      }
			return (
        <div className={className} role="alert">
          <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span></button>
          {this.props.msg}
        </div>)
		}
}
const PrivateRoute = ({ component: Component, render: Render, ...rest }) => (
  <Route {...rest} render={props => (
    rest.authed ? (
      Render ? (
       Render()
      ) : (
        <Component {...props}/>
      )
    ) : (
      <Redirect to={{ pathname: '/login', state: { from: props.location } }}/>
    )
  )}/>
)
class Login extends Component {
  constructor(props){
    super(props);
    this.state = {
      username:'',
      password:'',
      error:'',
      redirectToReferrer: false
    };
    if (this.props.isAuthenticated) {
        this.setState({ redirectToReferrer: true })
    }
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit(event){
		this.setState({error: ''})
    axios.post(`http://localhost:3000/v1/login`, this.state)
			.then(res => {
				var resp = res.data.data
				this.props.login(resp.username, resp.user_id, resp.token);
        this.setState({ redirectToReferrer: true })
			}).catch(error => {
					this.setState({error: error.response.data.errors[0].title})
			});
  }
  render() {
    const { from } = this.props.location.state || { from: { pathname: '/' } }
    const { redirectToReferrer } = this.state
    
    if (redirectToReferrer) {
      return (
        <Redirect to={from}/>
      )
    }
    
    return (
      <div className="container">    
        <div id="loginbox" style={{marginTop: 50}} className="mainbox col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2">                    
          <div className="panel panel-info">
            <div className="panel-heading">
              <div className="panel-title">Sign In</div>
              <div style={{float: 'right', fontSize: '80%', position: 'relative', top: '-10px'}}><a href="#">Forgot password?</a></div>
            </div>     
            <div style={{paddingTop: 30}} className="panel-body">
              { this.state.error.length > 0 && <Alert type="error" msg={this.state.error} /> }

              <div style={{display: 'none'}} id="login-alert" className="alert alert-danger col-sm-12" />
              <form className="form-horizontal" role="form">
                <div style={{marginBottom: 25}} className="input-group">
                  <span className="input-group-addon"><i className="glyphicon glyphicon-user" /></span>
                  <input value={this.state.username} onChange={(event) => this.setState({username: event.target.value})}
 type="text" className="form-control" placeholder="username" />
                </div>
                <div style={{marginBottom: 25}} className="input-group">
                  <span className="input-group-addon"><i className="glyphicon glyphicon-lock" /></span>
                  <input type="password" value={this.state.password} onChange={(event) => this.setState({password: event.target.value})}
                    className="form-control" name="password" placeholder="password" />
                </div>
                <div className="input-group">
                  <div className="checkbox">
                    <label>
                      <input id="login-remember" type="checkbox" name="remember" defaultValue={1} /> Remember me
                    </label>
                  </div>
                </div>
                <div style={{marginTop: 10}} className="form-group">
                  {/* Button */}
                  <div className="col-sm-12 controls">
                    <a onClick={this.handleSubmit} className="btn btn-success">Login</a>
                  </div>
                </div>
                <div className="form-group">
                  <div className="col-md-12 control">
                    <div style={{borderTop: '1px solid#888', paddingTop: 15, fontSize: '85%'}}>
                      Don't have an account! &nbsp;
                      <a href="/signup">
                        Sign Up Here
                      </a>
                    </div>
                  </div>
                </div>    
              </form>     
            </div>                     
          </div>  
        </div>
      </div>
    )}
}

class App extends Component {
  constructor(props){
    super(props);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.state = {
      loggedIn:false,
      username:'',
      user_id:'',
      token:'',
      axios: axios.create({
        baseURL: 'http://localhost:3000/v1/',
        timeout: 1000,
      })
    };
  }
  componentWillMount() {
    var user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      this.login(user.username, user.userId, user.token)
    }
  }
  logout() {
    localStorage.removeItem('user')
		this.setState({
			loggedIn: false,
			username: '',
			userId: null,
			token: '',
    })
    console.log("logout")
    this.state.axios.defaults.headers.common['Authorization'] = ''
  }
  login(username, userId, token){
		this.setState({
			loggedIn: true,
			username: username,
			userId: userId,
			token: token,
    })
    this.state.axios.defaults.headers.common['Authorization'] = 'Bearer ' + token
    localStorage.setItem('user', JSON.stringify({
      username: username, userId: userId, token: token}));
  }
  render() {
    return (
			<Router>
				<div>
					<nav className="navbar navbar-default">
						<div className="container-fluid">
							<div className="navbar-header">
								<button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
									<span className="sr-only">Toggle navigation</span>
									<span className="icon-bar"></span>
									<span className="icon-bar"></span>
									<span className="icon-bar"></span>
								</button>
								<Link className="navbar-brand" to="/">NgPool</Link>
							</div>

							<div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
								<ul className="nav navbar-nav">
									<li><Link to="/blocks">Blocks</Link></li>
									{ this.state.loggedIn && <li><Link to="/credits">Credits</Link></li>}
								</ul>
                <ul className="nav navbar-nav navbar-right">
									{ !this.state.loggedIn &&
                    <li><Link to="/signup"><span className="glyphicon glyphicon-user"></span> Sign Up</Link></li>
                  }
									{ !this.state.loggedIn &&
                    <li><Link to="/login"><span className="glyphicon glyphicon-log-in"></span> Login</Link></li>
                  }
									{ this.state.loggedIn &&
                      <li><Link to="/profile"><span className="glyphicon glyphicon-user"></span> {this.state.username}</Link></li>
                  }
									{ this.state.loggedIn &&
                      <li><Link to="/logout"><span className="glyphicon glyphicon-log-out"></span> Logout</Link></li>
                  }
                </ul>
							</div>
						</div>
					</nav>
					<Route path="/credits" authed={this.state.loggedIn} render={props => (
						<Credits {...props} />
					)}/>
					<PrivateRoute path="/profile" authed={this.state.loggedIn} render={props => (
						<Profile {...props} axios={this.state.axios}/>
					)}/>
					<Route path="/login" render={props => (
						<Login {...props} login={this.login} authed={this.state.loggedIn} />
					)}/>
					<Route path="/logout" render={props => {
            this.logout()
            return (<Redirect to={{ pathname: '/login'}}/>)
          }}/>
					<Route exact path="/" render={props => (
						<Blocks {...props} axios={this.state.axios}/>
					)}/>
				</div>
			</Router>
		)
	}
}
export default App
