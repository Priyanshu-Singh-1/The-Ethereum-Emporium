import React, { Component } from 'react';

class Main extends Component {

  render() {
    return (
      <div id="content">
        <h1 className='add-product-title'>Add the product details</h1>
        <form onSubmit={(event) => {
          event.preventDefault()
          const name = this.productName.value
          const price = window.web3.utils.toWei(this.productPrice.value.toString(), 'Ether')
          this.props.createProduct(name, price)
        }}>
          <div className="form-group mr-sm-2">
            <input
              id="productName"
              type="text"
              ref={(input) => { this.productName = input }}
              className="form-control"
              placeholder="Name of the product"
              required />
          </div>
          <div className="form-group mr-sm-2">
            <input
              id="productPrice"
              type="text"
              ref={(input) => { this.productPrice = input }}
              className="form-control"
              placeholder="Price of product"
              required />
          </div>
          <button type="submit" className="primary-btn btn1">Click to add product</button>
        </form>
        <p>&nbsp;</p>
        <h2 className='buy-product-title'>Choose Below Product to Buy</h2>
        <table className="table">
          <thead className='table-col-wrapper'>
            <tr>
              <th scope="col" className='table-col-heading'>S.No</th>
              <th scope="col" className='table-col-heading'>Name of product</th>
              <th scope="col" className='table-col-heading'>Price of product</th>
              <th scope="col" className='table-col-heading'>Owner of product</th>
              <th scope="col" className='table-col-heading'></th>
            </tr>
          </thead>
          <tbody id="productList">
            { this.props.products.map((product, key) => {
              return(
                //filling in the values in the table
                <tr key={key}>
                  <th scope="row">{product.id.toString()}</th>
                  <td>{product.name}</td>
                  <td>{window.web3.utils.fromWei(product.price.toString(), 'Ether')} Eth</td>
                  <td>{product.owner}</td>
                  <td>
                    { !product.purchased
                      ? <button className='buy-button btn2'
                          name={product.id}
                          value={product.price}
                          onClick={(event) => {
                            this.props.purchaseProduct(event.target.name, event.target.value)
                          }}
                        >
                          Buy
                        </button>
                      : null
                    }
                    </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

export default Main;