import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Product {
  id: string; // 'string' yerine 'string | undefined'
  title: string;
  message: string;
  date: string;
  time: string;
  priority: string;
  category: string;
  completed: boolean; // Yeni alan
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private todoProductsSubject = new BehaviorSubject<Product[]>([]);
  private completedProductsSubject = new BehaviorSubject<Product[]>([]);

  todoProducts$ = this.todoProductsSubject.asObservable();
  completedProducts$ = this.completedProductsSubject.asObservable();

  addProduct(product: Product): void {
    product.id = Date.now().toString(); // Generate a unique ID
    const currentTodoProducts = this.todoProductsSubject.value;
    this.todoProductsSubject.next([...currentTodoProducts, product]);
  }

  moveToCompleted(product: Product): void {
    // Remove from todo
    const currentTodoProducts = this.todoProductsSubject.value;
    this.todoProductsSubject.next(
      currentTodoProducts.filter((p) => p.id !== product.id)
    );

    // Add to completed
    const currentCompletedProducts = this.completedProductsSubject.value;
    this.completedProductsSubject.next([...currentCompletedProducts, product]);
  }

  getTodoProducts(): Promise<Product[]> {
    return Promise.resolve(this.todoProductsSubject.value);
  }

  getCompletedProducts(): Promise<Product[]> {
    return Promise.resolve(this.completedProductsSubject.value);
  }
  deleteProduct(id: string): void {
    const currentTodoProducts = this.todoProductsSubject.value;
    const updatedTodoProducts = currentTodoProducts.filter((p) => p.id !== id);
    this.todoProductsSubject.next(updatedTodoProducts);
  }
}
