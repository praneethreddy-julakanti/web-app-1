import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ConsultantService } from 'src/app/usit/services/consultant.service';
import { MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { NgxGpAutocompleteModule } from '@angular-magic/ngx-gp-autocomplete';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Loader } from '@googlemaps/js-api-loader';
import { NgxMatIntlTelInputComponent } from 'ngx-mat-intl-tel-input';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import {MatRadioChange, MatRadioModule} from '@angular/material/radio';
import { DialogService } from 'src/app/services/dialog.service';
import { AddCompanyComponent } from '../../../masters/companies-list/add-company/add-company.component';
import { AddVisaComponent } from '../../../masters/visa-list/add-visa/add-visa.component';
import { AddTechnologyTagComponent } from '../../../technology-tag-list/add-technology-tag/add-technology-tag.component';
import { AddQualificationComponent } from '../../../masters/qualification-list/add-qualification/add-qualification.component';
import { Consultantinfo } from 'src/app/usit/models/consultantinfo';

@Component({
  selector: 'app-add-consultant',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatCardModule,
    MatRadioModule,
    NgxMatIntlTelInputComponent,
    NgxGpAutocompleteModule,

  ],
  providers: [
    {
      provide: Loader,
      useValue: new Loader({
        apiKey: 'AIzaSyCT0z0QHwdq202psuLbL99GGd-QZMTm278',
        libraries: ['places'],
      }),
    },
  ],
  templateUrl: './add-consultant.component.html',
  styleUrls: ['./add-consultant.component.scss'],
})
export class AddconsultantComponent implements OnInit , OnDestroy{
  flag!: string;
  private baseUrl = 'http://69.216.19.140:8080/usit/';
  //private baseUrl = "http://localhost:8090/usit/";
  // private baseUrl: string = environment.API_BASE_URL;
  uploadedfiles: string[] = [];
  message: any;
  consultantForm: any = FormGroup;
  visadata: any = [];
  techdata: any = [];
  requirementdata: any = [];
  onFileSubmitted = false;
  flg = true;
  blur!: string;
  arraydt: any = [];
  consultdata: any = [];
  QualArr: any = [];
  other = false;
  autoskills!: string;
  latestrequirement!: any;
  role!: any;
  errflg!: any;
  company: any = [];
  // edit props
  entity = new Consultantinfo();
  cno !: string;
  filesArr!: any;
  selectOptionObj = {
    interviewAvailability: IV_AVAILABILITY,
    priority: PRIORITY,
    statusType: STATUS,
    radioOptions: RADIO_OPTIONS

  };
  // services
  private consultantServ = inject(ConsultantService);
  private snackBarServ = inject(SnackBarService);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private activatedRoute =  inject(ActivatedRoute);
  private dialogServ = inject(DialogService);
  data = inject(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<AddconsultantComponent>);
  // to clear subscriptions
  private destroyed$ = new Subject<void>();
  isRadSelected: any;
  constructor(
    private http: HttpClient,
  ) {}
  get frm() {
    return this.consultantForm.controls;
  }
  ngOnInit(): void {
    this.role = localStorage.getItem('role');
    // below apis are common for add / update consultant
    this.getvisa();
    this.gettech();
    this.getQualification();
    this.companies();
    this.getFlag(this.data.flag.toLocaleLowerCase());
    if(this.data.actionName === "edit-consultant"){
      this.initConsultantForm(new Consultantinfo());
      this.consultantServ.getConsultantById(this.data.consultantData.consultantid).subscribe(
        (response: any) => {
          this.entity = response.data;
          console.log(this.entity);

          this.cno = this.entity.consultantno;
          this.autoskills = response.data.skills;
          this.filesArr = response.data.fileupload;
          this.initConsultantForm(response.data);
        }
      );
    }else{
      this.initConsultantForm(new Consultantinfo());
    }


  }
  getFlag(type: string){
    if (type === 'sales') {
      this.flag = 'sales';
    } else if (type === 'presales') {
      this.flag = 'presales';
    } else if(type === 'h1transfer'){ // for edit
      this.flag = "H1 Transfer";
    } else {
      type = 'Recruiting';
    }
  }
  initConsultantForm(consultantData: Consultantinfo) {
    this.consultantForm = this.formBuilder.group({
      firstname: [consultantData ? consultantData.firstname : '', Validators.required], //['', [Validators.required, Validators.pattern("^[a-zA-Z][a-zA-Z]*$")]],
      lastname: [consultantData ? consultantData.lastname: '', Validators.required], ///^[+]\d{12}$   /^[+]\d{12}$   ^[0-9]*$
      consultantemail: [
        consultantData ? consultantData.consultantemail:'',
        [
          Validators.required,
          Validators.email,
          Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'),
        ],
      ],
      contactnumber: [consultantData ? consultantData.contactnumber:''],
      number: [consultantData ? consultantData.number:'', Validators.required],
      visa: this.formBuilder.group({
        vid: new FormControl(consultantData ? consultantData.visa.vid:'', [Validators.required]),
      }),
      position: [consultantData ? consultantData.position:'', Validators.required],
      priority: [consultantData ? consultantData.priority:''],
      linkedin: [consultantData ? consultantData.linkedin:''],
      // status:[this.consultantForm.status],
      status: [consultantData ? consultantData.status : '', Validators.required],
      projectavailabity: [
        consultantData ? consultantData.projectavailabity:'',
        [Validators.required, Validators.pattern('^[0-9]*$')],
      ],
      availabilityforinterviews: [consultantData ? consultantData.availabilityforinterviews:'', Validators.required],
      experience: [consultantData ? consultantData.experience:'', [Validators.required, Validators.pattern('^[0-9]*$')]],
      ratetype: [consultantData ? consultantData.ratetype:'', Validators.required],
      hourlyrate: [consultantData ? consultantData.hourlyrate: ''],
      currentlocation: [consultantData ? consultantData.currentlocation:'', Validators.required],
      relocation: [consultantData ? consultantData.relocation: ''],
      relocatOther: [consultantData ? consultantData.relocatOther:''],
      technology: this.formBuilder.group({
        id: new FormControl(consultantData ? consultantData.technology.id:'', [Validators.required]),
      }),

      company: this.formBuilder.group({
        companyid: new FormControl(consultantData ? consultantData.company.companyid:'', [Validators.required]),
      }),

      skills: [consultantData ? consultantData.skills:''],
      summary: [consultantData ? consultantData.summary: ''],
      consultantflg: this.data.flag.toLocaleLowerCase(),
      /* requirements: this.formBuilder.group({
         requirementid: id
       }),
       */
      qualification: this.formBuilder.group({
        id: new FormControl(consultantData ? consultantData.qualification:'', [Validators.required]),
      }),
      university: [consultantData ? consultantData.university:''],
      yop: [consultantData ? consultantData.yop: ''],
      companyname: [consultantData ? consultantData.companyname:''],
      emprefname: [consultantData ? consultantData.emprefname:''],
      refname: [consultantData ? consultantData.refname:''],
      emprefcont: new FormControl(consultantData ? consultantData.emprefcont:'', [
        Validators.minLength(10),
        Validators.pattern('^[0-9]*$'),
      ]),
      refcont: new FormControl(consultantData ? consultantData.refcont:'', [
        Validators.minLength(10),
        Validators.pattern('^[0-9]*$'),
      ]),
      emprefemail: new FormControl(consultantData ? consultantData.emprefemail:'', [
        Validators.email,
        Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
      ]),
      refemail: new FormControl(consultantData ? consultantData.refemail:'', [
        Validators.email,
        Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
      ]),
      addedby: this.formBuilder.group({
        userid: localStorage.getItem('userid'),
      }),
    });

    this.validateControls();
  }
  private validateControls() {
    if (this.flag == 'Recruiting' || this.flag == 'sales') {
      this.consultantForm.get('status').setValue('Active');
    }

    this.consultantForm.get('status').valueChanges.subscribe((res: any) => {
      const consultantemail = this.consultantForm.get('consultantemail');
      const contactnumber = this.consultantForm.get('number');
      const projectavailabity = this.consultantForm.get('projectavailabity');
      const availabilityforinterviews = this.consultantForm.get(
        'availabilityforinterviews'
      );
      const position = this.consultantForm.get('position');
      const experience = this.consultantForm.get('experience');
      const firstname = this.consultantForm.get('firstname');
      const lastname = this.consultantForm.get('lastname');
      const ratetype = this.consultantForm.get('ratetype');
      const currentlocation = this.consultantForm.get('currentlocation');
      if (res == 'Tagged') {
        this.consultantForm.get('technology.id').setValue('14');
        this.consultantForm.get('qualification.id').setValue('6');
        consultantemail.clearValidators();
        contactnumber.clearValidators();
        projectavailabity.clearValidators();
        availabilityforinterviews.clearValidators();
        position.clearValidators();
        experience.clearValidators();
        firstname.clearValidators();
        lastname.clearValidators();
        ratetype.clearValidators();
        currentlocation.clearValidators();
      } else {
        consultantemail.setValidators([
          Validators.required,
          Validators.email,
          Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'),
        ]);
        contactnumber.setValidators(Validators.required);
        projectavailabity.setValidators([
          Validators.required,
          Validators.pattern('^[0-9]*$'),
        ]);
        availabilityforinterviews.setValidators(Validators.required);
        position.setValidators(Validators.required);
        experience.setValidators([
          Validators.required,
          Validators.pattern('^[0-9]*$'),
        ]);
        firstname.setValidators(Validators.required);
        lastname.setValidators(Validators.required);
        ratetype.setValidators(Validators.required);
        currentlocation.setValidators(Validators.required);
      }
      consultantemail.updateValueAndValidity();
      contactnumber.updateValueAndValidity();
      projectavailabity.updateValueAndValidity();
      availabilityforinterviews.updateValueAndValidity();
      position.updateValueAndValidity();
      experience.updateValueAndValidity();
      firstname.updateValueAndValidity();
      lastname.updateValueAndValidity();
      ratetype.updateValueAndValidity();
      currentlocation.updateValueAndValidity();
    });
    this.consultantForm.get('relocation').valueChanges.subscribe((res: any) => {
      const relocatOther = this.consultantForm.get('relocatOther');
      if (res == 'Other') {
        this.other = true;
        relocatOther.setValidators(Validators.required);
      } else {
        this.other = false;
        relocatOther.clearValidators();
      }
      relocatOther.updateValueAndValidity();
    });

    const priority = this.consultantForm.get('priority');
    if (this.flag == 'sales') {
      priority.setValidators(Validators.required);
      this.consultantForm.get('requirements')?.patchValue(null);
    } else {
      priority.clearValidators();
    }
    priority.updateValueAndValidity();
  }

