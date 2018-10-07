import { Component, OnInit } from '@angular/core';
import { NgForm, FormGroup, FormControl, Validators } from '@angular/forms';
import { ProductService } from '../product.service';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../product.model';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {

  constructor(public productService: ProductService, private route: ActivatedRoute) { }

  private mode = 'create';
  private productId: string;
  product: Product;
  form: FormGroup;
  isLoading = false;
  imagePreview;


  ngOnInit() {

    this.form = new FormGroup({
      name: new FormControl(null, { validators: [Validators.required]}),
      price: new FormControl(null, { validators: [Validators.required]}),
      quantity: new FormControl(null, { validators: [Validators.required]}),
    });
    this.route.paramMap
    .subscribe( paramMap  => {
      if (paramMap.has('productId')) {
        this.mode = 'edit';
        this.productId = paramMap.get('productId');
        this.isLoading = true;
        this.productService.getProduct(this.productId)
        .subscribe(productData => {
          this.isLoading = false;
          this.product = {
            id: productData._id,
            name: productData.name,
            price: productData.price,
            quantity: productData.quantity
          };
          this.form.setValue( {
            name: this.product.name,
            price: this.product.price,
            quantity: this.product.quantity
          });
        });
      } else {
        this.mode = 'create';
        this.productId = null;
      }
    });
  }

  onSaveProduct() {
    if (this.form.invalid) {
      return;
    }
    if (this.mode === 'create') {
      this.productService.addProduct(this.form.value.name, this.form.value.price, this.form.value.quantity);
    } else {
      this.productService.updateProduct(this.productId, this.form.value.name, this.form.value.price, this.form.value.quantity);
    }
    this.form.reset();
  }

}
