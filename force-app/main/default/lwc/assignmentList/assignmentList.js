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
    recordstodisplay = 3;
    totdalRecordsSize = 0;
    isSearch = false;
    editRecordId;
    actionType;
    isModalOpen = false;
    isShowSpinner = true;
    @track wireResult = [];


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

    get initialDataSize(){
        return this.initialData.length > 0;
    }

    get dataSize(){
        return this.datatableData.length > 0;
    }

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

    showToast(title,message,variant) {
        const event = new ShowToastEvent({
            title: title,
            message:message,
            variant:variant            
        });
        this.dispatchEvent(event);
    }

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

    handleRowActions(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;        
        switch (actionName) {
            case 'Edit':
                this.editRecordId = row.Id;            
                this.actionType = 'Edit';
                this.isModalOpen = true;
                break;
        }
    }

    handleClick(){
        this.editRecordId = null;            
        this.actionType = 'New';
        this.isModalOpen = true;
    }

    saveRecords(){
        refreshApex(this.wireResult);
        this.closeModal();
        this.showToast('Success','Record has been saved successfully.','success');
        this.noSpinner();
    }

    onSaveError(event){
        this.closeModal();
        this.showToast('Error',event.detail.errormessage,'error');
        this.noSpinner();
    }

    closeModal(){
        this.isModalOpen = false;
    }

    showSpinner(){
        this.isShowSpinner = true;   
    }

    noSpinner(){
        this.isShowSpinner = false; 
    }     

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

    get getTotalPage(){
        const quotient = Math.floor(this.totdalRecordsSize / this.recordstodisplay);         
        const remainder = this.totdalRecordsSize % this.recordstodisplay;         
        let noofpages = remainder != 0 ? quotient+1 : quotient;           
        return Number(noofpages);
    }

    get isPreviousdisabled(){        
        return ( (this.currentPage <= this.getTotalPage) && (this.currentPage > 1 ) ) ? false : true;
    }

    get isNextdisabled(){        
        return this.currentPage < this.getTotalPage ? false : true;
    }
}