  techskills(event: any) {
    const newVal = event.target.value;
    this.consultantServ.getSkilldata(newVal).subscribe((response: any) => {
      this.autoskills = response.data;
    });
  }
  options: any = {
    componentRestrictions: { country: ['IN', 'US'] },
  };

  address = '';
  handleAddressChange(address: any) {
    this.address = address.formatted_address;
  }

  companies() {
    //getCompanies
    this.consultantServ.getCompanies().subscribe((response: any) => {
      this.company = response.data;
    });
  }

  backTo() {
    if (this.flag == 'sales') {
      this.router.navigate(['sales-consultants/sales']);
    } else if (this.flag == 'presales') {
      this.router.navigate(['pre-sales/presales']);
    } else {
      this.router.navigate(['recruiting-consultants/recruiting']);
    }
  }
  enableButton = '';
  onSubmit() {
    this.onFileSubmitted = true;

    // stop here if consultantForm is invalid
    if (this.consultantForm.invalid) {
      this.isRadSelected = true;
      this.displayFormErrors()
      return;
    }

    const lenkedIn = this.consultantForm.get('linkedin')?.value;
    if (lenkedIn != '' || lenkedIn != null) {
      var items = lenkedIn.split('in/');
      this.consultantForm.get('linkedin').setValue(items[1]);
    }
    const number = this.consultantForm.get('number').value;
    if (number != null) {
      this.consultantForm.get('contactnumber').setValue(number.internationalNumber);
    }
    // console.log(JSON.stringify(this.consultantForm.value, null, 2) + " =============== ");
    if (this.flg == true) {
      const saveReqObj = this.getSaveObjData()
      this.consultantServ.registerconsultant(saveReqObj).subscribe(
        (data: any) => {
          if (data.status == 'success') {
            //alertify.success("Consultant added successfully");
            this.onFileSubmit(data.data.consultantid);

          } else {
            this.enableButton = '';
            this.message = data.message;
            //alertify.error("Record Insertion failed");
          }
        },
        (error: any) => {
          this.enableButton = '';
        }
      );
    }
  }
  getSaveObjData(){
    if(this.data.actioName === 'edit-consultant'){
      return {...this.entity, ...this.consultantForm.value}
    }
    return this.consultantForm.value;
  }
  // supporting drop downs
  getrequirements() {
    this.consultantServ.getrequirements().subscribe((response: any) => {
      this.requirementdata = response.data;
    });
  }
  getvisa() {
    this.consultantServ.getvisa().subscribe((response: any) => {
      this.visadata = response.data;
    });
  }
  gettech() {
    this.consultantServ.gettech().subscribe((response: any) => {
      this.techdata = response.data;
    });
  }
  getQualification() {
    this.consultantServ.getQualification().subscribe((response: any) => {
      this.QualArr = response.data;
    });
  }

