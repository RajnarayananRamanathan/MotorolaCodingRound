@isTest
private class assignmentListControllerTest {
    @testSetup static void setup() {
        // Create common test assignments
        List<Assignment__c> testAssignments = new List<Assignment__c>();
        for(Integer i=0;i<10;i++) {
            testAssignments.add(new Assignment__c(Name = 'TestAssignment'+i,Title__c = 'TestAssignment'+i));
        }
        insert testAssignments;
    }
    
    @isTest static void getAssignmentRecordsTest() {
        Test.startTest();
        List<Assignment__c> assignmentRecords = assignmentListController.getAssignmentRecords();
        Assert.areEqual(true, assignmentRecords.size()>0);
        Test.stopTest();        
    }
    
    @isTest static void saveAssignmentTest() {
        Test.startTest();
        Assignment__c rec = [SELECT Id, Name,Title__c, Status__c, DueDate__c, Description__c
                             FROM Assignment__c WITH SECURITY_ENFORCED LIMIT 1];
        rec.Title__c = 'Maths';
        assignmentListController.saveAssignment(rec);
        Assignment__c result = [SELECT Id, Name,Title__c FROM Assignment__c WHERE Id =: rec.id WITH SECURITY_ENFORCED];
        Assert.areEqual('Maths', result.Title__c);
        Test.stopTest();        
    }
}