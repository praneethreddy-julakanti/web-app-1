import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ConfirmComponent } from 'src/app/dialogs/confirm/confirm.component';
import { IConfirmDialogData } from 'src/app/dialogs/models/confirm-dialog-data';
import { DialogService } from 'src/app/services/dialog.service';
import { MatDialogConfig } from '@angular/material/dialog';
import { ISnackBarData, SnackBarService } from 'src/app/services/snack-bar.service';
import {MatTooltipModule} from '@angular/material/tooltip';
import { QualificationService } from 'src/app/usit/services/qualification.service';
import { AddQualificationComponent } from './add-qualification/add-qualification.component';
import { Qualification } from 'src/app/usit/models/qualification';
import { Router } from '@angular/router';

@Component({
  selector: 'app-qualification-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatSortModule,
    MatPaginatorModule,
    CommonModule,
    MatTooltipModule
  ],
  templateUrl: './qualification-list.component.html',
  styleUrls: ['./qualification-list.component.scss']
})
export class QualificationListComponent implements OnInit, AfterViewInit {

  dataSource = new MatTableDataSource<Qualification>([]);
  displayedColumns: string[] = ['Name', 'Action'];
  private qualificationServ = inject(QualificationService);
  private dialogServ = inject(DialogService);
  private snackBarServ = inject(SnackBarService);
  private router = inject(Router);
  @ViewChild(MatSort) sort!: MatSort;
  qualificationList: Qualification[]= [];

  ngOnInit(): void {
    this.getAllQualifications();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  getAllQualifications() {
    return this.qualificationServ.getAllQualifications().subscribe(
      {
        next:(response: any) => {
          this.qualificationList = response.data;
          console.log("qualifications",this.qualificationList);
          this.dataSource.data = response.data;
        },
        error: (err)=> console.log(err)
      }
    );
  }

  addQualification() {
    const actionData = {
      title: 'Add Qualification',
      buttonCancelText: 'Cancel',
      buttonSubmitText: 'Submit',
      actionName: 'add-qualification'
    };
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "450px";
    dialogConfig.height = "auto";
    dialogConfig.disableClose = false;
    dialogConfig.panelClass = "add-qualification";
    dialogConfig.data = actionData;
    const dialogRef = this.dialogServ.openDialogWithComponent(AddQualificationComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => {
      if(dialogRef.componentInstance.allowAction){
        this.getAllQualifications();
      }
    })
  }

  editQualification(qualification: any) {
    const actionData = {
      title: 'Update Qualification',
      buttonCancelText: 'Cancel',
      buttonSubmitText: 'Submit',
      actionName: 'update-qualification',
      qualificationData: qualification
    };
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "400px";
    dialogConfig.height = "auto";
    dialogConfig.disableClose = false;
    dialogConfig.panelClass = "update-qualification";
    dialogConfig.data = actionData;
    const dialogRef = this.dialogServ.openDialogWithComponent(AddQualificationComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => {
      if(dialogRef.componentInstance.allowAction){
        this.getAllQualifications();
      }

    })
  }

  deleteQualification(qualification: any) {
    const dataToBeSentToDailog : Partial<IConfirmDialogData> = {
      title: 'Confirmation',
      message: 'Are you sure you want to delete?',
      confirmText: 'Yes',
      cancelText: 'No',
      actionData: qualification,
    }
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "400px";
    dialogConfig.height = "auto";
    dialogConfig.disableClose = false;
    dialogConfig.panelClass = "update-qualification";
    dialogConfig.data = dataToBeSentToDailog;
    const dialogRef = this.dialogServ.openDialogWithComponent(ConfirmComponent, dialogConfig);

    dialogRef.afterClosed().subscribe({
      next: () =>{
        if (dialogRef.componentInstance.allowAction) {
          const dataToBeSentToSnackBar: ISnackBarData = {
            message: '',
            duration: 1500,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            direction: 'above',
            panelClass: ['custom-snack-success'],
          };
          this.qualificationServ.deleteQualification(qualification.id).subscribe
            ({
              next: (resp: any) => {
                if (resp.status == 'success') {
                  dataToBeSentToSnackBar.message =
                    'Qualification Deleted successfully';
                  this.snackBarServ.openSnackBarFromComponent(
                    dataToBeSentToSnackBar
                  );
                  // call get api after deleting a qualification
                  this.getAllQualifications();
                } else {
                  dataToBeSentToSnackBar.message = resp.message;
                  this.snackBarServ.openSnackBarFromComponent(
                    dataToBeSentToSnackBar
                  );
                }

              }, error: (err) => console.log(`Qualification delete error: ${err}`)
            });
        }
      }
    })
  }

  onFilter(event: any) {
    this.dataSource.filter = event.target.value;
  }

  onSort(event: any) {
    const sortDirection = event.direction;
    const sortColumn = event.active;
  
    if (sortDirection !== null && sortDirection !== undefined) {
      this.dataSource.data = this.sortData(this.dataSource.data, sortColumn, sortDirection);
    } else {
      this.dataSource.data = [...this.qualificationList];
    }
  }
  
  private sortData(data: Qualification[], sortColumn: string, sortDirection: string): Qualification[] {
    return data.sort((a, b) => {
      switch (sortColumn) {
        case 'Name':
          const valueA = (a.name as string) || '';
          const valueB = (b.name as string) || '';
          if (sortDirection === 'asc') {
            return valueA.localeCompare(valueB);
          } else if (sortDirection === 'desc') {
            return valueB.localeCompare(valueA);
          } else {
            return valueA.localeCompare(valueB);
          }
  
        default:
          return 0;
      }
    });
  }

  getRowClass(row: any): string {
    const rowIndex = this.dataSource.filteredData.indexOf(row);
    return rowIndex % 2 === 0 ? 'even-row' : 'odd-row';
  }

  navigateToDashboard() {
    this.router.navigateByUrl('/usit/dashboard');
  }
}