  emailDuplicate(event: any) {
    const email = event.target.value;
    this.consultantServ.duplicatecheckEmail(email).subscribe((response: any) => {
      if (response.status == 'success') {
        this.message = '';
      } else if (response.status == 'fail') {
        const cn = this.consultantForm.get('consultantemail');
        cn.setValue('');
        this.message = 'Record already available with given Mail address';
        //alertify.error("Record already available with given Mail address");
      } else {
        //alertify.error("Internal Server Error");
      }
    });
  }
  ctnumber!: any;
  changeFn(event: any) {
    const number = event.target.value;
    this.consultantServ
      .duplicatecheck(this.ctnumber.internationalNumber)
      .subscribe((response: any) => {
        if (response.status == 'success') {
          this.message = '';
        } else if (response.status == 'fail') {
          const cn = this.consultantForm.get('number');
          cn.setValue('');
          this.message = 'Record already available with given Contact Number';
          //alertify.error("Record already available with given Contact Number");
        } else {
          //alertify.error("Internal Server Error");
        }
      });
  }

  @ViewChild('multifiles')
  multifiles: any = ElementRef;
  sum = 0;
  onFileChange(event: any) {
    for (var i = 0; i < event.target.files.length; i++) {
      const file = event.target.files[i];
      var items = file.name.split('.');
      const str = items[0];
      if (str.length > 20) {
        //alertify.error("File name is toot large, please rename the file before upload, it should be 15 to 20 characters")
        this.multifiles.nativeElement.value = '';
      }
      const fileSizeInKB = Math.round(file.size / 1024);
      this.sum = this.sum + fileSizeInKB;
      if (fileSizeInKB < 4300) {
        this.uploadedfiles.push(event.target.files[i]);
      } else {
        this.multifiles.nativeElement.value = '';
        this.uploadedfiles = [];
        //alertify.error("Files size should not exceed 4 mb")
      }
      //this.uploadedfiles.push(event.target.files[i]);
    }
    // console.log(JSON.stringify(this.uploadedfiles) + "files")
  }

