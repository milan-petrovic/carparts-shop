import { Injectable } from '@angular/core';
import { Product } from './product.model';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Order } from '../order-list/order.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  products: Product[] = [];
  orders = [];
  orderProduct: Product;
  private productsUpdated = new Subject<{products: Product[], maxProducts: number}>();
  private ordersUpdated = new Subject<any[]>();

  constructor(private http: HttpClient, private router: Router) {}

  navigateToProductList() {
    this.router.navigate(['/product-list']);
  }

  getProductUpdateListener() {
    return this.productsUpdated.asObservable();
  }

  getOrdersUpdateListener() {
    return this.ordersUpdated.asObservable();
  }

  addProduct(name: string, price: number, quantity: number) {
    const product: Product = {
      id: null,
      name: name,
      price: price,
      quantity: quantity
    };
    this.http
      .post<{ message: string; product: Product }>(
        'http://localhost:3000/api/products',
        product
      )
      .subscribe(response => {
        this.navigateToProductList();
      });
  }
  getProducts(productsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${productsPerPage}&page=${currentPage}`;
    this.http
      .get<{ products: any, maxProducts: number }>(
        'http://localhost:3000/api/products' + queryParams
      )
      .pipe(
        map(productData => {
          return {
            products: productData.products.map(product => {
              return {
                name: product.name,
                price: product.price,
                quantity: product.quantity,
                id: product._id
              };
            }),
            maxProducts: productData.maxProducts
          };
        })
      )
      .subscribe(transformedProductData => {
        this.products = transformedProductData.products;

        this.productsUpdated.next({products: [...this.products], maxProducts: transformedProductData.maxProducts});
      });
  }


  getProduct(id: string) {
    return this.http.get<{
      _id: string;
      name: string;
      price: number;
      quantity: number;
    }>('http://localhost:3000/api/products/' + id);
  }

  deleteProduct(productId: string) {
    return this.http
      .delete('http://localhost:3000/api/products/' + productId);

  }

  updateProduct(id: string, name: string, price: number, quantity: number) {
    const product = {
      id: id,
      name: name,
      price: price,
      quantity: quantity
    };
    console.log(product.quantity);
    this.http
      .put('http://localhost:3000/api/products/' + id, product)
      .subscribe(response => {
        this.navigateToProductList();
      });
  }

  // orders
  makeOrder(productOrder: Product) {
    if (productOrder.quantity === 0) {
      return;
    }
    const order = {
      id: null,
      product: productOrder,
    };
    this.http.post<{message: String, order: Order}> ('http://localhost:3000/api/orders', order)
    .subscribe(response => {
      console.log(response.message);
    });
  }

  getOrderProducts() {
    this.http.get<{ orders: any}>('http://localhost:3000/api/orders')
    .subscribe(response => {
      this.orders = response.orders;
      this.ordersUpdated.next([...this.orders]);
    });
  }
  acceptOrder(orderId: string, customerEmail: string) {
    const orderMailer = {
      orderId: orderId,
      email: customerEmail
    };

    this.http.post('http://localhost:3000/api/orders/send', orderMailer)
    .subscribe(response => {
      console.log(response);
    });
  }
  declineOrder(orderdId: string) {
    return this.http.delete('http://localhost:3000/api/orders/' + orderdId);
  }
}

