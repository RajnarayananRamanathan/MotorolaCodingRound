import { LightningElement,api,wire} from 'lwc';
import STATUS_FIELD from '@salesforce/schema/Assignment__c.Status__c';
import ASSIGNMENT_OBJECT from '@salesforce/schema/Assignment__c';
import { getPicklistValues,getObjectInfo } from 'lightning/uiObjectInfoApi';
import saveAssignment from '@salesforce/apex/assignmentListController.saveAssignment';


export default class AssignmentForm extends LightningElement {

    @api row;    

    //wire function will be called to get assignment object info
    @wire(getObjectInfo, { objectApiName: ASSIGNMENT_OBJECT })
    assignmentInfo;

    //wire function will be called to get status field picklist values
    @wire(getPicklistValues, { recordTypeId: '$assignmentInfo.data.defaultRecordTypeId', fieldApiName: STATUS_FIELD})
    statusValues;

    //Function will be called when a record is created or updated
    @api
    handleSave(){
        console.log('Save row--->'+JSON.stringify(this.row)); 
        if(this.handleValidation()){
            saveAssignment({record:this.row}).then(result=>{            
                this.dispatchEvent(new CustomEvent('save'));
            }).catch(error=>{            
                this.dispatchEvent(new CustomEvent('errorsave',{detail : {errormessage:'Record Save Failed'}}));
            });
        }           
    }

    //Function will be called to check required fields
    handleValidation(){
        console.log('Inn handleValidation');
        let nameCmp = this.template.querySelector(".nameCls");
        
        let result = true;
        if (!nameCmp.value) {
            console.log('Inn if');
            result = false;
            nameCmp.setCustomValidity("Name value is required");
        } else {
            console.log('Inn else');
            nameCmp.setCustomValidity(""); // clear previous value
        }
        nameCmp.reportValidity();
        return result;
    }

    //Function will be called when field in the form is modified
    handleChange(event){                
        let obj= {};       
        for (const key of Object.keys(this.row)) {
            const val = this.row[key];
            if(key === event.target.name){
                obj[key] = event.target.value;
            }
            else{
                obj[key] = val;
            }
        }
        this.row = obj;        
    }
}