# Learn SOQL

## What is SOQL
SOQL is a language that gets record data from a Salesforce database.

## Example

First let's create a contact in our DB

```apex 
// Create a new Contact record
Contact newContact = new Contact();
newContact.LastName = 'Sample Contact';
newContact.FirstName = 'Explorer';

// Insert the new Contact record into the database
insert newContact;

// Output some debug information
System.debug('New Contact created with Id: ' + newContact.Id);
```

Then try to find it

```soql
Select id from Contact where FirstName = 'Explorer'
```


You can execute this same query in apex:


```apex 
List<Contact> listOfContacts = [SELECT FirstName, LastName FROM Contact where FirstName = 'Explorer'];
system.debug(listOfContacts);
```

> [!CAUTION]
> Never use DML in loops, this count toward your governor limits