  @ViewChild('resume')
  resume: any = ElementRef;
  resumeupload!: any;
  uploaddoc(event: any) {
    this.resumeupload = event.target.files[0];
    const file = event.target.files[0];
    const fileSizeInKB = Math.round(file.size / 1024);
    // console.log(file + " " + JSON.stringify(this.resumeupload))
    if (fileSizeInKB > 4300) {
      this.flg = false;
      this.resume.nativeElement.value = '';
      this.message = 'Resume size should be less than 2 mb';
      //alertify.error("Resume size should be less than 2 mb");
      return;
    } else {
      this.message = '';
      this.flg = true;
    }
  }
  @ViewChild('h1b') h1b: any = ElementRef;
  h1bupload!: any;
  uploadH1B(event: any) {
    this.h1bupload = event.target.files[0];
    const file = event.target.files[0];
    const fileSizeInKB = Math.round(file.size / 1024);
    if (fileSizeInKB > 4300) {
      this.flg = false;
      this.h1b.nativeElement.value = '';
      this.message = 'H1B size should be less than 2 mb';
      //alertify.error("H1B size should be less than 2 mb");
      return;
    } else {
      this.message = '';
      this.flg = true;
    }
  }
  @ViewChild('dl')
  dl: any = ElementRef;
  dlupload!: any;
  uploadDL(event: any) {
    this.dlupload = event.target.files[0];
    const file = event.target.files[0];
    const fileSizeInKB = Math.round(file.size / 1024);
    // var items = file.name.split(".");
    // const str = items[0];
    // if (str.length > 16) {
    //   //alertify.error("File name is toot large, please rename the file before upload, it should be 10 to 15 characters")
    //   this.dl.nativeElement.value = "";
    // }

    ///console.log(file + " " + JSON.stringify(this.dlupload))
    if (fileSizeInKB > 4300) {
      //2200
      this.flg = false;
      this.dl.nativeElement.value = '';
      this.message = 'DL size should be less than 2 mb';
      //alertify.error("DL size should be less than 2 mb");
      return;
    } else {
      this.message = '';
      this.flg = true;
    }
  }
  onFileSubmit(id: number) {
    const formData = new FormData();
    for (var i = 0; i < this.uploadedfiles.length; i++) {
      formData.append('files', this.uploadedfiles[i]);
    }

    if (this.resumeupload != null) {
      formData.append('resume', this.resumeupload, this.resumeupload.name);
      // formData.append("files",this.resumeupload,this.resumeupload.name);
    }

    if (this.h1bupload != null) {
      formData.append('h1b', this.h1bupload, this.h1bupload.name);
      // formData.append("files",this.resumeupload,this.resumeupload.name);
    }

    if (this.dlupload != null) {
      formData.append('dl', this.dlupload, this.dlupload.name);
      // formData.append("files",this.resumeupload,this.resumeupload.name);
    }

    //upload
    let url = this.baseUrl + 'consultant/uploadMultiple/' + id;
    this.http
      .post(url, formData, { observe: 'response' })
      .subscribe((response: any) => {
        if (response.status === 200) {
        } else {
        }
      });
  }
    /** to display form validation messages */
    displayFormErrors() {
      Object.keys(this.consultantForm.controls).forEach((field) => {
        const control = this.consultantForm.get(field);
        if (control && control.invalid) {
          control.markAsTouched();
        }
      });
    }
  onAddCompany(){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '65vw';

    this.dialogServ.openDialogWithComponent(AddCompanyComponent, dialogConfig)
  }
  onAddVisa(){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '65vw';

    this.dialogServ.openDialogWithComponent(AddVisaComponent, dialogConfig)
  }
  onAddTechnology(){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '65vw';

    this.dialogServ.openDialogWithComponent(AddTechnologyTagComponent, dialogConfig)
  }
  onAddQualification(){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '65vw';

    this.dialogServ.openDialogWithComponent(AddQualificationComponent, dialogConfig)
  }
  onRadioChange(event: MatRadioChange){
    this.isRadSelected =  event.value
  }
   /**
   * Cancel
   */
   onCancel() {
    this.dialogRef.close();
  }

