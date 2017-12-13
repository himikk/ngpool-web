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

const Credits = () => (
  <div>
    <h2>Credits</h2>
  </div>
)

class PayoutAddress extends Component {
  constructor(props){
    super(props);
    this.state = {
			newVal: this.props.address
    }
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit(){
		console.log(this.state.newVal)
		console.log(this.props.currency)
  }
	render() {
		return (
			<tr>
				<th scope="row">{this.props.currency}</th>
				<td>
					<div className="input-group">
						<input type="text" value={this.props.address} className="form-control"
							value={this.state.newVal}
							onChange={(event) => this.setState({newVal: event.target.value})}/>
						<span className="input-group-btn">
							<button className="btn btn-info" type="button" onClick={() => this.handleSubmit()} >
								Set</button>
						</span>
					</div>
				</td>
			</tr>
		)
	}
}
class Profile extends Component {
  constructor(props){
    super(props);
    this.state = {
			user: {},
			payoutAddrs: {},
    };
    var instance = axios.create({
			baseURL: 'http://localhost:3000/v1/',
			timeout: 1000,
			headers: {'Authorization': 'Bearer ' + this.props.token}
		});
    instance.get("user/me")
			.then(res => {
				var resp = res.data.data
        this.setState({
					user: resp.user,
					payoutAddrs: resp["payout_addresses"]
				})
			}).catch(error => {
					this.setState({error: error.response.data.errors[0].title})
			});
  }
  render() {
		var addrs = this.state.payoutAddrs
		var rows = Object.keys(addrs).map((key) => (
			<PayoutAddress currency={key} address={addrs[key]} />))
    return (
      <div className="container">    
        <h2>Profile</h2>
        <table className="table table-striped">
					<tbody>
          <tr>
            <th scope="row">Username</th>
            <td>{ this.state.user.username }</td>
          </tr>
          <tr>
            <th scope="row">Email</th>
            <td>{ this.state.user.email }</td>
          </tr>
				</tbody>
        </table>
        <h2>Payout Addresses</h2>
        <table className="table table-striped">
          <thead>
            <tr>
              <th scope="col">Currency</th>
              <th scope="col">Payout Address</th>
            </tr>
          </thead>
          <tbody>
						{rows}
          </tbody>
        </table>
      </div>
    )}
}

const Blocks = () => (
  <div>
    <h2>Recent Blocks</h2>
  </div>
)

class Error extends Component {
    render () {
			return (<div className="alert alert-danger" role="alert">{this.props.msg}</div>)
		}
}

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
              { this.state.error.length > 0 && <Error msg={this.state.error} /> }

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
    this.state = {
      loggedIn:false,
      username:'',
      user_id:'',
      token:'',
    };
    var user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      this.state = {
        loggedIn: true,
        username: user.username,
        userId: user.userId,
        token: user.token,
      }
    }
    this.login = this.login.bind(this);
  }
  login(username, userId, token){
		this.setState({
			loggedIn: true,
			username: username,
			userId: userId,
			token: token,
    })
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
									<li><Link to="/">Blocks</Link></li>
									{ this.state.loggedIn && <li><Link to="/credits">Credits</Link></li>}
									{ this.state.loggedIn && <li><Link to="/profile">Profile</Link></li> }
									{ !this.state.loggedIn &&
                    <li><Link to="/login">Login</Link></li>
                  }
								</ul>
							</div>
						</div>
					</nav>
					<Route path="/credits" authed={this.state.loggedIn} render={props => (
						<Credits {...props} />
					)}/>
					<Route path="/profile" authed={this.state.loggedIn} render={props => (
						<Profile {...props} token={this.state.token}/>
					)}/>
					<Route path="/login" render={props => (
						<Login {...props} login={this.login} authed={this.state.loggedIn} />
					)}/>
					<Route exact path="/" component={Blocks}/>
				</div>
			</Router>
		)
	}
}
export default App
