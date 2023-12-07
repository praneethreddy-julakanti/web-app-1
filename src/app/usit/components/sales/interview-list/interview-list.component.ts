import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogConfig } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  MatPaginator,
  MatPaginatorIntl,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DialogService } from 'src/app/services/dialog.service';
import {
  ISnackBarData,
  SnackBarService,
} from 'src/app/services/snack-bar.service';
import { Recruiter } from 'src/app/usit/models/recruiter';
import { StatusComponent } from 'src/app/dialogs/status/status.component';
import { ConfirmComponent } from 'src/app/dialogs/confirm/confirm.component';
import { IConfirmDialogData } from 'src/app/dialogs/models/confirm-dialog-data';
import { Subject, takeUntil } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PaginatorIntlService } from 'src/app/services/paginator-intl.service';
import { ActivatedRoute } from '@angular/router';
import { InterviewService } from 'src/app/usit/services/interview.service';
import { AddInterviewComponent } from './add-interview/add-interview.component';

@Component({
  selector: 'app-interview-list',
  standalone: true,
  imports: [MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatSortModule,
    MatPaginatorModule,
    CommonModule,
    MatTooltipModule],
  templateUrl: './interview-list.component.html',
  styleUrls: ['./interview-list.component.scss']
})
export class InterviewListComponent {

  dataSource = new MatTableDataSource<any>([]);
  dataTableColumns: string[] = [
    'SerialNum',
    'InterviewId',
    'ConsultantName',
    'DateAndToI',
    'Round',
    'Mode',
    'Vendor',
    'ImplementationPartner',
    'Client',
    'DateOfSubmission',
    'EmployeerName',
    'InterviewStatus',
    'Action',
  ];
  hasAcces!: any;
  // intentity = new SalesInterview();
  entity: any[] = [];
  submitted = false;
  // registerForm: any = FormGroup;
  showAlert = false;
  flag!: string;
  searchstring!: any;
  // pagination code
  page: number = 1;
  itemsPerPage = 50;
  AssignedPageNum !: any;
  totalItems: any;
  ser: number = 1;
  userid!: any;
  field = "empty";
  currentPageIndex = 0;
  private activatedRoute = inject(ActivatedRoute);
  private interviewServ = inject(InterviewService);
  private dialogServ = inject(DialogService);

  ngOnInit(): void {
    this.flag = this.activatedRoute.snapshot.params['flg'];
    if (this.flag == 'sales') {
      this.flag = "sales";
    }
    else {
      this.flag = "Recruiting";
    }
    this.hasAcces = localStorage.getItem('role');
    this.getAll();
  }


  getAll() {
    this.userid = localStorage.getItem('userid');
    this.interviewServ.getPaginationlist('sales', this.hasAcces, this.userid, 1, this.itemsPerPage, this.field).subscribe(
      (response: any) => {
        this.entity = response.data.content;
        this.dataSource.data = response.data.content;
        this.totalItems = response.data.totalElements;
        // for serial-num {}
        this.dataSource.data.map((x: any, i) => {
          x.serialNum = this.generateSerialNumber(i);
        });
      }
    )
  }

  addInterview() {
    const actionData = {
      title: 'Add Interview',
      interviewData: null,
      actionName: 'add-interview',
    };
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '65vw';
    dialogConfig.disableClose = false;
    dialogConfig.panelClass = 'add-interview';
    dialogConfig.data = actionData;


    const dialogRef = this.dialogServ.openDialogWithComponent(AddInterviewComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(() => {
      if(dialogRef.componentInstance.submitted){
        // this.getAllData(this.currentPageIndex + 1);
      }
    })
  }

  editInterview(interview: any) {
    const actionData = {
      title: 'Update Interview',
      interviewData: interview,
      actionName: 'edit-interview',
    };
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '65vw';
    dialogConfig.panelClass = 'edit-interview';
    dialogConfig.data = actionData;
    const dialogRef = this.dialogServ.openDialogWithComponent(AddInterviewComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(() => {
      if(dialogRef.componentInstance.submitted){
        // this.getAllData(this.currentPageIndex + 1);
      }
    })
  }

  onFilter(event: any) {

  }

  onSort(event: any) {

  }

  generateSerialNumber(index: number): number {
    const pagIdx = this.currentPageIndex === 0 ? 1 : this.currentPageIndex + 1;
    const serialNumber = (pagIdx - 1) * 50 + index + 1;
    return serialNumber;
  }

}