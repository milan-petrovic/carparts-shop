import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProductService } from '../products/product.service';
import { Product } from '../products/product.model';
import { Order } from './order.model';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit, OnDestroy {

  orders = [];
  private orderSub: Subscription;
  private authSub: Subscription;
  private productSub: Subscription;
  isAuthenticated = false;
  authUserEmail: string;
  isLoading = false;



  constructor(private productService: ProductService, private authService: AuthService) { }

  ngOnInit() {
    this.isLoading = true;
    this.productService.getOrderProducts();
    this.orderSub = this.productService.getOrdersUpdateListener()
    .subscribe(ordersData => {
      this.isLoading = false;
      this.orders = ordersData;
    });
    this.isAuthenticated = this.authService.getIsAuth();
    this.authUserEmail = this.authService.getAuthUserEmail();
    this.authSub = this.authService.getAuthStatusListener()
    .subscribe(result => {
      if (result) {
        this.isAuthenticated = result;
        this.authUserEmail = this.authService.getAuthUserEmail();
      } else {
        this.isAuthenticated = false;
        this.authUserEmail = null;
      }
    });
  }

  onDecline(orderId: string) {
    this.isLoading = true;
    this.productService.declineOrder(orderId).subscribe(() => {
      this.productService.getOrderProducts();
    });
  }


  onAccept(orderId: string, orderCreator: string, product: Product) {
    // this.isLoading = true;
    product.quantity--;
    this.productService.updateProduct(product.id, product.name, product.price, product.quantity);
    this.productService.acceptOrder(orderId, orderCreator);
    this.onDecline(orderId);
  }

  ngOnDestroy() {
    this.orderSub.unsubscribe();
    this.authSub.unsubscribe();
  }



}
