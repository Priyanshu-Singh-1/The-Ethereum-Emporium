import React, { Component } from 'react';

class Navbar extends Component {

  render() {
    return (
      <nav className="navbar">
        <a
          target="_blank"
          rel="noopener noreferrer" id='navbar-heading'
        >
            BlockChain Market
        </a>
        <ul className="navbar-nav px-3">
          <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
            <small className="text-white"><span id="account">User Account: {this.props.account}</span></small>
          </li>
        </ul>
      </nav>
    );
  }
}

export default Navbar;