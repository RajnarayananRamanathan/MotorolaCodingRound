public with sharing class assignmentListController {
    
    @AuraEnabled(cacheable=true)
    public static List<Assignment__c> getAssignmentRecords() {       
        return [
            SELECT Id, Name,Title__c, Status__c, DueDate__c, Description__c
            FROM Assignment__c WITH SECURITY_ENFORCED ORDER BY DueDate__c ASC        
        ];
    }    
    
    @AuraEnabled
    public static void saveAssignment(Assignment__c record) {       
        Assignment__c assignmentRecord = new Assignment__c(Id=record.id,Status__c=record.Status__c,
                                                           Name=record.Name,
                                                           Title__c=record.Title__c,
                                                           DueDate__c=record.DueDate__c,
                                                           Description__c=record.Description__c);
        UPSERT assignmentRecord;
    } 
}