import { LightningElement,wire,track} from 'lwc';
import getAssignmentRecords from '@salesforce/apex/assignmentListController.getAssignmentRecords';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

const actions = [    
    { label: 'Edit', name: 'Edit' }
];

export default class AssignmentList extends LightningElement {
       
    initialData = [];
    searchData = [];
    @track datatableData = [];
    currentPage = 1;
    recordstodisplay = 5;
    totdalRecordsSize = 0;
    isSearch = false;    
    actionType;
    isModalOpen = false;
    isShowSpinner = true;
    @track wireResult = [];
    currenctRecord = {"Id":null, "Name":"","Title__c":"", "Status__c":"", "DueDate__c":"", "Description__c":""};


    //wire function will be called to get all the assignment records
    @wire(getAssignmentRecords, {})
    apexResponse(result){
        this.wireResult = result;        
            if (this.wireResult.data) { 
                let data = JSON.parse(JSON.stringify(this.wireResult.data));   
                data.forEach(res => {
                    res.TitleLink = '/' + res.Id;
                });
                this.initialData = data;
                this.totdalRecordsSize = data.length;
                this.displayRecords(this.recordstodisplay,data);
            }
            if(this.wireResult.error){
                this.isShowSpinner = false;
                this.showToast('Error','Unable to Fetch the Records','error');
            }        
    }

    //Function is used to filter record based on title field
    handleSearch(event){
        let searchKey = event.target.value;        
        this.currentPage = 1;
        this.showSpinner();
        if(searchKey){
            let searchRecords = [];
            for (let record of this.initialData) {                            
                const strVal = record.Title__c;
                    if (strVal && strVal.toLowerCase().includes(searchKey.toLowerCase())) {                          
                            searchRecords.push(record);                                             
                    }
            }            
            this.totdalRecordsSize = searchRecords.length;
            this.searchData  = searchRecords;
            this.isSearch = true;            
            this.displayRecords(this.recordstodisplay,searchRecords);            
        }
        else{  
            this.isSearch = false;
            this.totdalRecordsSize = this.initialData.length;          
            this.displayRecords(this.recordstodisplay,this.initialData);
        }        
    }

    //Function is used to display records with pagination
    displayRecords(recordstodisplay,datatablerecords){                       
        let finalTable = [];
        let counter = (this.currentPage-1 >= 0 ? this.currentPage-1 : 0) * recordstodisplay;
        let j=0;
        for(let i = counter; i < datatablerecords.length ; i++){
            if(j < recordstodisplay){
                finalTable.push(datatablerecords[i]);
                j++;
            }                
            else
                break;
        }
        this.datatableData = finalTable; 
        this.noSpinner();       
    }  

    //Function will be called when edit actions is performed in row
    handleRowActions(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;    
        console.log('row-->'+JSON.stringify(row));
        switch (actionName) {
            case 'Edit':
                this.currenctRecord = row;                
                this.actionType = 'Edit';
                this.isModalOpen = true;
                break;
        }
    }

    //Function will be called when new button is clicked
    handleClick(){                  
        this.actionType = 'New';
        this.currenctRecord = {"Id":null, "Name":"","Title__c":"", "Status__c":"", "DueDate__c":"", "Description__c":""};
        this.isModalOpen = true;
    }

    //Function will be called when save button is clicked on modal
    submitDetails(){
        this.showSpinner();
        this.template.querySelector('c-assignment-form').handleSave();
    }

    //Function will be called after the records id created or updated
    saveRecords(){
        refreshApex(this.wireResult);
        this.closeModal();
        this.showToast('Success','Record has been saved successfully.','success');        
    }

    //Function will be called when an error occurs in save operation
    onSaveError(event){
        this.closeModal();
        this.showToast('Error',event.detail.errormessage,'error');        
    }

    //Function is used to close the modal
    closeModal(){
        this.isModalOpen = false;
        this.noSpinner();
    }

    //Function is used to show the spinner in table
    showSpinner(){
        this.isShowSpinner = true;   
    }

    //Function is used to hide the spinner in table
    noSpinner(){
        this.isShowSpinner = false; 
    }     

    //Function is used to naivagate through table during pagination
    handlePreviousNext(event){
        console.log(event.target.title);
        const dataToSend = this.isSearch ? this.searchData : this.initialData;
        switch(event.target.title){
            case 'Next':
                this.currentPage = this.currentPage+1;                
                this.displayRecords(this.recordstodisplay,dataToSend);  
                break;
            case 'Previous':
                this.currentPage = this.currentPage-1;
                this.displayRecords(this.recordstodisplay,dataToSend);  
                break;
            default:
                break;
        }      
    }

    //getter to get the total pages
    get getTotalPage(){
        const quotient = Math.floor(this.totdalRecordsSize / this.recordstodisplay);         
        const remainder = this.totdalRecordsSize % this.recordstodisplay;         
        let noofpages = remainder != 0 ? quotient+1 : quotient;           
        return Number(noofpages);
    }

    //getter to check the previous button is enabled or not in pagination
    get isPreviousdisabled(){        
        return ( (this.currentPage <= this.getTotalPage) && (this.currentPage > 1 ) ) ? false : true;
    }

    //getter to check the next button is enabled or not in pagination
    get isNextdisabled(){        
        return this.currentPage < this.getTotalPage ? false : true;
    }

    //getter to check the total size of records
    get initialDataSize(){
        return this.initialData.length > 0;
    }

    //getter to check the size of records in current user view
    get dataSize(){
        return this.datatableData.length > 0;
    }

    //getter to get the columns
    //Displayed name field in table as well as input form, as name field is the required field for the object.
    get columns(){
        return [
            { label: 'Name', fieldName: 'Name',type:'text' },            
            {
                label: 'Title',
                fieldName: 'TitleLink',
                type: 'url',
                typeAttributes: { label: { fieldName: 'Title__c' }, target: '_blank',tooltip: { fieldName: 'Title__c' } }
            },
            { label: 'Status', fieldName: 'Status__c', type: 'text' },                        
            { label: 'Due Date', fieldName: 'DueDate__c', type: 'date' },
            { label: 'Description', fieldName: 'Description__c', type: 'text' },
            { type: 'action', typeAttributes: { rowActions: actions }}
        ];
    }

    //function to display toast message
    showToast(title,message,variant) {
        const event = new ShowToastEvent({
            title: title,
            message:message,
            variant:variant            
        });
        this.dispatchEvent(event);
    }
}