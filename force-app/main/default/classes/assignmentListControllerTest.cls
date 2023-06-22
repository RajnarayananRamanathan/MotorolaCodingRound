@isTest
private class assignmentListControllerTest {
    @testSetup static void setup() {
        // Create common test accounts
        List<Assignment__c> testAssignments = new List<Assignment__c>();
        for(Integer i=0;i<10;i++) {
            testAssignments.add(new Assignment__c(Name = 'TestAssignment'+i));
        }
        insert testAssignments;
    }
    
    @isTest static void getAssignmentRecordsTest() {
        Test.startTest();
        List<Assignment__c> assignmentRecords = assignmentListController.getAssignmentRecords();
        Assert.areEqual(true, assignmentRecords.size()>0);
        Test.stopTest();        
    }
}