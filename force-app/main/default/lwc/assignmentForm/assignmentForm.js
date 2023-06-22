import { LightningElement,api } from 'lwc';
import NAME_FIELD from '@salesforce/schema/Assignment__c.Name';
import TITLE_FIELD from '@salesforce/schema/Assignment__c.Title__c';
import DESCRIPTION_FIELD from '@salesforce/schema/Assignment__c.Description__c';
import DUEDATE_FIELD from '@salesforce/schema/Assignment__c.DueDate__c';
import STATUS_FIELD from '@salesforce/schema/Assignment__c.Status__c';

export default class AssignmentForm extends LightningElement {

    @api recordId;
    @api  objectName;    

    nameField = NAME_FIELD;
    titleField = TITLE_FIELD;
    descField = DESCRIPTION_FIELD;
    dueDateField = DUEDATE_FIELD;
    statusField = STATUS_FIELD;       

    handleSuccess(event){
        this.dispatchEvent(new CustomEvent('save'));
    }

    handleCancel(){
        this.dispatchEvent(new CustomEvent('cancel'));
    }

}