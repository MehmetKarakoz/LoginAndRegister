import { Component, OnInit, signal, inject } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ProductService, Product } from '../../service/productservice';
import { CommonModule } from '@angular/common';
import { TabMenuModule } from 'primeng/tabmenu';
import { DragDropModule } from 'primeng/dragdrop';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { BadgeModule } from 'primeng/badge';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TimePipePipe } from '../../pipe/time-pipe.pipe';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    TabMenuModule,
    DragDropModule,
    TagModule,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    CalendarModule,
    DropdownModule,
    FormsModule,
    ReactiveFormsModule,
    BadgeModule,
    TimePipePipe
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit {

  deleteConfirmationVisible = signal(false);
  selectedProductId = signal<string | null>(null);

  deleteConfirmationVisibles = signal(false);
  selectedTempListeId = signal<string | null>(null);

  updateDialogVisible = signal(false);
  selectedProductForUpdate = signal<Product | null>(null);

  
  
  todoItems: any;
  closeDialog() {
    throw new Error('Method not implemented.');
  }
  productService = inject(ProductService);
  fb = inject(FormBuilder);

  updateForm = this.fb.group({
    title: ['', Validators.required],
    message: ['', Validators.required],
    date: [null as Date | null, Validators.required],
    time: [null as Date | null, Validators.required ],
    priority: ['', Validators.required],
    category: ['', Validators.required],
  });

  productDialogVisible = signal(false);
  selectedProduct = signal<Product | null>(null);

  items: MenuItem[] | undefined;
  visible = signal(false);

  todoDialogVisible = signal(false);
  todoCount = signal(0);

  todoProducts = signal<Product[]>([]);
  completedProducts = signal<Product[]>([]);
  tempList = signal<Readonly<Product[]>>([]);
  draggedProduct = signal<Product | null>(null); // Sürüklenen ürün

  today: Date | undefined;

  priority = signal<{ name: string }[]>([
    { name: 'DÜŞÜK' },
    { name: 'ORTA' },
    { name: 'YÜKSEK' },
  ]);

  category = signal<{ name: string }[]>([
    { name: 'İş' },
    { name: 'Sağlık' },
    { name: 'Kişisel' },
    { name: 'Alışveriş' },
  ]);

  registerAddForm = this.fb.group({
    title: ['', Validators.required],
    message: ['', Validators.required],
    date: [null, Validators.required],
    time: [null, Validators.required],
    priority: ['', Validators.required],
    category: ['', Validators.required],
  });

  constructor() { }

  updateTodoCount() {
    this.todoCount.set(this.tempList().length);
  }

  ngOnInit() {
    this.today = new Date();
    const storedProducts = JSON.parse(localStorage.getItem('products') || '[]');

    // Eğer ürünler varsa, tamamlanan ve tamamlanmamış olanları ayıralım
    const todoProducts = storedProducts.filter(
      (product: Product) => !product.completed
    );
    const completedProducts = storedProducts.filter(
      (product: Product) => product.completed
    );

    this.todoProducts.set(todoProducts);
    this.completedProducts.set(completedProducts);

    this.tempList.set([...this.todoProducts()]);

    // Menü öğeleri
    this.items = [
      {
        label: 'Hatırlatıcı Ekle',
        icon: 'pi pi-clipboard',
        command: () => this.reminderAdd(),
      },
    ];
    this.updateTodoCount();
  }

  // Drag işlemi başlatıldığında
  dragStart(product: Product) {
    this.draggedProduct.set(product);
  }

  // Ürün bırakıldığında
  drop() {
    const dragged = this.draggedProduct();

    if (dragged && dragged.id) {
      const updatedProduct: Product = {
        ...dragged,
        completed: true,
      };

      // `todoProducts` listesinden sürüklenen ürünü kaldır
      const updatedTodoProducts = this.todoProducts().filter(
        (product) => product.id !== dragged.id
      );

      const updateTempList = this.tempList().filter((Product) => Product.id !== dragged.id);


      this.todoProducts.set(updatedTodoProducts);
      this.tempList.set(updateTempList)

      // Tamamlanan ürünleri yönetmek için bir dizi oluşturun
      const completedProducts = this.completedProducts() || [];
      completedProducts.push(updatedProduct);
      this.completedProducts.set(completedProducts);

      // LocalStorage'daki güncellemeleri yapın
      const storedProducts = JSON.parse(
        localStorage.getItem('products') || '[]'
      );
      const updatedStoredProducts = storedProducts.map((product: Product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      );
      localStorage.setItem('products', JSON.stringify(updatedStoredProducts));
      this.updateTodoCount()
      // Sürüklenen ürünü temizle
      this.draggedProduct.set(null);

    }
  }

  // Drag işlemi bittiğinde
  dragEnd() {
    this.draggedProduct.set(null);
  }

  // Öncelik seviyesi rengine göre class belirleme
  getSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' {
    switch (status) {
      case 'DÜŞÜK':
        return 'info';
      case 'ORTA':
        return 'warning';
      case 'YÜKSEK':
        return 'danger';
      default:
        return 'info';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'DÜŞÜK':
        return 'bg-blue-100';
      case 'ORTA':
        return 'bg-orange-100';
      case 'YÜKSEK':
        return 'bg-red-100';
      default:
        return '';
    }
  }

  // Yeni hatırlatıcı ekleme formunu gösterme
  reminderAdd() {
    this.visible.set(true);
    this.registerAddForm.reset();
  }

  // Form gönderimi
  onSubmit() {
    if (this.registerAddForm.valid) {
      const formValue = this.registerAddForm.value;
      const newProduct: Product = {
        id: Date.now().toString(), // Benzersiz ID (timestamp)
        title: formValue.title || '',
        message: formValue.message || '',
        date: formValue.date
          ? new Date(formValue.date).toLocaleDateString()
          : '',
        time: formValue.time ? String(formValue.time) : '',
        priority: formValue.priority || '',
        category: formValue.category || '',
        completed: false, // Ürün tamamlanmamış olarak eklendi
      };

      const existingProducts = JSON.parse(
        localStorage.getItem('products') || '[]'
      );
      existingProducts.push(newProduct);
      localStorage.setItem('products', JSON.stringify(existingProducts));

      // `todoProducts`'a yeni ürünü ekleme
      this.todoProducts.set([...this.todoProducts(), newProduct]);
      this.tempList.set([...this.tempList(), newProduct]);
      this.visible.set(false);
      this.registerAddForm.reset();
    } else {
      Object.values(this.registerAddForm.controls).forEach((control) => {
        control.markAsTouched();
      });
    }
    this.updateTodoCount();
  }

  confirmDelete(productId: string) {
    this.selectedProductId.set(productId);
    this.deleteConfirmationVisible.set(true);
  }
  confirmDeletes(TempListeId: string) {
    this.selectedTempListeId.set(TempListeId);
    this.deleteConfirmationVisibles.set(true);
  }
  
  deleteProducte() {
    if (this.selectedTempListeId()) {
      this.deleteProducts(this.selectedTempListeId()!);
      this.deleteConfirmationVisible.set(false);
      this.selectedTempListeId.set(null);
    }
  }
  
  deleteProductes() {
    if (this.selectedProductId()) {
      this.deleteProduct(this.selectedProductId()!);
      this.deleteConfirmationVisible.set(false);
      this.selectedProductId.set(null);
    }
  }

  deleteProducts(TempListeId: string) {
    // Mevcut silme işlemi kodu
    const updateTempList = this.tempList().filter(
      (TempListe) => TempListe.id !== TempListeId
    );
    this.tempList.set(updateTempList);
    this.updateTodoCount();
    if (this.todoProducts().length === 0) {
      this.todoDialogVisible.set(false);
    }
  }


  // Ürün silme
  deleteProduct(productId: string) {
    // `todoProducts` listesinden ürünü sil
    const updatedTodoProducts = this.todoProducts().filter(
      (product) => product.id !== productId
    );
    this.todoProducts.set(updatedTodoProducts);

    // `completedProducts` listesinden ürünü sil
    const updatedCompletedProducts = this.completedProducts().filter(
      (product) => product.id !== productId
    );

    const updateTempList = this.tempList().filter(
      (product) => product.id !== productId
    );


    this.tempList.set(updateTempList);
    this.completedProducts.set(updatedCompletedProducts);

    // LocalStorage'dan sil
    const storedProducts = JSON.parse(localStorage.getItem('products') || '[]');
    const updatedStoredProducts = storedProducts.filter(
      (product: Product) => product.id !== productId
    );
    localStorage.setItem('products', JSON.stringify(updatedStoredProducts));

    this.updateTodoCount();

    if (this.todoProducts().length === 0) {
      this.todoDialogVisible.set(false);
    }
  }

  showUpdateDialog(product: Product) {
    this.selectedProductForUpdate.set(product);
    this.updateForm.patchValue({
      title: product.title,
      message: product.message,
      date: new Date(product.date),
      time: new Date(`1970-01-01T${product.time}`),
      priority: product.priority,
      category: product.category,
    });
    this.updateDialogVisible.set(true);
  }


  onUpdate() {
  //   if (this.updateForm.valid && this.selectedProductForUpdate()) {
  //     const updatedProduct: Product = {
  //       ...this.selectedProductForUpdate()!,
  //       ...this.updateForm.value,
  //       date: this.updateForm.value.date ? new Date(this.updateForm.value.date).toLocaleDateString() : '',
  //       time: this.updateForm.value.time ? String(this.updateForm.value.time) : '',
  //     };

  //     // Ürünü güncelleyin (todoProducts ve completedProducts listelerinde)
  //     this.updateProductInLists(updatedProduct);

  //     // LocalStorage'ı güncelleyin
  //     this.updateLocalStorage(updatedProduct);

  //     this.updateDialogVisible.set(false);
  //     this.selectedProductForUpdate.set(null);
  //   }
  // }
  if (this.updateForm.valid && this.selectedProductForUpdate()) {
    const formValue = this.updateForm.value;
    const updatedProduct: Product = {
      ...this.selectedProductForUpdate()!,
      title: formValue.title || '',
      message: formValue.message || '',
      date: formValue.date ? new Date(formValue.date).toLocaleDateString() : '',
      time: formValue.time ? new Date(formValue.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      priority: formValue.priority || '',
      category: formValue.category || '',
    };

    this.updateProductInLists(updatedProduct);
    this.updateLocalStorage(updatedProduct);

    this.updateDialogVisible.set(false);
    this.selectedProductForUpdate.set(null);
  }
}

updateProductInLists(updatedProduct: Product) {
  const updateList = (list: readonly Product[]): Product[] =>
    list.map(p => p.id === updatedProduct.id ? updatedProduct : p);

  this.todoProducts.update(products => updateList(products));
  this.completedProducts.update(products => updateList(products));
  this.tempList.update(products => updateList(products));
} 

updateLocalStorage(updatedProduct: Product) {
  const storedProducts = JSON.parse(localStorage.getItem('products') || '[]');
  const updatedStoredProducts = storedProducts.map((p: Product) =>
    p.id === updatedProduct.id ? updatedProduct : p
  );
  localStorage.setItem('products', JSON.stringify(updatedStoredProducts));
}
  // Ürünü görüntüleme
  viewProduct(product: Product) {
    this.selectedProduct.set(product);
    this.productDialogVisible.set(true);
  }

  // Benzersiz ID oluşturma fonksiyonu
  generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
  }
  showTodoDialog() {
    this.todoDialogVisible.set(true);
  }
}