  /** clean up subscriptions */
  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
export const IV_AVAILABILITY = [
  'Availabity for the interviews *',
  'Anytime',
  'Morning session',
  'afternoon session'
]
export const PRIORITY = [
  { code: 'P1', desc: 'P1 - Our h1 w2 consultant not on the job'},
  { code: 'P2', desc: 'P2 - our h1 consultant whose project is ending in 4 weeks'},
  { code: 'P3', desc: 'P3 - new visa transfer consultant looking for a job'},
  { code: 'P4', desc: 'P4 - our h1 consultant on a project looking for a high rate'},
  { code: 'P5', desc: 'P5 - OPT /CPT visa looking for a job'},
  { code: 'P6', desc: 'P6 - independent visa holder looking for a job'},
  { code: 'P7', desc: 'P7 - independent visa holder project is ending in 4 weeks'},
  { code: 'P8', desc: 'P8 - independent visa holder project looking for a high rate'},
  { code: 'P9', desc: 'P9 - 3rd party consultant'},
  { code: 'P10', desc: 'P10'},

]

export const STATUS = [
  'Initiated',
  'Completed',
  'Verified',
  'Tagged',
  'Active',
  'InActive',
  'Initiated'
]

export const RADIO_OPTIONS = {
  rate: [
    {value: 'C2C', id: 1 , selected: true},
    {value: '1099', id: 2},
    {value: 'W2', id: 3},
    {value: 'Full Time', id: 4},
    {value: 'C2H', id: 5}
  ],
  relocation: [
    {value: 'Open', id: 1},
    {value: 'No', id: 2},
    {value: 'Other', id: 3},
  ]
}