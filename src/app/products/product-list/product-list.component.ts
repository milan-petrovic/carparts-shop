import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Product } from '../product.model';
import { ProductService } from '../product.service';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit, OnDestroy {

  constructor(public productService: ProductService, public authService: AuthService) { }

  private productSub: Subscription;
  private authSub: Subscription;
  isAuthenticated = false;
  authUserEmail: string;
  customer: string;
  products: Product[] = [];
  isLoading = false;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];
  totalLength = 0;
  productsPerPage = 5;


  ngOnInit() {
    this.isLoading = true;
    this.productService.getProducts(this.productsPerPage, this.currentPage);
    this.productSub = this.productService.getProductUpdateListener()
    .subscribe((productData: {products: Product[], maxProducts: number}) => {
      this.isLoading = false;
      this.totalLength = productData.maxProducts;
      this.products = productData.products;
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

  ngOnDestroy() {
    this.productSub.unsubscribe();
    this.authSub.unsubscribe();
  }

  onDelete(productId: string) {
    this.isLoading = true;
    this.productService.deleteProduct(productId).subscribe(() => {
      this.productService.getProducts(this.productsPerPage, this.currentPage);
    });
  }

  onMakeOrder(product: Product) {
    this.productService.makeOrder(product);
  }
  onPageChanged(pageData: PageEvent) {
    this.currentPage = pageData.pageIndex + 1;
    this.productsPerPage = pageData.pageSize;
    this.productService.getProducts(this.productsPerPage, this.currentPage);
  }
}
