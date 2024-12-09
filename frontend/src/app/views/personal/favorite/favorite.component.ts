import {Component, OnInit} from '@angular/core';
import {FavoriteService} from "../../../shared/services/favorite.service";
import {FavoriteType} from "../../../../types/favorite.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {environment} from "../../../../environments/environment";
import {CartType} from "../../../../types/cart.type";
import {CartService} from "../../../shared/services/cart.service";

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.scss']
})
export class FavoriteComponent implements OnInit {
  products: FavoriteType[] = [];
  serverStaticPath = environment.serverStaticPath;
  count: number = 1;


  constructor(private favoriteService: FavoriteService,
              private cartService: CartService) { }

  ngOnInit(): void {
    this.favoriteService.getFavorites()
      .subscribe((data: FavoriteType[] | DefaultResponseType) => {
        if (data && (data as DefaultResponseType).error !== undefined) {
          const error = (data as DefaultResponseType).message;
          throw new Error(error);
        }
        this.products = data as FavoriteType[];

        this.cartService.getCart()
          .subscribe((cartData: CartType | DefaultResponseType) => {
            if (data && (cartData as DefaultResponseType).error !== undefined) {
              throw new Error((cartData as DefaultResponseType).message);
            }
            const cartDataResponse = cartData as CartType;
            if (cartDataResponse) {
              cartDataResponse.items.forEach(item => {
                const product = this.products.find(product => product.id === item.product.id);
                if (product) {
                  product.countInCart = item.quantity;
                }
              })
            }
          });
      });
  }

  removeFromFavorites(id: string) {
    this.favoriteService.removeFavorite(id)
      .subscribe((data: DefaultResponseType) => {
        if (data.error) {
          //..
          throw new Error(data.message);
        }
        this.products = this.products.filter(item => item.id !== id);
      });
  }

  addToCart(id: string) {
    this.cartService.updateCart(id, this.count)
      .subscribe((data: CartType | DefaultResponseType) => {
        if (data && (data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        let product = this.products.find(product => product.id === id);
        if (product) {
          product.countInCart = this.count;
        }
      });
  }

  removeFromCart(id: string) {
    this.cartService.updateCart(id, 0)
      .subscribe((data: CartType | DefaultResponseType) => {
        if (data && (data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        let product = this.products.find(product => product.id === id);
        if (product) {
          product.countInCart = 0;
          this.count = 1;
        }
      });
  }

  updateCount(id: string, value: number) {
    let product = this.products.find(product => product.id === id);
    if (product && value) {
      product.countInCart = value;
      if (product.countInCart) {
        this.cartService.updateCart(id, product!.countInCart)
          .subscribe((data: CartType | DefaultResponseType) => {
            if (data && (data as DefaultResponseType).error !== undefined) {
              throw new Error((data as DefaultResponseType).message);
            }
          });
      }
    }

  }
}
