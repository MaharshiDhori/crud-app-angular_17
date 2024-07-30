import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent implements OnInit {
  @ViewChild('myModal') model: ElementRef | undefined;
  requestObj: Request = new Request();
  requestList: Request[] = [];
  filteredRequestList: Request[] = [];
  requestToDelete: Request | null = null;
  filters: any = {
    requestId: '',
    user: '',
    designation: '',
    requestType: '',
    dateRange: ''
  };
  designation_data = [{
    name: 'Contractor'
  },{
    name: 'Permanent'
  }];

  request_type_data = [{
    name: 'Initial'
  },{
    name: 'Modification'
  }];

  status_data = ['Pending','Accepted','Rejected'];
  openModelForViewing: boolean = false;

  sortDirection: { [key: string]: 'asc' | 'desc' } = {};

  ngOnInit(): void {
    const localData = localStorage.getItem("angular17crud");
    if (localData !== null) {
      this.requestList = JSON.parse(localData);
      this.filteredRequestList = [...this.requestList]; // Initialize filtered list
    }
    this.loadRequestsFromLocalStorage();
    this.applyFilters();
  }
  loadRequestsFromLocalStorage() {
    const storedRequests = localStorage.getItem('requestList');
    if (storedRequests) {
      this.requestList = JSON.parse(storedRequests);
    }
  }

  applyFilters() {
    this.filteredRequestList = this.requestList.filter(item => {
      return (!this.filters.requestId || item.id.toString().includes(this.filters.requestId)) &&
             (!this.filters.user || item.user.toLowerCase().includes(this.filters.user.toLowerCase())) &&
             (!this.filters.designation || item.designation === this.filters.designation) &&
             (!this.filters.requestType || item.requestType === this.filters.requestType) &&
             (!this.filters.dateRange || new Date(item.submittedDate).toLocaleDateString() === new Date(this.filters.dateRange).toLocaleDateString());
    });
  }

  isValidRequest(): boolean {
    // Check if any of the required fields are empty
    return (
      this.requestObj &&
      !!this.requestObj.user &&
      !!this.requestObj.designation &&
      !!this.requestObj.requestType &&
      !!this.requestObj.submittedDate &&
      !!this.requestObj.systemName &&
      !!this.requestObj.systemLocation &&
      !!this.requestObj.status
    );
  }
  
  

  sort(column: keyof Request): void {
    // Toggle the sort direction for the clicked column
    this.sortDirection[column] = this.sortDirection[column] === 'asc' ? 'desc' : 'asc';
  
    // Implement sorting logic based on the column and sort direction
    this.filteredRequestList.sort((a, b) => {
      if (this.sortDirection[column] === 'asc') {
        if (a[column] < b[column]) return -1;
        if (a[column] > b[column]) return 1;
      } else {
        if (a[column] > b[column]) return -1;
        if (a[column] < b[column]) return 1;
      }
      return 0;
    });
  }
  

  isViewMode: boolean = false;

  onView(request: Request): void {
    // Set the request object to be viewed
    this.requestObj = { ...request };
  
    // Open the modal
    this.openModel();
  
    // Disable input fields to prevent editing
    const inputs = document.querySelectorAll('.modal-body input, .modal-body select');
    inputs.forEach((input: Element) => {
      if (input instanceof HTMLInputElement || input instanceof HTMLSelectElement) {
        input.disabled = true;
      }
    });
  
    // Set view mode to true
    this.isViewMode = true;
  }
  

  
  openModel() {
    // document.getElementById('myModal');
    const model = document.getElementById("myModal");
    if (model !== null) {
      model.style.display = 'block';
    }
  }

  closeModel() {
    this.requestObj = new Request();
    if (this.model !== undefined && this.model.nativeElement !== null) {
      this.model.nativeElement.style.display = 'none';
    }
    this.isViewMode = false;
  }

  // onDelete(item: Request) {
  //   const isDelete = confirm("Are you sure you want to delete this request?");
  //   if (isDelete) {
  //     const index = this.requestList.findIndex(r => r.id === item.id);
  //     if (index !== -1) {
  //       this.requestList.splice(index, 1);
  //       this.filteredRequestList = [...this.requestList]; // Update filtered list
  //       localStorage.setItem('angular17crud', JSON.stringify(this.requestList));
  //     }
  //   }
  // }

    // Function to open the delete modal
    openDeleteModal(request: Request) {
      this.requestToDelete = request;
      document.getElementById('deleteModal')?.classList.add('show');
    }
  
    // Function to close the delete modal
    closeDeleteModal() {
      this.requestToDelete = null;
      document.getElementById('deleteModal')?.classList.remove('show');
    }
  
    // Function to confirm deletion
    confirmDelete() {
      if (this.requestToDelete) {
        const index = this.requestList.findIndex(r => r.id === this.requestToDelete!.id);
        if (index !== -1) {
          this.requestList.splice(index, 1);
          this.filteredRequestList = [...this.requestList]; // Update filtered list
          localStorage.setItem('angular17crud', JSON.stringify(this.requestList));
        }
      }
      this.closeDeleteModal();
    }
  
    // Original delete function modified to use the modal
    onDelete(item: Request) {
      this.openDeleteModal(item);
    }

  onEdit(item: Request) {
    // Copy object to avoid changing original on edit
    this.requestObj = { ...item };
    
    // Open the modal
    this.openModel();
  
    // Enable input fields for editing
    const inputs = document.querySelectorAll('.modal-body input, .modal-body select');
    inputs.forEach((input: Element) => {
      if (input instanceof HTMLInputElement || input instanceof HTMLSelectElement) {
        input.disabled = false;
      }
    });
  
    // Set view mode to false
    this.isViewMode = false;
  }
  

  updateRequest() {
    const index = this.requestList.findIndex(r => r.id === this.requestObj.id);
    if (index !== -1) {
      this.requestList[index] = { ...this.requestObj }; // Update existing object
      this.filteredRequestList = [...this.requestList]; // Update filtered list
      localStorage.setItem('angular17crud', JSON.stringify(this.requestList));
      this.closeModel();
    }
  }

  saveRequest() {
    const requestId = this.requestList.length + 1;
    this.requestObj.id = requestId;
    this.requestList.push({ ...this.requestObj }); // Add new object to list
    this.filteredRequestList = [...this.requestList]; // Update filtered list
    localStorage.setItem('angular17crud', JSON.stringify(this.requestList));
    this.closeModel();
  }
}

export class Request {
  id: number = 0;
  user: string = '';
  designation: number = 0;
  requestType: number = 0;
  submittedDate: string = '';
  systemName: string = '';
  systemLocation: string = '';
  status: string = '';

  constructor() {}
}
