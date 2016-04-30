
import Footer from './FooterComponent';
import Navbar from './NavbarComponent';
import SearchComponent from './SearchComponent'
import React from 'react';

class AppComponent extends React.Component {
  render() {
    return (
      <div className="outer-container">
        <Navbar/>
        <SearchComponent/>
        <div className="app-changing" style={{margin: '0 20px;'}}>
          { this.props.children }
        </div>
        <Footer/>
      </div>
    );
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;
